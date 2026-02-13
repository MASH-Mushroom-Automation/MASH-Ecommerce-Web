/**
 * Review Response Email Template
 *
 * Sent to reviewer when a seller or admin responds to their review.
 */

import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./email-layout";

interface ReviewResponseEmailProps {
  reviewerName: string;
  productName: string;
  responderName: string;
  responderRole: "seller" | "admin";
  responseText: string;
  rating: number;
  reviewExcerpt: string;
  productUrl: string;
}

export function ReviewResponseEmail({
  reviewerName,
  productName,
  responderName,
  responderRole,
  responseText,
  rating,
  reviewExcerpt,
  productUrl,
}: ReviewResponseEmailProps) {
  const roleLabel = responderRole === "seller" ? "Seller" : "Admin";
  const previewText = `${responderName} (${roleLabel}) responded to your review of ${productName}`;

  return (
    <EmailLayout preview={previewText}>
      <Section style={{ textAlign: "center", padding: "20px" }}>
        <span style={{ ...styles.statusBadge, backgroundColor: "#dbeafe", color: "#2563eb" }}>
          NEW RESPONSE
        </span>
      </Section>

      <Section style={{ padding: "0 24px" }}>
        <Text style={styles.heading}>You Got a Response!</Text>
        <Text style={styles.paragraph}>
          Hi {reviewerName},
        </Text>
        <Text style={styles.paragraph}>
          <strong>{responderName}</strong> ({roleLabel}) has responded to your {rating}-star review
          of <strong>{productName}</strong>.
        </Text>
      </Section>

      <Section style={reviewCardStyle}>
        <Text style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" as const }}>
          YOUR REVIEW
        </Text>
        <Text style={{ margin: "0 0 4px 0", color: "#f59e0b", fontSize: "16px", letterSpacing: "2px" }}>
          {"★".repeat(rating)}{"☆".repeat(5 - rating)}
        </Text>
        <Text style={{ ...styles.paragraph, fontStyle: "italic", margin: 0 }}>
          &ldquo;{reviewExcerpt}&rdquo;
        </Text>
      </Section>

      <Section style={responseCardStyle}>
        <Text style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" as const }}>
          {roleLabel.toUpperCase()} RESPONSE
        </Text>
        <Text style={{ ...styles.paragraph, margin: 0 }}>
          {responseText}
        </Text>
        <Text style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#9ca3af" }}>
          - {responderName}
        </Text>
      </Section>

      <Section style={{ padding: "0 24px", textAlign: "center" as const }}>
        <Button style={styles.button} href={productUrl}>
          View Response
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
  margin: "16px 24px 8px 24px",
  padding: "16px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  borderLeft: "4px solid #d1d5db",
};

const responseCardStyle: React.CSSProperties = {
  margin: "8px 24px 16px 24px",
  padding: "16px",
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  borderLeft: "4px solid #2563eb",
};
