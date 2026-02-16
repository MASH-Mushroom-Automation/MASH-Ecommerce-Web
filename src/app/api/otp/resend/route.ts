import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/otp/resend
 *
 * DEPRECATED: SMS delivery is now handled client-side via Firebase Phone Auth.
 * This route updates the Firestore OTP record for audit/tracking.
 * Firebase Phone Auth sends real SMS through Google's infrastructure.
 */

function generateOTP(): string {
  const { randomInt } = require("crypto");
  return randomInt(100000, 999999).toString();
}

function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return `${phone.slice(0, 4)} *** *** **${phone.slice(-2)}`;
}

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
    const { phoneNumber, verificationId } = body as {
      phoneNumber?: string;
      verificationId?: string;
    };

    const {
      collection,
      query,
      where,
      getDocs,
      doc,
      getDoc,
      updateDoc,
      serverTimestamp,
      Timestamp,
    } = await import("firebase/firestore");
    const db = await getDb();

    // Resolve existing verification ────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let verification: any = null;
    let verificationRef;

    if (verificationId) {
      verificationRef = doc(db, "otp_verifications", verificationId);
      const snap = await getDoc(verificationRef);
      if (snap.exists()) verification = snap.data();
    }

    if (!verification && phoneNumber) {
      let normalised = phoneNumber.replace(/[\s\-()]/g, "");
      if (normalised.startsWith("0"))
        normalised = "+63" + normalised.slice(1);
      else if (normalised.startsWith("63") && !normalised.startsWith("+63"))
        normalised = "+" + normalised;
      else if (!normalised.startsWith("+")) normalised = "+63" + normalised;

      // Use single-field query (auto-indexed) to avoid composite index requirement.
      // Filter by verified status and sort by createdAt in application code.
      const q = query(
        collection(db, "otp_verifications"),
        where("phoneNumber", "==", normalised)
      );
      const snap = await getDocs(q);

      // Find latest unverified OTP for this phone (sort client-side)
      let latestDoc: { data: () => Record<string, unknown>; ref: typeof verificationRef } | null = null;
      let latestCreated = 0;
      snap.forEach((d) => {
        const data = d.data();
        if (data.verified === true) return; // skip verified
        const createdMs =
          data.createdAt?.toDate?.()?.getTime?.() ??
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((data.createdAt as any)?.seconds ? (data.createdAt as any).seconds * 1000 : 0);
        if (createdMs >= latestCreated) {
          latestCreated = createdMs;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          latestDoc = d as any;
        }
      });

      if (latestDoc) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        verification = (latestDoc as any).data();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        verificationRef = (latestDoc as any).ref;
      }
    }

    if (!verification || !verificationRef) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "No pending OTP found. Please request a new code.",
        },
        { status: 404 }
      );
    }

    // Cooldown check (60s since last update) ───────────────────────────
    const lastUpdated =
      verification.updatedAt?.toDate?.() ??
      (verification.updatedAt?.seconds
        ? new Date(verification.updatedAt.seconds * 1000)
        : new Date(0));

    const cooldownMs = 60 * 1000;
    const elapsed = Date.now() - lastUpdated.getTime();

    if (elapsed < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - elapsed) / 1000);
      return NextResponse.json(
        {
          success: false,
          data: {
            cooldownUntil: new Date(
              lastUpdated.getTime() + cooldownMs
            ).toISOString(),
          },
          message: `Please wait ${waitSeconds} seconds before resending.`,
        },
        { status: 429 }
      );
    }

    // Generate new code & update record ────────────────────────────────
    const code = generateOTP();
    const hashed = await hashCode(code);
    const newExpiry = new Date(Date.now() + 5 * 60 * 1000);
    const newTTL = new Date(Date.now() + 10 * 60 * 1000);

    await updateDoc(verificationRef, {
      hashedCode: hashed,
      attempts: 0,
      expiresAt: Timestamp.fromDate(newExpiry),
      _expiresAt: Timestamp.fromDate(newTTL),
      updatedAt: serverTimestamp(),
    });

    console.log(
      `[OTP] Resent code ${code} for ${verification.phoneNumber} (id: ${verification.id})`
    );

    const masked = maskPhone(verification.phoneNumber);
    const responseData: Record<string, unknown> = {
      success: true,
      message: `Verification code resent to ${masked}`,
      phoneNumber: masked,
      expiresAt: newExpiry.toISOString(),
      expiresIn: 300,
      verificationId: verification.id,
    };

    // SMS delivery is handled client-side by Firebase Phone Auth.
    // No Twilio or dev fallback needed.

    return NextResponse.json(
      { success: true, data: responseData },
      { status: 200 }
    );
  } catch (error) {
    console.error("[OTP] Resend error:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Failed to resend OTP",
      },
      { status: 500 }
    );
  }
}
