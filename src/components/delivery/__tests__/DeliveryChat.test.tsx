/**
 * DeliveryChat Component Tests
 * Tests rendering, message sending, quick replies, real-time Firestore
 * onSnapshot, and error handling.
 */
import React from "react";
import DeliveryChat from "@/components/delivery/DeliveryChat";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

// ─── UI mocks ──────────────────────────────────────────────────

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, onClick, asChild, ...props }: any) => {
    if (asChild && props.children) return props.children;
    return (
      <button disabled={disabled} onClick={onClick} {...props}>
        {children}
      </button>
    );
  },
}));
jest.mock("@/components/ui/input", () => ({
  Input: ({ onChange, onKeyPress, ...props }: any) => (
    <input onChange={onChange} onKeyPress={onKeyPress} {...props} />
  ),
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));
jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: React.forwardRef((props: any, ref: any) => (
    <div ref={ref}>{props.children}</div>
  )),
}));
jest.mock("lucide-react", () => ({
  MessageCircle: () => <span data-testid="message-icon">icon</span>,
  Send: () => <span data-testid="send-icon">send</span>,
  Phone: () => <span data-testid="phone-icon">phone</span>,
  AlertCircle: () => <span data-testid="alert-icon">alert</span>,
  Loader2: () => <span data-testid="loader-icon">loading</span>,
}));

// ─── Firestore mock ────────────────────────────────────────────

let capturedOnNext: ((snap: any) => void) | null = null;
const mockUnsubscribe = jest.fn();

jest.mock("firebase/firestore", () => {
  // Timestamp must be a constructor so `instanceof Timestamp` works
  function MockTimestamp() {}
  MockTimestamp.now = jest.fn(() => ({ toDate: () => new Date() }));
  MockTimestamp.prototype.toDate = function () {
    return new Date();
  };

  return {
    getFirestore: jest.fn(() => "mock-db"),
    collection: jest.fn((...args: any[]) => args.join("/")),
    query: jest.fn((...args: any[]) => args[0]),
    orderBy: jest.fn(),
    onSnapshot: jest.fn((_, onNext) => {
      capturedOnNext = onNext;
      return mockUnsubscribe;
    }),
    Timestamp: MockTimestamp,
  };
});

jest.mock("@/lib/firebase/config", () => ({
  firebaseApp: {},
}));

// ─── fetch mock ────────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch;

// ─── Setup ─────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  capturedOnNext = null;
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ data: { messageId: "msg-123" } }),
  });
});

// ─── Tests ─────────────────────────────────────────────────────

