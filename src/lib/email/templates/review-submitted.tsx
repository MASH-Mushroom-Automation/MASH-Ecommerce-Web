/**
 * Review Submitted Email Template
 *
 * Sent to seller when a new review is posted on their product.
 */

import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./email-layout";

interface ReviewSubmittedEmailProps {
  sellerName: string;
  reviewerName: string;
  productName: string;
  rating: number;
  reviewExcerpt: string;
  reviewUrl: string;
  dashboardUrl: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ fontSize: "18px", letterSpacing: "2px" }}>
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export function ReviewSubmittedEmail({
  sellerName,
  reviewerName,
  productName,
  rating,
  reviewExcerpt,
  reviewUrl,
  dashboardUrl,
}: ReviewSubmittedEmailProps) {
  const previewText = `New ${rating}-star review on ${productName}`;

  return (
    <EmailLayout preview={previewText}>
      <Section style={{ padding: "0 24px" }}>
        <Text style={styles.heading}>New Review on Your Product</Text>
        <Text style={styles.paragraph}>
          Hi {sellerName},
        </Text>
        <Text style={styles.paragraph}>
          {reviewerName} left a review on <strong>{productName}</strong>.
        </Text>
      </Section>

      {/* Review Card */}
      <Section style={reviewCardStyle}>
        <Text style={{ margin: "0 0 8px 0", color: "#f59e0b" }}>
          <StarRating rating={rating} />
        </Text>
        <Text style={{ ...styles.paragraph, fontStyle: "italic", margin: "0 0 8px 0" }}>
          &ldquo;{reviewExcerpt}&rdquo;
        </Text>
        <Text style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
          - {reviewerName}
        </Text>
      </Section>

      <Section style={{ padding: "0 24px", textAlign: "center" as const }}>
        <Button style={styles.button} href={reviewUrl}>
          View Review
        </Button>
        <Text style={{ ...styles.paragraph, fontSize: "13px", marginTop: "16px" }}>
          You can respond to this review from your{" "}
          <a href={dashboardUrl} style={{ color: "#16a34a" }}>seller dashboard</a>.
        </Text>
      </Section>

      <Section style={{ padding: "16px 24px" }}>
        <Text style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center" as const }}>
          To unsubscribe from review notifications, update your notification preferences in Settings.
        </Text>
      </Section>
    </EmailLayout>
  );
}

const reviewCardStyle: React.CSSProperties = {
  margin: "16px 24px",
  padding: "16px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  borderLeft: "4px solid #16a34a",
};
