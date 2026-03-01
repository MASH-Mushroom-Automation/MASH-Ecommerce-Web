import React from "react";
import DeliveryChat from "@/components/delivery/DeliveryChat";
import { render, fireEvent } from "@testing-library/react";

jest.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: any) => <button {...props}>{children}</button> }));
jest.mock("@/components/ui/input", () => ({ Input: (props: any) => <input {...props} /> }));
jest.mock("@/components/ui/card", () => ({ Card: ({ children }: any) => <div>{children}</div>, CardContent: ({ children }: any) => <div>{children}</div>, CardHeader: ({ children }: any) => <div>{children}</div>, CardTitle: ({ children }: any) => <div>{children}</div> }));
jest.mock("@/components/ui/badge", () => ({ Badge: ({ children }: any) => <span>{children}</span> }));
jest.mock("@/components/ui/scroll-area", () => ({ ScrollArea: React.forwardRef((props: any, ref) => <div ref={ref}>{props.children}</div>) }));
jest.mock("lucide-react", () => ({ MessageCircle: () => <span>icon</span>, Send: () => <span>send</span>, Phone: () => <span>phone</span>, AlertCircle: () => <span>alert</span> }));

global.fetch = jest.fn(async (url, opts) => {
  if (url.toString().includes("chat/send") && (!opts || opts.method === "GET")) {
    return { json: async () => ({ success: true, data: { messages: [] } }) };
  }
  if (opts && opts.method === "POST") {
    return { ok: true, json: async () => ({ data: { messageId: "123" } }) };
  }
  return { json: async () => ({}) };
});

describe("DeliveryChat Component", () => {
  it("renders call-only message if no driverPhone", () => {
    const { container } = render(<DeliveryChat orderId="1" />);
    expect(container.textContent).toContain("Chat will be available once a driver is assigned");
  });

  it("renders chat UI with driver assigned", async () => {
    const { container } = render(
      <DeliveryChat orderId="1" driverPhone="09171234567" driverName="Driver" customerName="Customer" />
    );
    expect(container.textContent).toContain("Chat with Driver");
    expect(container.textContent).toBeDefined();
  });

  it("renders quick replies", () => {
    const { container, getByText } = render(
      <DeliveryChat orderId="1" driverPhone="09171234567" />
    );
    expect(getByText("I'm here at the lobby")).toBeDefined();
  });
});