describe("DeliveryChat Component", () => {
  describe("no driver assigned", () => {
    it("renders waiting message when no driverPhone provided", () => {
      render(<DeliveryChat orderId="order-1" />);
      expect(
        screen.getByText("Chat will be available once a driver is assigned")
      ).toBeInTheDocument();
    });

    it("shows sub-text about messaging the driver", () => {
      render(<DeliveryChat orderId="order-1" />);
      expect(
        screen.getByText("You'll be able to message the driver directly")
      ).toBeInTheDocument();
    });

    it("renders Driver Communication title", () => {
      render(<DeliveryChat orderId="order-1" />);
      expect(screen.getByText("Driver Communication")).toBeInTheDocument();
    });
  });

  describe("driver assigned - rendering", () => {
    it("renders chat header with driver name", () => {
      render(
        <DeliveryChat
          orderId="order-1"
          driverPhone="+639171234567"
          driverName="Juan"
        />
      );
      expect(screen.getByText("Chat with Juan")).toBeInTheDocument();
    });

    it("renders call button with driver phone link", () => {
      render(
        <DeliveryChat
          orderId="order-1"
          driverPhone="+639171234567"
          driverName="Driver"
        />
      );
      const callLink = screen.getByText("Call").closest("a");
      expect(callLink).toHaveAttribute("href", "tel:+639171234567");
    });

    it("renders empty state message when no messages", () => {
      render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );
      expect(screen.getByText("No messages yet")).toBeInTheDocument();
      expect(
        screen.getByText("Send a message to your driver")
      ).toBeInTheDocument();
    });

    it("renders all 4 quick reply buttons", () => {
      render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );
      expect(screen.getByText("I'm here at the lobby")).toBeInTheDocument();
      expect(screen.getByText("Running 5 minutes late")).toBeInTheDocument();
      expect(
        screen.getByText("Please call me when you arrive")
      ).toBeInTheDocument();
      expect(screen.getByText("Thank you!")).toBeInTheDocument();
    });

    it("renders message input with placeholder", () => {
      render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );
      expect(
        screen.getByPlaceholderText("Type your message (max 160 characters)")
      ).toBeInTheDocument();
    });

    it("renders character counter showing 0/160", () => {
      render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );
      expect(screen.getByText(/0\/160 characters/)).toBeInTheDocument();
    });

    it("renders Firestore info note", () => {
      render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );
      expect(
        screen.getByText(/Messages are sent via Firestore/)
      ).toBeInTheDocument();
    });
  });

  describe("real-time messages via onSnapshot", () => {
    it("subscribes to Firestore onSnapshot on mount", () => {
      const { onSnapshot: mockOnSnapshot } = require("firebase/firestore");
      render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );
      expect(mockOnSnapshot).toHaveBeenCalled();
    });

    it("renders messages from Firestore snapshot", async () => {
      render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );

      act(() => {
        capturedOnNext!({
          docs: [
            {
              id: "m1",
              data: () => ({
                sender: "customer",
                message: "Are you nearby?",
                timestamp: "2024-01-01T10:00:00Z",
                status: "sent",
              }),
            },
            {
              id: "m2",
              data: () => ({
                sender: "driver",
                message: "Almost there!",
                timestamp: "2024-01-01T10:01:00Z",
                status: "delivered",
              }),
            },
          ],
        });
      });

      await waitFor(() => {
        expect(screen.getByText("Are you nearby?")).toBeInTheDocument();
        expect(screen.getByText("Almost there!")).toBeInTheDocument();
      });
    });

    it("unsubscribes from Firestore on unmount", () => {
      const { unmount } = render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );
      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe("sending messages", () => {
    it("sends message on send button click", async () => {
      render(
        <DeliveryChat
          orderId="order-1"
          driverPhone="+639171234567"
          customerName="Test"
        />
      );

      const input = screen.getByPlaceholderText(
        "Type your message (max 160 characters)"
      );
      fireEvent.change(input, { target: { value: "Hello driver" } });

      const buttons = screen.getAllByRole("button");
      const sendButton = buttons.find((btn) =>
        btn.querySelector("[data-testid='send-icon']")
      );

      await act(async () => {
        fireEvent.click(sendButton!);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/lalamove/chat/send",
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining("Hello driver"),
          })
        );
      });
    });

    it("clears input after successful send", async () => {
      render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );

      const input = screen.getByPlaceholderText(
        "Type your message (max 160 characters)"
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "Test message" } });

      const buttons = screen.getAllByRole("button");
      const sendButton = buttons.find((btn) =>
        btn.querySelector("[data-testid='send-icon']")
      );

      await act(async () => {
        fireEvent.click(sendButton!);
      });

      await waitFor(() => {
        expect(input.value).toBe("");
      });
    });

    it("does not send empty messages", () => {
      render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );

      const buttons = screen.getAllByRole("button");
      const sendButton = buttons.find((btn) =>
        btn.querySelector("[data-testid='send-icon']")
      );
      expect(sendButton).toBeDisabled();
    });

    it("sends message on Enter key press", async () => {
      render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );

      const input = screen.getByPlaceholderText(
        "Type your message (max 160 characters)"
      );
      fireEvent.change(input, { target: { value: "Enter test" } });
      fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/lalamove/chat/send",
          expect.objectContaining({ method: "POST" })
        );
      });
    });
  });

  describe("quick replies", () => {
    it("sends quick reply on button click", async () => {
      render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );

      await act(async () => {
        fireEvent.click(screen.getByText("Thank you!"));
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/lalamove/chat/send",
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining("Thank you!"),
          })
        );
      });
    });
  });

  describe("error handling", () => {
    it("shows error message when send fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Chat service unavailable" }),
      });

      render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );

      const input = screen.getByPlaceholderText(
        "Type your message (max 160 characters)"
      );
      fireEvent.change(input, { target: { value: "Hello" } });

      const buttons = screen.getAllByRole("button");
      const sendButton = buttons.find((btn) =>
        btn.querySelector("[data-testid='send-icon']")
      );

      await act(async () => {
        fireEvent.click(sendButton!);
      });

      await waitFor(() => {
        expect(screen.getByText("Chat service unavailable")).toBeInTheDocument();
      });
    });

    it("handles network error gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );

      const input = screen.getByPlaceholderText(
        "Type your message (max 160 characters)"
      );
      fireEvent.change(input, { target: { value: "Test" } });

      const buttons = screen.getAllByRole("button");
      const sendButton = buttons.find((btn) =>
        btn.querySelector("[data-testid='send-icon']")
      );

      await act(async () => {
        fireEvent.click(sendButton!);
      });

      await waitFor(() => {
        expect(screen.getByText("Network failure")).toBeInTheDocument();
      });
    });
  });

  describe("character limit", () => {
    it("updates character count as user types", () => {
      render(
        <DeliveryChat orderId="order-1" driverPhone="+639171234567" />
      );

      const input = screen.getByPlaceholderText(
        "Type your message (max 160 characters)"
      );
      fireEvent.change(input, { target: { value: "Hello" } });
      expect(screen.getByText(/5\/160 characters/)).toBeInTheDocument();
    });
  });
});
