jest.mock("next/server", () => {
  class NextRequest {}
  class NextResponse {
    static json(data: any, opts?: any) { return { data, opts }; }
  }
  return { NextRequest, NextResponse };
});
describe("API routes batch3", () => {
  it("should define POST for lalamove/webhook", () => {
    expect(typeof require("@/app/api/lalamove/webhook/route").POST).toBe("function");
  });
  it("should define POST for lalamove/order", () => {
    expect(typeof require("@/app/api/lalamove/order/route").POST).toBe("function");
  });
  it("should define GET for seller/products/[id]", () => {
    expect(typeof require("@/app/api/seller/products/[id]/route").GET).toBe("function");
  });
});