import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  PaymentProcessingOverlay,
  STEP_ADVANCE_DELAY,
  CANCEL_DELAY,
  TIMEOUT_DELAY,
} from "../PaymentProcessingOverlay";
import type { PaymentMethod } from "@/types/payment";

describe("PaymentProcessingOverlay", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // -----------------------------------------------------------------------
  // Visibility
  // -----------------------------------------------------------------------

  it("should render nothing when visible is false", () => {
    const { container } = render(
      <PaymentProcessingOverlay visible={false} paymentMethod="gcash" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render the overlay when visible is true", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // AC1: Full-screen overlay with blur backdrop
  // -----------------------------------------------------------------------

  it("should apply backdrop-blur-sm and bg-black/50 for blur backdrop", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    const overlay = screen.getByTestId("payment-processing-overlay");
    expect(overlay).toHaveClass("backdrop-blur-sm");
    expect(overlay).toHaveClass("fixed", "inset-0", "z-50");
  });

  // -----------------------------------------------------------------------
  // AC2: Animated spinner with payment method icon
  // -----------------------------------------------------------------------

  it("should show payment method icon for gcash", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(screen.getByTestId("method-icon")).toBeInTheDocument();
  });

  it("should show animated spinner ring around icon", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.getByTestId("spinner")).toHaveClass("animate-spin");
  });

  it.each<PaymentMethod>(["cod", "gcash", "grab_pay", "card", "paymaya"])(
    "should render method icon for %s",
    (method) => {
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod={method} />
      );
      expect(screen.getByTestId("method-icon")).toBeInTheDocument();
    }
  );

  // -----------------------------------------------------------------------
  // AC3: Progress text auto-advancement
  // -----------------------------------------------------------------------

  it("should start with 'Creating your order...'", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(screen.getByTestId("processing-step-text")).toHaveTextContent(
      "Creating your order..."
    );
  });

  it("should advance to 'Connecting to payment...' after STEP_ADVANCE_DELAY", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    act(() => {
      jest.advanceTimersByTime(STEP_ADVANCE_DELAY);
    });
    expect(screen.getByTestId("processing-step-text")).toHaveTextContent(
      "Connecting to payment..."
    );
  });

  it("should advance to 'Redirecting...' after 2x STEP_ADVANCE_DELAY", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    act(() => {
      jest.advanceTimersByTime(STEP_ADVANCE_DELAY);
    });
    act(() => {
      jest.advanceTimersByTime(STEP_ADVANCE_DELAY);
    });
    expect(screen.getByTestId("processing-step-text")).toHaveTextContent(
      "Redirecting..."
    );
  });

  it("should show step indicator dots", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(screen.getByTestId("step-indicators")).toBeInTheDocument();
    // 3 dots for 3 steps
    const dots = screen.getByTestId("step-indicators").children;
    expect(dots).toHaveLength(3);
  });

  it("should allow step override via step prop", () => {
    render(
      <PaymentProcessingOverlay
        visible={true}
        paymentMethod="gcash"
        step="redirecting"
      />
    );
    expect(screen.getByTestId("processing-step-text")).toHaveTextContent(
      "Redirecting..."
    );
  });

  // -----------------------------------------------------------------------
  // AC3: All payment methods show initial step
  // -----------------------------------------------------------------------

  it.each<PaymentMethod>(["cod", "gcash", "grab_pay", "card", "paymaya"])(
    "should show 'Creating your order...' initially for %s",
    (method) => {
      render(
        <PaymentProcessingOverlay visible={true} paymentMethod={method} />
      );
      expect(screen.getByTestId("processing-step-text")).toHaveTextContent(
        "Creating your order..."
      );
    }
  );

  // -----------------------------------------------------------------------
  // AC3: Method-specific description text
  // -----------------------------------------------------------------------

  it("should show GCash description about redirect", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(
      screen.getByText(/redirected to the GCash app/i)
    ).toBeInTheDocument();
  });

  it("should show GrabPay description about redirect", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="grab_pay" />
    );
    expect(
      screen.getByText(/redirected to the Grab app/i)
    ).toBeInTheDocument();
  });

  it("should show PayMaya description about redirect", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="paymaya" />
    );
    expect(
      screen.getByText(/redirected to the Maya app/i)
    ).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // AC4: Cancel option with confirmation dialog after 30 seconds
  // -----------------------------------------------------------------------

  it("should NOT show cancel button initially when onCancel provided", () => {
    render(
      <PaymentProcessingOverlay
        visible={true}
        paymentMethod="gcash"
        onCancel={jest.fn()}
      />
    );
    expect(
      screen.queryByTestId("cancel-button")
    ).not.toBeInTheDocument();
  });

  it("should show cancel button after CANCEL_DELAY (30s)", () => {
    render(
      <PaymentProcessingOverlay
        visible={true}
        paymentMethod="gcash"
        onCancel={jest.fn()}
      />
    );
    act(() => {
      jest.advanceTimersByTime(CANCEL_DELAY);
    });
    expect(screen.getByTestId("cancel-button")).toBeInTheDocument();
  });

  it("should open confirmation dialog when cancel button clicked", () => {
    render(
      <PaymentProcessingOverlay
        visible={true}
        paymentMethod="gcash"
        onCancel={jest.fn()}
      />
    );
    act(() => {
      jest.advanceTimersByTime(CANCEL_DELAY);
    });
    fireEvent.click(screen.getByTestId("cancel-button"));
    expect(screen.getByText("Cancel Payment?")).toBeInTheDocument();
    expect(screen.getByTestId("cancel-confirm-dialog")).toBeInTheDocument();
  });

  it("should call onCancel after confirming cancellation", () => {
    const onCancel = jest.fn();
    render(
      <PaymentProcessingOverlay
        visible={true}
        paymentMethod="gcash"
        onCancel={onCancel}
      />
    );
    act(() => {
      jest.advanceTimersByTime(CANCEL_DELAY);
    });
    fireEvent.click(screen.getByTestId("cancel-button"));
    fireEvent.click(screen.getByTestId("cancel-confirm-yes"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should NOT call onCancel when Keep Waiting is clicked", () => {
    const onCancel = jest.fn();
    render(
      <PaymentProcessingOverlay
        visible={true}
        paymentMethod="gcash"
        onCancel={onCancel}
      />
    );
    act(() => {
      jest.advanceTimersByTime(CANCEL_DELAY);
    });
    fireEvent.click(screen.getByTestId("cancel-button"));
    fireEvent.click(screen.getByTestId("cancel-confirm-stay"));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("should not show cancel button when onCancel is null", () => {
    render(
      <PaymentProcessingOverlay
        visible={true}
        paymentMethod="gcash"
        onCancel={null}
      />
    );
    act(() => {
      jest.advanceTimersByTime(CANCEL_DELAY);
    });
    expect(
      screen.queryByTestId("cancel-button")
    ).not.toBeInTheDocument();
  });

  it("should not show cancel button when onCancel is omitted", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    act(() => {
      jest.advanceTimersByTime(CANCEL_DELAY);
    });
    expect(
      screen.queryByTestId("cancel-button")
    ).not.toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // AC5: Prevent accidental page navigation (beforeunload)
  // -----------------------------------------------------------------------

  it("should add beforeunload listener when visible", () => {
    const addSpy = jest.spyOn(window, "addEventListener");
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(addSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function)
    );
    addSpy.mockRestore();
  });

  it("should remove beforeunload listener when unmounted", () => {
    const removeSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    unmount();
    expect(removeSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function)
    );
    removeSpy.mockRestore();
  });

  it("should call preventDefault on beforeunload event", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    const event = new Event("beforeunload", { cancelable: true });
    const preventSpy = jest.spyOn(event, "preventDefault");
    window.dispatchEvent(event);
    expect(preventSpy).toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // AC6: Timeout handler after 60 seconds
  // -----------------------------------------------------------------------

  it("should show timeout message after TIMEOUT_DELAY (60s)", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    act(() => {
      jest.advanceTimersByTime(TIMEOUT_DELAY);
    });
    expect(screen.getByTestId("processing-step-text")).toHaveTextContent(
      "Taking longer than expected..."
    );
  });

  it("should show timeout warning icon instead of spinner", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    act(() => {
      jest.advanceTimersByTime(TIMEOUT_DELAY);
    });
    expect(screen.getByTestId("timeout-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });

  it("should show timeout message text", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    act(() => {
      jest.advanceTimersByTime(TIMEOUT_DELAY);
    });
    expect(screen.getByTestId("timeout-message")).toBeInTheDocument();
  });

  it("should also show cancel button on timeout when onCancel provided", () => {
    render(
      <PaymentProcessingOverlay
        visible={true}
        paymentMethod="gcash"
        onCancel={jest.fn()}
      />
    );
    act(() => {
      jest.advanceTimersByTime(TIMEOUT_DELAY);
    });
    expect(screen.getByTestId("cancel-button")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // AC7: Accessible sr-only live region
  // -----------------------------------------------------------------------

  it("should have sr-only live region with initial announcement", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    const liveRegion = screen.getByTestId("sr-live-region");
    expect(liveRegion).toHaveAttribute("role", "status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toHaveClass("sr-only");
    expect(liveRegion).toHaveTextContent("Creating your order...");
  });

  it("should update live region when step advances", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    act(() => {
      jest.advanceTimersByTime(STEP_ADVANCE_DELAY);
    });
    const liveRegion = screen.getByTestId("sr-live-region");
    expect(liveRegion).toHaveTextContent("Connecting to payment...");
  });

  it("should announce cancel availability after CANCEL_DELAY", () => {
    render(
      <PaymentProcessingOverlay
        visible={true}
        paymentMethod="gcash"
        onCancel={jest.fn()}
      />
    );
    // Advance through step timers first
    act(() => { jest.advanceTimersByTime(STEP_ADVANCE_DELAY); });
    act(() => { jest.advanceTimersByTime(STEP_ADVANCE_DELAY); });
    // Then advance to cancel delay
    act(() => { jest.advanceTimersByTime(CANCEL_DELAY - STEP_ADVANCE_DELAY * 2); });
    const liveRegion = screen.getByTestId("sr-live-region");
    expect(liveRegion).toHaveTextContent(/cancel/i);
  });

  it("should announce timeout after TIMEOUT_DELAY", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    // Advance through step timers first
    act(() => { jest.advanceTimersByTime(STEP_ADVANCE_DELAY); });
    act(() => { jest.advanceTimersByTime(STEP_ADVANCE_DELAY); });
    // Then advance to timeout delay
    act(() => { jest.advanceTimersByTime(TIMEOUT_DELAY - STEP_ADVANCE_DELAY * 2); });
    const liveRegion = screen.getByTestId("sr-live-region");
    expect(liveRegion).toHaveTextContent(/longer than expected/i);
  });

  // -----------------------------------------------------------------------
  // Accessibility (aria attributes)
  // -----------------------------------------------------------------------

  it("should have aria-modal attribute", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("should have correct aria-label for payment method", () => {
    render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-label",
      "Processing GCash payment"
    );
  });

  // -----------------------------------------------------------------------
  // Custom className
  // -----------------------------------------------------------------------

  it("should apply custom className to overlay", () => {
    render(
      <PaymentProcessingOverlay
        visible={true}
        paymentMethod="gcash"
        className="test-custom-class"
      />
    );
    expect(screen.getByRole("dialog")).toHaveClass("test-custom-class");
  });

  // -----------------------------------------------------------------------
  // State reset on visibility toggle
  // -----------------------------------------------------------------------

  it("should reset to step 1 when overlay becomes visible again", () => {
    const { rerender } = render(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    act(() => {
      jest.advanceTimersByTime(STEP_ADVANCE_DELAY);
    });
    act(() => {
      jest.advanceTimersByTime(STEP_ADVANCE_DELAY);
    });
    expect(screen.getByTestId("processing-step-text")).toHaveTextContent(
      "Redirecting..."
    );

    // Hide and re-show
    rerender(
      <PaymentProcessingOverlay visible={false} paymentMethod="gcash" />
    );
    rerender(
      <PaymentProcessingOverlay visible={true} paymentMethod="gcash" />
    );
    expect(screen.getByTestId("processing-step-text")).toHaveTextContent(
      "Creating your order..."
    );
  });
});
