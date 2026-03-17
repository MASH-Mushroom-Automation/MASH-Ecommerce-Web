/**
 * Tests for src/lib/ai/gemini-native.ts
 * Native HTTPS Gemini client - generateResponseNative
 */

// Mock the https module with inline factory
jest.mock("https", () => ({
  request: jest.fn(),
}));

// Mock AI config with defaults
jest.mock("../config", () => ({
  GEMINI_API_KEY: "test-api-key",
  GEMINI_MODEL: "gemini-pro",
  GEMINI_TIMEOUT: 30000,
  CHATBOT_DEBUG: false,
}));

import https from "https";
import { generateResponseNative } from "../gemini-native";
import type { Message } from "@/types/chatbot";

// Get mock reference after import
const mockRequest = (https as any).request as jest.Mock;
const mockWrite = jest.fn();
const mockEnd = jest.fn();
const mockDestroy = jest.fn();

// Helper to simulate HTTPS response
function simulateHttpsResponse(
  statusCode: number,
  body: string | object
): void {
  const bodyStr = typeof body === "string" ? body : JSON.stringify(body);

  mockRequest.mockImplementation((_options: any, callback: any) => {
    const res = {
      statusCode,
      on: jest.fn((event: string, handler: any) => {
        if (event === "data") {
          handler(bodyStr);
        }
        if (event === "end") {
          handler();
        }
        return res;
      }),
    };

    // Call the response callback synchronously in next tick
    Promise.resolve().then(() => callback(res));

    return {
      on: jest.fn().mockReturnThis(),
      write: mockWrite,
      end: mockEnd,
      destroy: mockDestroy,
    };
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("generateResponseNative", () => {
  describe("missing API key", () => {
    it("should return error when API key is not configured", async () => {
      // Override the module mock for this test
      jest.resetModules();
      jest.doMock("../config", () => ({
        GEMINI_API_KEY: "",
        GEMINI_MODEL: "gemini-pro",
        GEMINI_TIMEOUT: 30000,
        CHATBOT_DEBUG: false,
      }));
      jest.doMock("https", () => ({ request: mockRequest }));

      const { generateResponseNative: genFn } = require("../gemini-native");

      const result = await genFn("Hello");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Gemini API key not configured");
      expect(result.source).toBe("gemini");

      // Restore for other tests
      jest.resetModules();
    });
  });

  describe("successful response", () => {
    it("should return generated text", async () => {
      const geminiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "Hello! How can I help you?" }],
              role: "model",
            },
            finishReason: "STOP",
          },
        ],
        usageMetadata: {
          promptTokenCount: 5,
          candidatesTokenCount: 10,
          totalTokenCount: 15,
        },
      };

      simulateHttpsResponse(200, geminiResponse);

      const result = await generateResponseNative("Hello");

      expect(result.success).toBe(true);
      expect(result.content).toBe("Hello! How can I help you?");
      expect(result.source).toBe("gemini");
      expect(result.metadata?.model).toBe("gemini-pro");
      expect(result.metadata?.tokensUsed).toBe(15);
      expect(result.metadata?.transport).toBe("native-https");
    });

    it("should pass request body with correct structure", async () => {
      const geminiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "Response" }],
              role: "model",
            },
            finishReason: "STOP",
          },
        ],
      };

      simulateHttpsResponse(200, geminiResponse);

      await generateResponseNative("Test prompt");

      expect(mockWrite).toHaveBeenCalled();
      const writtenData = JSON.parse(mockWrite.mock.calls[0][0]);

      expect(writtenData.contents).toEqual([
        { role: "user", parts: [{ text: "Test prompt" }] },
      ]);
      expect(writtenData.generationConfig).toEqual({
        temperature: 0.7,
        maxOutputTokens: 500,
        topP: 0.9,
        topK: 40,
      });
    });

    it("should map conversation history roles correctly", async () => {
      const geminiResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: "Response" }],
              role: "model",
            },
            finishReason: "STOP",
          },
        ],
      };

      simulateHttpsResponse(200, geminiResponse);

      const history: Message[] = [
        { role: "user", content: "First question" },
        { role: "assistant", content: "First answer" },
      ];

      await generateResponseNative("Follow up", history);

      const writtenData = JSON.parse(mockWrite.mock.calls[0][0]);

      // assistant should be mapped to model
      expect(writtenData.contents).toEqual([
        { role: "user", parts: [{ text: "First question" }] },
        { role: "model", parts: [{ text: "First answer" }] },
        { role: "user", parts: [{ text: "Follow up" }] },
      ]);
    });
  });

  describe("API errors", () => {
    it("should handle non-2xx status code", async () => {
      simulateHttpsResponse(400, { error: "Bad request" });

      const result = await generateResponseNative("Hello");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Gemini API error: 400");
      expect(result.source).toBe("gemini");
    });

    it("should handle empty candidates", async () => {
      simulateHttpsResponse(200, {
        candidates: [
          {
            content: {
              parts: [{ text: "" }],
              role: "model",
            },
          },
        ],
      });

      const result = await generateResponseNative("Hello");

      expect(result.success).toBe(false);
      expect(result.error).toBe("No content generated from Gemini");
    });

    it("should handle network errors", async () => {
      mockRequest.mockImplementation(() => {
        const req = {
          on: jest.fn((event: string, handler: any) => {
            if (event === "error") {
              Promise.resolve().then(() => handler(new Error("ECONNREFUSED")));
            }
            return req;
          }),
          write: mockWrite,
          end: mockEnd,
          destroy: mockDestroy,
        };
        return req;
      });

      const result = await generateResponseNative("Hello");

      expect(result.success).toBe(false);
      expect(result.error).toBe("ECONNREFUSED");
    });

    it("should handle timeout", async () => {
      mockRequest.mockImplementation(() => {
        const req = {
          on: jest.fn((event: string, handler: any) => {
            if (event === "timeout") {
              Promise.resolve().then(() => handler());
            }
            return req;
          }),
          write: mockWrite,
          end: mockEnd,
          destroy: mockDestroy,
        };
        return req;
      });

      const result = await generateResponseNative("Hello");

      expect(result.success).toBe(false);
      expect(result.error).toContain("timeout");
    });

    it("should handle malformed JSON response", async () => {
      simulateHttpsResponse(200, "not valid json{{{");

      // The response is already parsed as string since we pass it as-is
      // The parser in the actual code will fail
      const result = await generateResponseNative("Hello");

      // Since we passed a string that gets treated as valid data,
      // the missing candidates will cause a "No content" error
      expect(result.success).toBe(false);
    });
  });

  describe("request options", () => {
    it("should use IPv4 family and POST method", async () => {
      simulateHttpsResponse(200, {
        candidates: [
          {
            content: {
              parts: [{ text: "Response" }],
              role: "model",
            },
            finishReason: "STOP",
          },
        ],
      });

      await generateResponseNative("Hello");

      const requestOptions = mockRequest.mock.calls[0][0];
      expect(requestOptions.method).toBe("POST");
      expect(requestOptions.family).toBe(4);
      expect(requestOptions.port).toBe(443);
      expect(requestOptions.headers["Content-Type"]).toBe("application/json");
    });

    it("should include API key in URL path", async () => {
      simulateHttpsResponse(200, {
        candidates: [
          {
            content: {
              parts: [{ text: "Response" }],
              role: "model",
            },
            finishReason: "STOP",
          },
        ],
      });

      await generateResponseNative("Hello");

      const requestOptions = mockRequest.mock.calls[0][0];
      expect(requestOptions.path).toContain("key=test-api-key");
      expect(requestOptions.path).toContain("gemini-pro");
    });
  });

  describe("metadata", () => {
    it("should include processing time on success", async () => {
      simulateHttpsResponse(200, {
        candidates: [
          {
            content: {
              parts: [{ text: "Response" }],
              role: "model",
            },
            finishReason: "STOP",
          },
        ],
      });

      const result = await generateResponseNative("Hello");

      expect(result.metadata?.processingTime).toBeDefined();
      expect(typeof result.metadata?.processingTime).toBe("number");
    });

    it("should include processing time on error", async () => {
      simulateHttpsResponse(500, "Internal Server Error");

      const result = await generateResponseNative("Hello");

      expect(result.metadata?.processingTime).toBeDefined();
    });
  });
});
