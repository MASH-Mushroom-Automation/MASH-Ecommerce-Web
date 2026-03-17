/**
 * Tests for src/lib/api/client.ts
 * Axios client with request/response interceptors
 */

// Mock axios before importing client
const mockAxiosCreate = jest.fn();
const mockInterceptorsRequestUse = jest.fn();
const mockInterceptorsResponseUse = jest.fn();

jest.mock("axios", () => {
  const mockInstance = {
    interceptors: {
      request: { use: mockInterceptorsRequestUse },
      response: { use: mockInterceptorsResponseUse },
    },
    defaults: { headers: { common: {} } },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
  mockAxiosCreate.mockReturnValue(mockInstance);
  return {
    __esModule: true,
    default: { create: mockAxiosCreate },
    create: mockAxiosCreate,
  };
});

describe("apiClient (client.ts)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_ENABLE_API_LOGGING;
  });

  describe("axios instance creation", () => {
    it("creates axios instance with correct defaults", () => {
      jest.isolateModules(() => {
        require("../client");
      });
      expect(mockAxiosCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: expect.any(Number),
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    it("uses NEXT_PUBLIC_API_URL env var for baseURL", () => {
      const original = process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_URL = "https://api.test.com/v1";
      jest.isolateModules(() => {
        require("../client");
      });
      expect(mockAxiosCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "https://api.test.com/v1",
        })
      );
      process.env.NEXT_PUBLIC_API_URL = original;
    });

    it("uses NEXT_PUBLIC_API_TIMEOUT env var for timeout", () => {
      const original = process.env.NEXT_PUBLIC_API_TIMEOUT;
      process.env.NEXT_PUBLIC_API_TIMEOUT = "15000";
      jest.isolateModules(() => {
        require("../client");
      });
      expect(mockAxiosCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 15000,
        })
      );
      process.env.NEXT_PUBLIC_API_TIMEOUT = original;
    });

    it("falls back to default URL when env var not set", () => {
      const original = process.env.NEXT_PUBLIC_API_URL;
      delete process.env.NEXT_PUBLIC_API_URL;
      jest.isolateModules(() => {
        require("../client");
      });
      expect(mockAxiosCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining("localhost"),
        })
      );
      process.env.NEXT_PUBLIC_API_URL = original;
    });
  });

  describe("request interceptor", () => {
    it("registers a request interceptor", () => {
      jest.isolateModules(() => {
        require("../client");
      });
      expect(mockInterceptorsRequestUse).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });

    it("passes config through in success handler", () => {
      jest.isolateModules(() => {
        require("../client");
      });
      const successHandler = mockInterceptorsRequestUse.mock.calls[0][0];
      const config = { method: "get", url: "/test", params: {}, data: {} };
      const result = successHandler(config);
      expect(result).toBe(config);
    });

    it("logs request when API logging is enabled", () => {
      process.env.NEXT_PUBLIC_ENABLE_API_LOGGING = "true";
      jest.isolateModules(() => {
        require("../client");
      });
      const successHandler = mockInterceptorsRequestUse.mock.calls[0][0];
      const config = { method: "get", url: "/test", params: { a: 1 }, data: null };
      successHandler(config);
      // No throw = success. Console is mocked in jest.setup.js
    });

    it("rejects on request error", async () => {
      jest.isolateModules(() => {
        require("../client");
      });
      const errorHandler = mockInterceptorsRequestUse.mock.calls[0][1];
      const error = new Error("Request setup failed");
      await expect(errorHandler(error)).rejects.toThrow("Request setup failed");
    });
  });

  describe("response interceptor", () => {
    let successHandler: (response: any) => any;
    let errorHandler: (error: any) => any;

    beforeEach(() => {
      jest.isolateModules(() => {
        require("../client");
      });
      successHandler = mockInterceptorsResponseUse.mock.calls[0][0];
      errorHandler = mockInterceptorsResponseUse.mock.calls[0][1];
    });

    it("registers a response interceptor", () => {
      expect(mockInterceptorsResponseUse).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });

    it("passes response through in success handler", () => {
      const response = { status: 200, data: { ok: true }, config: { url: "/test" } };
      const result = successHandler(response);
      expect(result).toBe(response);
    });

    it("logs response when API logging is enabled", () => {
      process.env.NEXT_PUBLIC_ENABLE_API_LOGGING = "true";
      jest.isolateModules(() => {
        require("../client");
      });
      const logSuccessHandler = mockInterceptorsResponseUse.mock.calls[0][0];
      const response = { status: 200, data: {}, config: { url: "/test" } };
      logSuccessHandler(response);
      // No throw = success
    });

    it("handles 401 error for non-auth endpoint", async () => {
      const error = {
        response: { status: 401 },
        config: { url: "/orders" },
      };
      await expect(errorHandler(error)).rejects.toBe(error);
    });

    it("handles 401 error for auth endpoint without redirect", async () => {
      const error = {
        response: { status: 401 },
        config: { url: "/auth/login" },
      };
      await expect(errorHandler(error)).rejects.toBe(error);
    });

    it("handles 403 forbidden error", async () => {
      const error = {
        response: { status: 403 },
        config: { url: "/admin" },
      };
      await expect(errorHandler(error)).rejects.toBe(error);
    });

    it("handles 404 error silently when logging disabled", async () => {
      const error = {
        response: { status: 404 },
        config: { url: "/missing" },
      };
      await expect(errorHandler(error)).rejects.toBe(error);
    });

    it("handles 500 server error", async () => {
      const error = {
        response: { status: 500 },
        config: { url: "/error" },
      };
      await expect(errorHandler(error)).rejects.toBe(error);
    });

    it("handles no-response error (network failure)", async () => {
      const error = {
        request: {},
        config: { url: "/test" },
      };
      await expect(errorHandler(error)).rejects.toBe(error);
    });

    it("handles request setup error", async () => {
      const error = {
        message: "Invalid URL",
      };
      await expect(errorHandler(error)).rejects.toBe(error);
    });
  });
});
