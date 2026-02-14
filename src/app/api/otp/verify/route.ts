import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/otp/verify
 *
 * Verify a 6-digit OTP code against the hashed value stored in Firestore.
 * Tracks failed attempts and locks after 3 failures.
 */

async function hashCode(code: string): Promise<string> {
  const { createHash } = await import("crypto");
  return createHash("sha256").update(code).digest("hex");
}

async function getDb() {
  const { getFirestore } = await import("firebase/firestore");
  const { firebaseApp } = await import("@/lib/firebase/config");
  return getFirestore(firebaseApp);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, code, verificationId } = body as {
      phoneNumber?: string;
      code?: string;
      verificationId?: string;
    };

    if (!code || typeof code !== "string" || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, data: null, message: "A valid 6-digit code is required" },
        { status: 400 }
      );
    }

    const {
      collection,
      query,
      where,
      getDocs,
      doc,
      getDoc,
      updateDoc,
      serverTimestamp,
      orderBy,
      limit,
    } = await import("firebase/firestore");
    const db = await getDb();

    // Resolve the verification record ─────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let verification: any = null;
    let verificationRef;

    if (verificationId) {
      // Direct lookup by ID
      verificationRef = doc(db, "otp_verifications", verificationId);
      const snap = await getDoc(verificationRef);
      if (snap.exists()) verification = snap.data();
    }

    if (!verification && phoneNumber) {
      // Normalise phone
      let normalised = phoneNumber.replace(/[\s\-()]/g, "");
      if (normalised.startsWith("0"))
        normalised = "+63" + normalised.slice(1);
      else if (normalised.startsWith("63") && !normalised.startsWith("+63"))
        normalised = "+" + normalised;
      else if (!normalised.startsWith("+")) normalised = "+63" + normalised;

      // Find latest unverified OTP for this phone
      const q = query(
        collection(db, "otp_verifications"),
        where("phoneNumber", "==", normalised),
        where("verified", "==", false),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        verification = snap.docs[0].data();
        verificationRef = snap.docs[0].ref;
      }
    }

    if (!verification || !verificationRef) {
      return NextResponse.json(
        {
          success: false,
          data: { verified: false, message: "No pending OTP found. Please request a new code." },
          message: "No pending OTP found. Please request a new code.",
        },
        { status: 404 }
      );
    }

    // Check expiry ─────────────────────────────────────────────────────
    const expiresAt =
      verification.expiresAt?.toDate?.() ??
      new Date(verification.expiresAt?.seconds * 1000);

    if (expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          data: { verified: false, message: "OTP has expired. Please request a new code." },
          message: "OTP has expired. Please request a new code.",
        },
        { status: 410 }
      );
    }

    // Check attempt lock ───────────────────────────────────────────────
    if (verification.attempts >= (verification.maxAttempts || 3)) {
      return NextResponse.json(
        {
          success: false,
          data: {
            verified: false,
            message: "Too many failed attempts. Please request a new code.",
            attemptsRemaining: 0,
          },
          message: "Too many failed attempts. Please request a new code.",
        },
        { status: 429 }
      );
    }

    // Compare hash ─────────────────────────────────────────────────────
    const hashedInput = await hashCode(code);
    const isMatch = hashedInput === verification.hashedCode;

    if (!isMatch) {
      // Increment attempts
      const newAttempts = (verification.attempts || 0) + 1;
      await updateDoc(verificationRef, {
        attempts: newAttempts,
        updatedAt: serverTimestamp(),
      });

      const remaining = Math.max(0, (verification.maxAttempts || 3) - newAttempts);

      return NextResponse.json(
        {
          success: true,
          data: {
            verified: false,
            success: false,
            message: `Invalid code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
            attemptsRemaining: remaining,
          },
          message: `Invalid code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
        },
        { status: 200 }
      );
    }

    // Match! Mark as verified ──────────────────────────────────────────
    await updateDoc(verificationRef, {
      verified: true,
      updatedAt: serverTimestamp(),
    });

    console.log(
      `[OTP] Phone ${verification.phoneNumber} verified successfully (id: ${verification.id})`
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          verified: true,
          success: true,
          message: "Phone number verified successfully!",
          phoneNumber: verification.phoneNumber,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[OTP] Verify error:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Failed to verify OTP",
      },
      { status: 500 }
    );
  }
}
