import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/otp/resend
 *
 * Resend an OTP code for an existing verification.
 * Generates a NEW code (old one is invalidated), enforces 60s cooldown.
 */

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
      orderBy,
      limit,
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

    // Dev mode – include code
    const twilioConfigured =
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_ACCOUNT_SID !== "YOUR_TEST_ACCOUNT_SID";

    if (!twilioConfigured) {
      responseData.devCode = code;
      responseData.message = `[DEV] Resent code for ${masked}: ${code}`;
    } else {
      try {
        const { sendOTP: twilioSend } = await import("@/lib/sms/twilio");
        await twilioSend(verification.phoneNumber, code, verification.userId);
      } catch (smsErr) {
        console.error("[OTP] Twilio resend failed:", smsErr);
        responseData.devCode = code;
        responseData.message = `[DEV-FALLBACK] Twilio failed. Code for ${masked}: ${code}`;
      }
    }

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
