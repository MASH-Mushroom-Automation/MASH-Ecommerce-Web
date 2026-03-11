import { renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { useDeliveryNotifications } from "../useDeliveryNotifications";

jest.mock("sonner", () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockInfo = toast.info as jest.Mock;
const mockSuccess = toast.success as jest.Mock;
const mockError = toast.error as jest.Mock;

describe("useDeliveryNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should not fire toast on mount with null tracking", () => {
    renderHook(() => useDeliveryNotifications(null));
    expect(mockInfo).not.toHaveBeenCalled();
    expect(mockSuccess).not.toHaveBeenCalled();
    expect(mockError).not.toHaveBeenCalled();
  });

  it("should fire info toast for ASSIGNING_DRIVER status", () => {
    renderHook(() =>
      useDeliveryNotifications({ status: "ASSIGNING_DRIVER" })
    );
    expect(mockInfo).toHaveBeenCalledWith("Looking for a driver", {
      description: "Your delivery is being assigned to a nearby driver.",
    });
  });

  it("should fire info toast for ON_GOING with ETA", () => {
    renderHook(() =>
      useDeliveryNotifications({
        status: "ON_GOING",
        eta: { minutes: 10, distance: 3.5 },
      })
    );
    expect(mockInfo).toHaveBeenCalledWith("Delivery in progress", {
      description: "Estimated arrival in 10 minutes.",
    });
  });

  it("should fire info toast for DRIVER_ASSIGNED with driver info", () => {
    renderHook(() =>
      useDeliveryNotifications({
        status: "DRIVER_ASSIGNED",
        driver: { name: "Juan", phone: "09171234567", plateNumber: "XYZ 789" },
      })
    );
    expect(mockInfo).toHaveBeenCalledWith("Driver assigned", {
      description: "Juan (XYZ 789) is heading to pick up your order.",
    });
  });

  it("should fire success toast for COMPLETED", () => {
    renderHook(() =>
      useDeliveryNotifications({ status: "COMPLETED" })
    );
    expect(mockSuccess).toHaveBeenCalledWith("Delivery complete", {
      description: "Your order has been delivered successfully.",
    });
  });

  it("should fire error toast for CANCELLED", () => {
    renderHook(() =>
      useDeliveryNotifications({ status: "CANCELLED" })
    );
    expect(mockError).toHaveBeenCalledWith("Delivery cancelled", {
      description: "The delivery has been cancelled. Please contact support if needed.",
    });
  });

  it("should fire error toast for REJECTED", () => {
    renderHook(() =>
      useDeliveryNotifications({ status: "REJECTED" })
    );
    expect(mockError).toHaveBeenCalledWith("Delivery rejected", {
      description: "The delivery request was rejected. Please try again.",
    });
  });

  it("should fire error toast for EXPIRED", () => {
    renderHook(() =>
      useDeliveryNotifications({ status: "EXPIRED" })
    );
    expect(mockError).toHaveBeenCalledWith("Delivery expired", {
      description: "No driver was found in time. Please create a new delivery request.",
    });
  });

  it("should not fire toast again when status stays the same", () => {
    const { rerender } = renderHook(
      ({ tracking }) => useDeliveryNotifications(tracking),
      { initialProps: { tracking: { status: "ON_GOING" } as { status: string } } }
    );
    expect(mockInfo).toHaveBeenCalledTimes(1);

    rerender({ tracking: { status: "ON_GOING" } });
    expect(mockInfo).toHaveBeenCalledTimes(1); // No additional call
  });

  it("should fire new toast when status changes", () => {
    const { rerender } = renderHook(
      ({ tracking }) => useDeliveryNotifications(tracking),
      { initialProps: { tracking: { status: "ON_GOING" } as { status: string } } }
    );
    expect(mockInfo).toHaveBeenCalledTimes(1);

    rerender({ tracking: { status: "COMPLETED" } });
    expect(mockSuccess).toHaveBeenCalledTimes(1);
    expect(mockSuccess).toHaveBeenCalledWith("Delivery complete", {
      description: "Your order has been delivered successfully.",
    });
  });

  it("should handle PICKED_UP status", () => {
    renderHook(() =>
      useDeliveryNotifications({ status: "PICKED_UP" })
    );
    expect(mockInfo).toHaveBeenCalledWith("Order picked up", {
      description: "The driver has picked up your order and is on the way.",
    });
  });

  it("should not fire toast for unknown status", () => {
    renderHook(() =>
      useDeliveryNotifications({ status: "UNKNOWN_STATUS" })
    );
    expect(mockInfo).not.toHaveBeenCalled();
    expect(mockSuccess).not.toHaveBeenCalled();
    expect(mockError).not.toHaveBeenCalled();
  });
});
