/**
 * Review Approved Email Template
 *
 * Sent to reviewer when their review is approved by admin.
 */

import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./email-layout";

interface ReviewApprovedEmailProps {
  reviewerName: string;
  productName: string;
  rating: number;
  reviewExcerpt: string;
  productUrl: string;
}

export function ReviewApprovedEmail({
  reviewerName,
  productName,
  rating,
  reviewExcerpt,
  productUrl,
}: ReviewApprovedEmailProps) {
  const previewText = `Your review for ${productName} has been approved`;

  return (
    <EmailLayout preview={previewText}>
      <Section style={{ textAlign: "center", padding: "20px" }}>
        <span style={{ ...styles.statusBadge, backgroundColor: "#dcfce7", color: "#16a34a" }}>
          REVIEW APPROVED
        </span>
      </Section>

      <Section style={{ padding: "0 24px" }}>
        <Text style={styles.heading}>Your Review is Live!</Text>
        <Text style={styles.paragraph}>
          Hi {reviewerName},
        </Text>
        <Text style={styles.paragraph}>
          Your {rating}-star review for <strong>{productName}</strong> has been approved and is now
          visible to other shoppers. Thank you for sharing your feedback!
        </Text>
      </Section>

      <Section style={reviewCardStyle}>
        <Text style={{ margin: "0 0 8px 0", color: "#f59e0b", fontSize: "18px", letterSpacing: "2px" }}>
          {"★".repeat(rating)}{"☆".repeat(5 - rating)}
        </Text>
        <Text style={{ ...styles.paragraph, fontStyle: "italic", margin: 0 }}>
          &ldquo;{reviewExcerpt}&rdquo;
        </Text>
      </Section>

      <Section style={{ padding: "0 24px", textAlign: "center" as const }}>
        <Button style={styles.button} href={productUrl}>
          View on Product Page
        </Button>
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
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  borderLeft: "4px solid #16a34a",
};
