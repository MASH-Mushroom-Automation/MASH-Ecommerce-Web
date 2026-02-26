/**
 * Tests for src/lib/status-utils.tsx
 * Covers: getStatusBadge for all status types (order, product, inventory, refund),
 * getStatusColor, getStatusLabel, unknown status fallbacks
 */

import React from "react";

// Mock the Badge component so we don't need full UI setup
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant: string; className: string }) => (
    <span data-variant={variant} data-classname={className}>
      {children}
    </span>
  ),
}));

import { getStatusBadge, getStatusColor, getStatusLabel } from "../status-utils";

describe("status-utils", () => {
  describe("getStatusBadge", () => {
    describe("order statuses", () => {
      it("renders PENDING badge with yellow styling", () => {
        const badge = getStatusBadge("PENDING");
        expect(badge).toBeTruthy();
        expect(badge.props.children).toBe("Pending");
        expect(badge.props.variant).toBe("outline");
        expect(badge.props.className).toContain("yellow");
      });

      it("renders CONFIRMED badge with blue styling", () => {
        const badge = getStatusBadge("CONFIRMED");
        expect(badge.props.children).toBe("Confirmed");
        expect(badge.props.className).toContain("blue");
      });

      it("renders PROCESSING badge with purple styling", () => {
        const badge = getStatusBadge("PROCESSING");
        expect(badge.props.children).toBe("Processing");
        expect(badge.props.className).toContain("purple");
      });

      it("renders READY_FOR_PICKUP badge with orange styling", () => {
        const badge = getStatusBadge("READY_FOR_PICKUP");
        expect(badge.props.children).toBe("Ready for Pickup");
        expect(badge.props.className).toContain("orange");
      });

      it("renders COMPLETED badge with primary styling", () => {
        const badge = getStatusBadge("COMPLETED");
        expect(badge.props.children).toBe("Completed");
        expect(badge.props.className).toContain("primary");
      });

      it("renders CANCELLED badge with destructive variant", () => {
        const badge = getStatusBadge("CANCELLED");
        expect(badge.props.children).toBe("Cancelled");
        expect(badge.props.variant).toBe("destructive");
      });

      it("renders SHIPPED badge with indigo styling", () => {
        const badge = getStatusBadge("SHIPPED");
        expect(badge.props.children).toBe("Shipped");
        expect(badge.props.className).toContain("indigo");
      });

      it("renders DELIVERED badge with green styling", () => {
        const badge = getStatusBadge("DELIVERED");
        expect(badge.props.children).toBe("Delivered");
        expect(badge.props.className).toContain("green");
      });

      it("renders REFUNDED badge with red styling", () => {
        const badge = getStatusBadge("REFUNDED");
        expect(badge.props.children).toBe("Refunded");
        expect(badge.props.className).toContain("red");
      });
    });

    describe("product statuses", () => {
      it("renders Active badge with green styling", () => {
        const badge = getStatusBadge("Active");
        expect(badge.props.children).toBe("Active");
        expect(badge.props.className).toContain("green");
      });

      it("renders Out of Stock badge with destructive variant", () => {
        const badge = getStatusBadge("Out of Stock");
        expect(badge.props.children).toBe("Out of Stock");
        expect(badge.props.variant).toBe("destructive");
      });

      it("renders Draft badge with gray styling", () => {
        const badge = getStatusBadge("Draft");
        expect(badge.props.children).toBe("Draft");
        expect(badge.props.className).toContain("gray");
      });
    });

    describe("inventory statuses", () => {
      it("renders in_stock badge with green styling", () => {
        const badge = getStatusBadge("in_stock");
        expect(badge.props.children).toBe("In Stock");
        expect(badge.props.className).toContain("green");
      });

      it("renders low_stock badge with yellow styling", () => {
        const badge = getStatusBadge("low_stock");
        expect(badge.props.children).toBe("Low Stock");
        expect(badge.props.className).toContain("yellow");
      });

      it("renders out_of_stock badge with destructive variant", () => {
        const badge = getStatusBadge("out_of_stock");
        expect(badge.props.children).toBe("Out of Stock");
        expect(badge.props.variant).toBe("destructive");
      });
    });

    describe("refund statuses", () => {
      it("renders Pending refund badge", () => {
        const badge = getStatusBadge("Pending");
        expect(badge.props.children).toBe("Pending");
        expect(badge.props.className).toContain("yellow");
      });

      it("renders Processing refund badge", () => {
        const badge = getStatusBadge("Processing");
        expect(badge.props.children).toBe("Processing");
        expect(badge.props.className).toContain("purple");
      });

      it("renders Approved refund badge", () => {
        const badge = getStatusBadge("Approved");
        expect(badge.props.children).toBe("Approved");
        expect(badge.props.className).toContain("green");
      });

      it("renders Rejected refund badge with destructive variant", () => {
        const badge = getStatusBadge("Rejected");
        expect(badge.props.children).toBe("Rejected");
        expect(badge.props.variant).toBe("destructive");
      });
    });

    describe("unknown status", () => {
      it("renders fallback badge for unknown status", () => {
        const badge = getStatusBadge("UNKNOWN_STATUS");
        expect(badge.props.children).toBe("UNKNOWN_STATUS");
        expect(badge.props.variant).toBe("outline");
        expect(badge.props.className).toContain("gray");
      });
    });
  });

  describe("getStatusColor", () => {
    it("returns yellow classes for PENDING", () => {
      const color = getStatusColor("PENDING");
      expect(color).toContain("yellow");
    });

    it("returns green classes for DELIVERED", () => {
      const color = getStatusColor("DELIVERED");
      expect(color).toContain("green");
    });

    it("returns gray fallback for CANCELLED (className is empty string, falsy in JS)", () => {
      const color = getStatusColor("CANCELLED");
      // CANCELLED statusConfig has className: "" which is falsy,
      // so the || fallback triggers and returns the gray default
      expect(color).toContain("gray");
    });

    it("returns gray fallback for unknown status", () => {
      const color = getStatusColor("NONEXISTENT");
      expect(color).toContain("gray");
    });

    it("returns primary classes for COMPLETED", () => {
      const color = getStatusColor("COMPLETED");
      expect(color).toContain("primary");
    });
  });

  describe("getStatusLabel", () => {
    it("returns 'Pending' for PENDING", () => {
      expect(getStatusLabel("PENDING")).toBe("Pending");
    });

    it("returns 'Confirmed' for CONFIRMED", () => {
      expect(getStatusLabel("CONFIRMED")).toBe("Confirmed");
    });

    it("returns 'Ready for Pickup' for READY_FOR_PICKUP", () => {
      expect(getStatusLabel("READY_FOR_PICKUP")).toBe("Ready for Pickup");
    });

    it("returns 'In Stock' for in_stock", () => {
      expect(getStatusLabel("in_stock")).toBe("In Stock");
    });

    it("returns 'Low Stock' for low_stock", () => {
      expect(getStatusLabel("low_stock")).toBe("Low Stock");
    });

    it("returns raw status string for unknown status", () => {
      expect(getStatusLabel("MYSTERY")).toBe("MYSTERY");
    });

    it("returns 'Shipped' for SHIPPED", () => {
      expect(getStatusLabel("SHIPPED")).toBe("Shipped");
    });

    it("returns 'Delivered' for DELIVERED", () => {
      expect(getStatusLabel("DELIVERED")).toBe("Delivered");
    });
  });
});
