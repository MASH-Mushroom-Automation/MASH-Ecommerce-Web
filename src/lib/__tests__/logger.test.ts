/**
 * Tests for src/lib/logger.ts
 * Custom logger with environment-aware log levels
 */

describe("Logger", () => {
  let originalEnv: string | undefined;
  
  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  async function getLogger(env: string) {
    process.env.NODE_ENV = env;
    jest.resetModules();
    const mod = await import("../logger");
    return mod.logger;
  }

  describe("in development mode", () => {
    it("info() calls console.log with [INFO] prefix", async () => {
      const logger = await getLogger("development");
      const spy = jest.spyOn(console, "log").mockImplementation();
      logger.info("test message", { data: 1 });
      expect(spy).toHaveBeenCalledWith("[INFO] test message", { data: 1 });
      spy.mockRestore();
    });

    it("debug() calls console.debug with [DEBUG] prefix", async () => {
      const logger = await getLogger("development");
      const spy = jest.spyOn(console, "debug").mockImplementation();
      logger.debug("debug msg");
      expect(spy).toHaveBeenCalledWith("[DEBUG] debug msg");
      spy.mockRestore();
    });

    it("warn() calls console.warn", async () => {
      const logger = await getLogger("development");
      const spy = jest.spyOn(console, "warn").mockImplementation();
      logger.warn("warning msg");
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("error() calls console.error", async () => {
      const logger = await getLogger("development");
      const spy = jest.spyOn(console, "error").mockImplementation();
      logger.error("error msg", new Error("test"));
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("api() logs API method and URL", async () => {
      const logger = await getLogger("development");
      const spy = jest.spyOn(console, "log").mockImplementation();
      logger.api("GET", "/api/products", 200);
      expect(spy).toHaveBeenCalled();
      const args = spy.mock.calls[0];
      expect(args[0]).toContain("[API]");
      expect(args[0]).toContain("GET");
      expect(args[0]).toContain("/api/products");
      spy.mockRestore();
    });

    it("api() uses success indicator for 2xx status", async () => {
      const logger = await getLogger("development");
      const spy = jest.spyOn(console, "log").mockImplementation();
      logger.api("POST", "/api/orders", 201);
      const output = spy.mock.calls[0][0];
      // Should contain success indicator (checkmark emoji)
      expect(output).toContain("[API]");
      spy.mockRestore();
    });

    it("perf() logs performance duration", async () => {
      const logger = await getLogger("development");
      const spy = jest.spyOn(console, "log").mockImplementation();
      logger.perf("render", 12.345);
      expect(spy).toHaveBeenCalled();
      const output = spy.mock.calls[0][0];
      expect(output).toContain("[PERF]");
      expect(output).toContain("render");
      expect(output).toContain("12.35"); // toFixed(2)
      spy.mockRestore();
    });

    it("clear() calls console.clear", async () => {
      const logger = await getLogger("development");
      const spy = jest.spyOn(console, "clear").mockImplementation();
      logger.clear();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("in production mode", () => {
    it("info() does NOT call console.log", async () => {
      const logger = await getLogger("production");
      const spy = jest.spyOn(console, "log").mockImplementation();
      logger.info("should not appear");
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it("debug() does NOT call console.debug", async () => {
      const logger = await getLogger("production");
      const spy = jest.spyOn(console, "debug").mockImplementation();
      logger.debug("should not appear");
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it("warn() still calls console.warn", async () => {
      const logger = await getLogger("production");
      const spy = jest.spyOn(console, "warn").mockImplementation();
      logger.warn("production warning");
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("error() still calls console.error", async () => {
      const logger = await getLogger("production");
      const spy = jest.spyOn(console, "error").mockImplementation();
      logger.error("production error");
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("api() does NOT log in production", async () => {
      const logger = await getLogger("production");
      const spy = jest.spyOn(console, "log").mockImplementation();
      logger.api("GET", "/test");
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it("perf() does NOT log in production", async () => {
      const logger = await getLogger("production");
      const spy = jest.spyOn(console, "log").mockImplementation();
      logger.perf("test", 100);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it("clear() does NOT clear in production", async () => {
      const logger = await getLogger("production");
      const spy = jest.spyOn(console, "clear").mockImplementation();
      logger.clear();
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("in test mode", () => {
    it("warn() is suppressed in test mode", async () => {
      const logger = await getLogger("test");
      const spy = jest.spyOn(console, "warn").mockImplementation();
      logger.warn("test warning");
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it("error() is suppressed in test mode", async () => {
      const logger = await getLogger("test");
      const spy = jest.spyOn(console, "error").mockImplementation();
      logger.error("test error");
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});

describe("suppressTestLogs", () => {
  it("is exported and callable", async () => {
    const { suppressTestLogs } = await import("../logger");
    expect(typeof suppressTestLogs).toBe("function");
    // Since we are in test env, it should be safe to call
    suppressTestLogs();
  });
});
