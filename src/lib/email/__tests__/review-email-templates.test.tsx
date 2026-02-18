/**
 * Review Email Template Render Tests
 *
 * Verifies all 4 review email templates produce valid React elements.
 * Uses react-dom/server renderToStaticMarkup to validate template output
 * without requiring --experimental-vm-modules (needed by @react-email render).
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReviewSubmittedEmail } from "../templates/review-submitted";
import { ReviewApprovedEmail } from "../templates/review-approved";
import { ReviewResponseEmail } from "../templates/review-response";
import { ReviewFlaggedEmail } from "../templates/review-flagged";

describe("Review Email Templates", () => {
  describe("ReviewSubmittedEmail", () => {
    it("renders without errors", () => {
      const element = ReviewSubmittedEmail({
        sellerName: "Seller Joe",
        reviewerName: "Jane Customer",
        productName: "Lion's Mane Kit",
        rating: 5,
        reviewExcerpt: "This was amazing!",
        reviewUrl: "https://www.mashmarket.app/product/lions-mane#reviews",
        dashboardUrl: "https://www.mashmarket.app/seller/my-reviews",
      });

      expect(React.isValidElement(element)).toBe(true);
      const html = renderToStaticMarkup(element);
      expect(html.length).toBeGreaterThan(0);
      expect(html).toContain("Seller Joe");
      expect(html).toContain("Jane Customer");
      expect(html).toContain("Lion");
    });
  });

  describe("ReviewApprovedEmail", () => {
    it("renders without errors", () => {
      const element = ReviewApprovedEmail({
        reviewerName: "Jane Customer",
        productName: "Oyster Mushroom Kit",
        rating: 4,
        reviewExcerpt: "Great quality mushrooms!",
        productUrl: "https://www.mashmarket.app/product/oyster-mushroom#reviews",
      });

      expect(React.isValidElement(element)).toBe(true);
      const html = renderToStaticMarkup(element);
      expect(html.length).toBeGreaterThan(0);
      expect(html).toContain("Jane Customer");
    });
  });

  describe("ReviewResponseEmail", () => {
    it("renders seller response without errors", () => {
      const element = ReviewResponseEmail({
        reviewerName: "Jane Customer",
        productName: "Shiitake Kit",
        responderName: "Seller Joe",
        responderRole: "seller",
        responseText: "Thank you for your kind words!",
        rating: 5,
        reviewExcerpt: "Best mushrooms ever!",
        productUrl: "https://www.mashmarket.app/product/shiitake#reviews",
      });

      expect(React.isValidElement(element)).toBe(true);
      const html = renderToStaticMarkup(element);
      expect(html.length).toBeGreaterThan(0);
      expect(html).toContain("Seller Joe");
    });

    it("renders admin response without errors", () => {
      const element = ReviewResponseEmail({
        reviewerName: "Jane Customer",
        productName: "Shiitake Kit",
        responderName: "Admin",
        responderRole: "admin",
        responseText: "We appreciate your feedback.",
        rating: 3,
        reviewExcerpt: "Average experience",
        productUrl: "https://www.mashmarket.app/product/shiitake#reviews",
      });

      expect(React.isValidElement(element)).toBe(true);
      const html = renderToStaticMarkup(element);
      expect(html.length).toBeGreaterThan(0);
      expect(html).toContain("Admin");
    });
  });

  describe("ReviewFlaggedEmail", () => {
    it("renders without errors", () => {
      const element = ReviewFlaggedEmail({
        adminName: "Admin",
        reviewerName: "Suspicious User",
        productName: "Lion's Mane Kit",
        rating: 1,
        reviewExcerpt: "This is spam content...",
        flagReasons: ["spam", "fake"],
        flaggedBy: "reporter-user",
        dashboardUrl: "https://www.mashmarket.app/seller/reviews",
      });

      expect(React.isValidElement(element)).toBe(true);
      const html = renderToStaticMarkup(element);
      expect(html.length).toBeGreaterThan(0);
    });

    it("includes flag reasons in rendered output", () => {
      const element = ReviewFlaggedEmail({
        adminName: "Admin",
        reviewerName: "User",
        productName: "Kit",
        rating: 1,
        reviewExcerpt: "Bad review",
        flagReasons: ["inappropriate", "offensive"],
        flaggedBy: "reporter",
        dashboardUrl: "https://www.mashmarket.app/seller/reviews",
      });

      const html = renderToStaticMarkup(element);
      expect(html).toContain("inappropriate");
      expect(html).toContain("offensive");
    });
  });
});
