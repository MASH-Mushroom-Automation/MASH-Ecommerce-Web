import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/otp/send
 *
 * Generate a 6-digit OTP, store hashed version in Firestore, and
 * (when Twilio is configured) send it via SMS.
 *
 * In development mode (or when Twilio is not configured), the OTP code
 * is returned in the response body as `devCode` so the full flow can
 * be tested without a real SMS provider.
 */

// ── helpers ────────────────────────────────────────────────────────

function generateOTP(): string {
  // Use crypto.randomInt for cryptographically secure OTP generation (Node 16+)
  const { randomInt } = require("crypto");
  return randomInt(100000, 999999).toString();
}

function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  const last2 = phone.slice(-2);
  return `${phone.slice(0, 4)} *** *** **${last2}`;
}

// Simple hash – bcrypt is a Node C-addon that doesn't work in Next.js
// Edge/serverless. We use a lightweight SHA-256 approach instead.
async function hashCode(code: string): Promise<string> {
  const { createHash } = await import("crypto");
  return createHash("sha256").update(code).digest("hex");
}

// ── Firestore (client SDK – works in Next.js server components) ────

async function getDb() {
  const { getFirestore } = await import("firebase/firestore");
  const { firebaseApp } = await import("@/lib/firebase/config");
  return getFirestore(firebaseApp);
}

// ── rate-limit check (per phone, 3 sends / 15 min) ────────────────

async function isRateLimited(phoneNumber: string): Promise<boolean> {
  const { collection, query, where, getDocs } = await import(
    "firebase/firestore"
  );
  const db = await getDb();

  // Use single-field query (auto-indexed) to avoid composite index requirement.
  // Filter by time window in application code.
  const q = query(
    collection(db, "otp_verifications"),
    where("phoneNumber", "==", phoneNumber)
  );

  const snap = await getDocs(q);

  // Count only documents created within the last 15 minutes
  const windowStart = Date.now() - 15 * 60 * 1000;
  let recentCount = 0;
  snap.forEach((d) => {
    const data = d.data();
    const createdMs =
      data.createdAt?.toDate?.()?.getTime?.() ??
      (data.createdAt?.seconds ? data.createdAt.seconds * 1000 : 0);
    if (createdMs >= windowStart) recentCount++;
  });

  return recentCount >= 3;
}

// ── handler ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, purpose = "PHONE_VERIFICATION" } = body as {
      phoneNumber?: string;
      purpose?: string;
    };

    // Validate phone number
    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json(
        { success: false, data: null, message: "Phone number is required" },
        { status: 400 }
      );
    }

    // Normalise to E.164
    let normalised = phoneNumber.replace(/[\s\-()]/g, "");
    if (normalised.startsWith("0")) {
      normalised = "+63" + normalised.slice(1);
    } else if (normalised.startsWith("63") && !normalised.startsWith("+63")) {
      normalised = "+" + normalised;
    } else if (!normalised.startsWith("+")) {
      normalised = "+63" + normalised;
    }

    if (!/^\+63\d{10}$/.test(normalised)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message:
            "Invalid Philippine phone number. Expected format: +63XXXXXXXXXX",
        },
        { status: 400 }
      );
    }

    // Rate-limit
    if (await isRateLimited(normalised)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message:
            "Too many OTP requests. Please wait 15 minutes before trying again.",
        },
        { status: 429 }
      );
    }

    // Generate OTP
    const code = generateOTP();
    const hashed = await hashCode(code);

    // Store in Firestore
    const {
      collection: col,
      doc,
      setDoc,
      serverTimestamp,
      Timestamp,
    } = await import("firebase/firestore");
    const db = await getDb();

    const verificationRef = doc(col(db, "otp_verifications"));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    const ttlExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // We need a userId – try to infer from cookies or make it phone-based
    // For the local implementation, use the phone number hash as a pseudo-userId
    // Real userId will be provided by the client (through auth cookie) if available
    const userId = body.userId || `phone:${normalised}`;

    await setDoc(verificationRef, {
      id: verificationRef.id,
      userId,
      phoneNumber: normalised,
      hashedCode: hashed,
      purpose,
      attempts: 0,
      maxAttempts: 3,
      verified: false,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      _expiresAt: Timestamp.fromDate(ttlExpiresAt),
    });

    console.log(
      `[OTP] Code ${code} generated for ${normalised} (verification: ${verificationRef.id})`
    );

    // Build response
    const masked = maskPhone(normalised);
    const responseData: Record<string, unknown> = {
      success: true,
      message: `Verification code sent to ${masked}`,
      phoneNumber: masked,
      expiresAt: expiresAt.toISOString(),
      expiresIn: 300,
      verificationId: verificationRef.id,
    };

    // In dev / when Twilio is NOT configured → include the code so the user
    // can complete the flow without real SMS delivery.
    const twilioConfigured =
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_ACCOUNT_SID !== "YOUR_TEST_ACCOUNT_SID";

    if (!twilioConfigured) {
      responseData.devCode = code;
      responseData.message = `[DEV] Verification code for ${masked}: ${code}`;
      console.log(`[OTP][DEV] OTP code for ${normalised}: ${code}`);
    } else {
      // Send via Twilio
      try {
        const { sendOTP: twilioSend } = await import("@/lib/sms/twilio");
        const smsResult = await twilioSend(normalised, code, userId);
        if (!smsResult.success) {
          console.warn(`[OTP] Twilio SMS failed (${smsResult.error}), falling back to dev mode`);
          responseData.devCode = code;
          responseData.message = `[DEV-FALLBACK] SMS delivery failed. Code for ${masked}: ${code}`;
        } else {
          console.log(`[OTP] SMS sent via Twilio to ${normalised}, SID: ${smsResult.messageSid}`);
        }
      } catch (smsErr) {
        console.error("[OTP] Twilio send failed, returning code in dev mode:", smsErr);
        responseData.devCode = code;
        responseData.message = `[DEV-FALLBACK] Twilio failed. Code for ${masked}: ${code}`;
      }
    }

    return NextResponse.json(
      { success: true, data: responseData },
      { status: 200 }
    );
  } catch (error) {
    console.error("[OTP] Send error:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Failed to send OTP",
      },
      { status: 500 }
    );
  }
}
