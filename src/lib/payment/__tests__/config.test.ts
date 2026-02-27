/**
 * Tests for Payment Configuration
 *
 * Tests cover: env variable reading, feature flags, available payment methods,
 * validation logic, config object generation, and COD-only fallback.
 *
 * Because config.ts evaluates module-level constants at require time,
 * each test uses jest.resetModules() + dynamic import() for fresh evaluation.
 */

const savedEnv = process.env;

beforeEach(() => {
  process.env = { ...savedEnv };
  delete process.env.PAYMONGO_SECRET_KEY;
  delete process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY;
  delete process.env.NEXT_PUBLIC_APP_URL;
  jest.resetModules();
});

afterEach(() => {
  process.env = savedEnv;
});

async function loadConfig() {
  return import("../config");
}

describe("Payment Config", () => {
  describe("PAYMONGO_ENABLED", () => {
    it("should be false when both keys are missing", async () => {
      const config = await loadConfig();
      expect(config.PAYMONGO_ENABLED).toBe(false);
    });

    it("should be false when only secret key is set", async () => {
      process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
      const config = await loadConfig();
      expect(config.PAYMONGO_ENABLED).toBe(false);
    });

    it("should be false when only public key is set", async () => {
      process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY = "pk_test_abc";
      const config = await loadConfig();
      expect(config.PAYMONGO_ENABLED).toBe(false);
    });

    it("should be true when both keys are set", async () => {
      process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
      process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY = "pk_test_abc";
      const config = await loadConfig();
      expect(config.PAYMONGO_ENABLED).toBe(true);
    });
  });

  describe("getAvailablePaymentMethods", () => {
    it("should return COD only when PayMongo is not configured", async () => {
      const config = await loadConfig();
      expect(config.getAvailablePaymentMethods()).toEqual(["cod"]);
    });

    it("should return all methods when PayMongo is configured", async () => {
      process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
      process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY = "pk_test_abc";
      const config = await loadConfig();
      const methods = config.getAvailablePaymentMethods();
      expect(methods).toEqual(["cod", "gcash", "grab_pay", "card", "paymaya"]);
    });
  });

  describe("isPaymentMethodAvailable", () => {
    it("should allow COD when PayMongo is not configured", async () => {
      const config = await loadConfig();
      expect(config.isPaymentMethodAvailable("cod")).toBe(true);
    });

    it("should reject gcash when PayMongo is not configured", async () => {
      const config = await loadConfig();
      expect(config.isPaymentMethodAvailable("gcash")).toBe(false);
    });

    it("should allow gcash when PayMongo is configured", async () => {
      process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
      process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY = "pk_test_abc";
      const config = await loadConfig();
      expect(config.isPaymentMethodAvailable("gcash")).toBe(true);
    });
  });

  describe("validatePaymentConfig", () => {
    it("should report warnings when no keys are set", async () => {
      const config = await loadConfig();
      const result = config.validatePaymentConfig();
      expect(result.isValid).toBe(true);
      expect(result.paymongoEnabled).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.availableMethods).toEqual(["cod"]);
    });

    it("should warn when only secret key is set", async () => {
      process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
      const config = await loadConfig();
      const result = config.validatePaymentConfig();
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining("NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY is not set"),
        ])
      );
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining("PAYMONGO_SECRET_KEY is set but"),
        ])
      );
    });

    it("should warn when only public key is set", async () => {
      process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY = "pk_test_abc";
      const config = await loadConfig();
      const result = config.validatePaymentConfig();
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining("PAYMONGO_SECRET_KEY is not set"),
        ])
      );
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining("NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY is set but"),
        ])
      );
    });

    it("should have no warnings when both keys are set", async () => {
      process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
      process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY = "pk_test_abc";
      const config = await loadConfig();
      const result = config.validatePaymentConfig();
      expect(result.isValid).toBe(true);
      expect(result.paymongoEnabled).toBe(true);
      expect(result.warnings).toHaveLength(0);
      expect(result.availableMethods).toEqual([
        "cod",
        "gcash",
        "grab_pay",
        "card",
        "paymaya",
      ]);
    });
  });

  describe("logPaymentConfigWarnings", () => {
    it("should log warnings when PayMongo is not configured", async () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation();
      const config = await loadConfig();
      config.logPaymentConfigWarnings();
      expect(warnSpy).toHaveBeenCalled();
      const calls = warnSpy.mock.calls.flat().join(" ");
      expect(calls).toContain("COD-only mode");
      warnSpy.mockRestore();
    });

    it("should log success when PayMongo is configured", async () => {
      process.env.PAYMONGO_SECRET_KEY = "sk_test_abc";
      process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY = "pk_test_abc";
      const logSpy = jest.spyOn(console, "log").mockImplementation();
      const config = await loadConfig();
      config.logPaymentConfigWarnings();
      expect(logSpy).toHaveBeenCalled();
      const calls = logSpy.mock.calls.flat().join(" ");
      expect(calls).toContain("PayMongo enabled");
      logSpy.mockRestore();
    });
  });

  describe("getPaymentConfig", () => {
    it("should return config with PayMongo disabled when keys are missing", async () => {
      const config = await loadConfig();
      const paymentConfig = config.getPaymentConfig();
      expect(paymentConfig.paymongo.enabled).toBe(false);
      expect(paymentConfig.paymongo.apiUrl).toBe(
        "https://api.paymongo.com/v1"
      );
      expect(paymentConfig.availableMethods).toEqual(["cod"]);
      expect(paymentConfig.currency).toBe("PHP");
      expect(paymentConfig.minimumAmount).toBe(1);
    });

    it("should return config with PayMongo enabled when keys are set", async () => {
      process.env.PAYMONGO_SECRET_KEY = "sk_test_secret";
      process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY = "pk_test_public";
      const config = await loadConfig();
      const paymentConfig = config.getPaymentConfig();
      expect(paymentConfig.paymongo.enabled).toBe(true);
      expect(paymentConfig.paymongo.publicKey).toBe("pk_test_public");
      expect(paymentConfig.paymongo.secretKey).toBe("sk_test_secret");
      expect(paymentConfig.availableMethods).toHaveLength(5);
    });

    it("should generate correct redirect URLs", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://www.mashmarket.app";
      const config = await loadConfig();
      const paymentConfig = config.getPaymentConfig();
      expect(paymentConfig.app.successRedirect("order-123")).toBe(
        "https://www.mashmarket.app/checkout/payment-success?orderId=order-123"
      );
      expect(paymentConfig.app.failedRedirect("order-123")).toBe(
        "https://www.mashmarket.app/checkout/payment-failed?orderId=order-123"
      );
    });

    it("should use default base URL when NEXT_PUBLIC_APP_URL is not set", async () => {
      const config = await loadConfig();
      const paymentConfig = config.getPaymentConfig();
      expect(paymentConfig.app.baseUrl).toBe("https://www.mashmarket.app");
    });

    it("should use custom base URL when NEXT_PUBLIC_APP_URL is set", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://beta.mashmarket.app";
      const config = await loadConfig();
      const paymentConfig = config.getPaymentConfig();
      expect(paymentConfig.app.baseUrl).toBe("https://beta.mashmarket.app");
    });
  });

  describe("Constants", () => {
    it("should export PAYMONGO_API_URL with correct value", async () => {
      const config = await loadConfig();
      expect(config.PAYMONGO_API_URL).toBe("https://api.paymongo.com/v1");
    });

    it("should export APP_BASE_URL", async () => {
      const config = await loadConfig();
      expect(typeof config.APP_BASE_URL).toBe("string");
      expect(config.APP_BASE_URL.length).toBeGreaterThan(0);
    });
  });
});
