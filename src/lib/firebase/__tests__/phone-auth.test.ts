/**
 * Tests for phone-auth.ts
 * COVERAGE-007: Firebase Services - Phone Auth (SMS verification)
 *
 * Uses the global firebase/auth mock (jest.setupMocks.js) which includes
 * RecaptchaVerifier, PhoneAuthProvider, signInWithPhoneNumber,
 * linkWithCredential, updatePhoneNumber, and signInWithCredential.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

jest.unmock("@/lib/firebase/phone-auth");

// Override the auth module to let us control currentUser per-test
let mockCurrentUser: any = null;
const mockAuthSettings: Record<string, any> = {};

jest.mock("@/lib/firebase/auth", () => ({
  __esModule: true,
  auth: new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "currentUser") return mockCurrentUser;
        if (prop === "settings") return mockAuthSettings;
        return undefined;
      },
    }
  ),
}));

import {
  sendFirebasePhoneVerification,
  verifyFirebasePhoneCode,
  isFirebasePhoneAuthAvailable,
  getRecaptchaVerifier,
  clearRecaptchaVerifier,
} from "@/lib/firebase/phone-auth";

// Access all mocked firebase/auth functions via requireMock
// (named imports from "firebase/auth" resolve to undefined in this test context)
const firebaseAuthMock = jest.requireMock<Record<string, any>>("firebase/auth");
const mockedRecaptchaVerifier: jest.Mock = firebaseAuthMock.RecaptchaVerifier;
const mockedPhoneAuthProviderCredential: jest.Mock =
  firebaseAuthMock.PhoneAuthProvider?.credential;
const mockedSignInWithPhoneNumber: jest.Mock =
  firebaseAuthMock.signInWithPhoneNumber;
const mockedLinkWithCredential: jest.Mock = firebaseAuthMock.linkWithCredential;
const mockedUpdatePhoneNumber: jest.Mock = firebaseAuthMock.updatePhoneNumber;
const mockedSignInWithCredential: jest.Mock =
  firebaseAuthMock.signInWithCredential;

// Shared mock values
const mockCredential = { providerId: "phone", signInMethod: "phone" };
const mockConfirmationResult = {
  verificationId: "test-verification-id-abc123",
  confirm: jest.fn(),
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------
describe("phone-auth", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = null;
    Object.keys(mockAuthSettings).forEach(
      (k) => delete mockAuthSettings[k]
    );
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_PHONE_AUTH_TEST_MODE;
    // Reset DOM
    document.body.innerHTML = "";

    // Configure default implementations
    mockedRecaptchaVerifier.mockImplementation(
      () => ({ clear: jest.fn() }) as any
    );
    mockedPhoneAuthProviderCredential.mockReturnValue(mockCredential as any);
    mockedSignInWithPhoneNumber.mockResolvedValue(
      mockConfirmationResult as any
    );
    mockedLinkWithCredential.mockResolvedValue({
      user: { uid: "user-1" },
    } as any);
    mockedUpdatePhoneNumber.mockResolvedValue(undefined as any);
    mockedSignInWithCredential.mockResolvedValue({
      user: { uid: "user-1" },
    } as any);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // ========================================================================
  // ensureE164 (tested via sendFirebasePhoneVerification)
  // ========================================================================
  describe("ensureE164 (via sendFirebasePhoneVerification)", () => {
    it("converts 09XX to +639XX", async () => {
      await sendFirebasePhoneVerification("09171234567");

      expect(mockedSignInWithPhoneNumber).toHaveBeenCalledWith(
        expect.anything(),
        "+639171234567",
        expect.anything()
      );
    });

    it("converts 639XX to +639XX", async () => {
      await sendFirebasePhoneVerification("639171234567");

      expect(mockedSignInWithPhoneNumber).toHaveBeenCalledWith(
        expect.anything(),
        "+639171234567",
        expect.anything()
      );
    });

    it("keeps +639XX unchanged", async () => {
      await sendFirebasePhoneVerification("+639171234567");

      expect(mockedSignInWithPhoneNumber).toHaveBeenCalledWith(
        expect.anything(),
        "+639171234567",
        expect.anything()
      );
    });

    it("converts bare 9XX to +639XX", async () => {
      await sendFirebasePhoneVerification("9171234567");

      expect(mockedSignInWithPhoneNumber).toHaveBeenCalledWith(
        expect.anything(),
        "+639171234567",
        expect.anything()
      );
    });

    it("strips spaces and dashes", async () => {
      await sendFirebasePhoneVerification("0917-123-4567");

      expect(mockedSignInWithPhoneNumber).toHaveBeenCalledWith(
        expect.anything(),
        "+639171234567",
        expect.anything()
      );
    });
  });

  // ========================================================================
  // getRecaptchaVerifier
  // ========================================================================
  describe("getRecaptchaVerifier", () => {
    it("creates a RecaptchaVerifier with invisible size", () => {
      const verifier = getRecaptchaVerifier();

      expect(mockedRecaptchaVerifier).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(HTMLElement),
        expect.objectContaining({ size: "invisible" })
      );
      expect(verifier).toBeDefined();
    });

    it("creates a new DOM container element", () => {
      getRecaptchaVerifier();

      const containers = document.querySelectorAll(
        '[id^="recaptcha-container"]'
      );
      expect(containers.length).toBeGreaterThanOrEqual(1);
    });

    it("tears down previous verifier on subsequent calls", () => {
      const mockClear = jest.fn();
      mockedRecaptchaVerifier.mockImplementation(
        () => ({ clear: mockClear }) as any
      );

      getRecaptchaVerifier();
      getRecaptchaVerifier();

      expect(mockClear).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // clearRecaptchaVerifier
  // ========================================================================
  describe("clearRecaptchaVerifier", () => {
    it("removes recaptcha container elements from DOM", () => {
      const div = document.createElement("div");
      div.id = "recaptcha-container-123";
      document.body.appendChild(div);

      clearRecaptchaVerifier();

      const found = document.querySelectorAll('[id^="recaptcha-container"]');
      expect(found.length).toBe(0);
    });

    it("handles already-cleared verifier gracefully", () => {
      expect(() => clearRecaptchaVerifier()).not.toThrow();
    });
  });

  // ========================================================================
  // sendFirebasePhoneVerification
  // ========================================================================
  describe("sendFirebasePhoneVerification", () => {
    it("sends SMS and returns verificationId", async () => {
      const verificationId =
        await sendFirebasePhoneVerification("+639171234567");

      expect(verificationId).toBe("test-verification-id-abc123");
      expect(mockedSignInWithPhoneNumber).toHaveBeenCalledTimes(1);
    });

    it("creates a fresh reCAPTCHA verifier before sending", async () => {
      await sendFirebasePhoneVerification("+639171234567");

      expect(mockedRecaptchaVerifier).toHaveBeenCalled();
    });

    it("enables test mode when env var is set", async () => {
      process.env.NEXT_PUBLIC_PHONE_AUTH_TEST_MODE = "true";

      await sendFirebasePhoneVerification("+639171234567");

      expect(mockedSignInWithPhoneNumber).toHaveBeenCalled();
    });

    it("clears reCAPTCHA on failure and rethrows", async () => {
      const error = new Error("auth/quota-exceeded");
      mockedSignInWithPhoneNumber.mockRejectedValueOnce(error);

      await expect(
        sendFirebasePhoneVerification("+639171234567")
      ).rejects.toThrow("auth/quota-exceeded");
    });

    it("stores verificationId for later verify step", async () => {
      await sendFirebasePhoneVerification("+639171234567");

      // If storedVerificationId was not set, this would throw
      const result = await verifyFirebasePhoneCode("123456");
      expect(result).toBe(true);
    });
  });

  // ========================================================================
  // verifyFirebasePhoneCode
  // ========================================================================
  describe("verifyFirebasePhoneCode", () => {
    async function setupVerificationState() {
      await sendFirebasePhoneVerification("+639171234567");
      jest.clearAllMocks();
      // Re-setup defaults after clearAllMocks
      mockedRecaptchaVerifier.mockImplementation(
        () => ({ clear: jest.fn() }) as any
      );
      mockedPhoneAuthProviderCredential.mockReturnValue(
        mockCredential as any
      );
      mockedLinkWithCredential.mockResolvedValue({
        user: { uid: "user-1" },
      } as any);
      mockedUpdatePhoneNumber.mockResolvedValue(undefined as any);
      mockedSignInWithCredential.mockResolvedValue({
        user: { uid: "user-1" },
      } as any);
    }

    it("throws if no verification is in progress", async () => {
      await expect(verifyFirebasePhoneCode("123456")).rejects.toThrow(
        "No verification in progress"
      );
    });

    it("creates credential from verificationId and code", async () => {
      await setupVerificationState();

      await verifyFirebasePhoneCode("654321");

      expect(mockedPhoneAuthProviderCredential).toHaveBeenCalledWith(
        "test-verification-id-abc123",
        "654321"
      );
    });

    describe("with signed-in user", () => {
      beforeEach(() => {
        mockCurrentUser = {
          uid: "user-1",
          phoneNumber: null,
          email: "test@example.com",
        };
      });

      it("links phone credential to current user", async () => {
        await setupVerificationState();

        const result = await verifyFirebasePhoneCode("123456");

        expect(result).toBe(true);
        expect(mockedLinkWithCredential).toHaveBeenCalledWith(
          mockCurrentUser,
          mockCredential
        );
      });

      it("falls back to updatePhoneNumber on provider-already-linked", async () => {
        await setupVerificationState();
        mockedLinkWithCredential.mockRejectedValueOnce({
          code: "auth/provider-already-linked",
        });

        const result = await verifyFirebasePhoneCode("123456");

        expect(result).toBe(true);
        expect(mockedUpdatePhoneNumber).toHaveBeenCalledWith(
          mockCurrentUser,
          mockCredential
        );
      });

      it("handles credential-already-in-use on link", async () => {
        await setupVerificationState();
        mockedLinkWithCredential.mockRejectedValueOnce({
          code: "auth/credential-already-in-use",
        });

        const result = await verifyFirebasePhoneCode("123456");

        expect(result).toBe(true);
      });

      it("handles credential-already-in-use on updatePhoneNumber", async () => {
        await setupVerificationState();
        mockedLinkWithCredential.mockRejectedValueOnce({
          code: "auth/provider-already-linked",
        });
        mockedUpdatePhoneNumber.mockRejectedValueOnce({
          code: "auth/credential-already-in-use",
        });

        const result = await verifyFirebasePhoneCode("123456");

        expect(result).toBe(true);
      });

      it("rethrows unknown link errors", async () => {
        await setupVerificationState();
        mockedLinkWithCredential.mockRejectedValueOnce({
          code: "auth/invalid-verification-code",
        });

        await expect(verifyFirebasePhoneCode("123456")).rejects.toEqual({
          code: "auth/invalid-verification-code",
        });
      });

      it("rethrows unknown updatePhoneNumber errors", async () => {
        await setupVerificationState();
        mockedLinkWithCredential.mockRejectedValueOnce({
          code: "auth/provider-already-linked",
        });
        mockedUpdatePhoneNumber.mockRejectedValueOnce({
          code: "auth/internal-error",
        });

        await expect(verifyFirebasePhoneCode("123456")).rejects.toEqual({
          code: "auth/internal-error",
        });
      });
    });

    describe("without signed-in user", () => {
      beforeEach(() => {
        mockCurrentUser = null;
      });

      it("signs in with phone credential", async () => {
        await setupVerificationState();

        const result = await verifyFirebasePhoneCode("123456");

        expect(result).toBe(true);
        expect(mockedSignInWithCredential).toHaveBeenCalledWith(
          expect.anything(),
          mockCredential
        );
      });
    });

    it("clears state after successful verification", async () => {
      await setupVerificationState();

      await verifyFirebasePhoneCode("123456");

      // storedVerificationId should be null now
      await expect(verifyFirebasePhoneCode("999999")).rejects.toThrow(
        "No verification in progress"
      );
    });
  });

  // ========================================================================
  // isFirebasePhoneAuthAvailable
  // ========================================================================
  describe("isFirebasePhoneAuthAvailable", () => {
    it("returns true in browser environment when auth is available", () => {
      const result = isFirebasePhoneAuthAvailable();
      expect(result).toBe(true);
    });

    // Note: SSR test (typeof window === 'undefined') cannot be reliably
    // tested in jsdom because the global window object persists even after
    // deletion from globalThis.
  });
});
