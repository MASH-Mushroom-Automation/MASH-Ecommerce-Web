/**
 * Review Flagged Email Template
 *
 * Sent to admin when a review is flagged for moderation.
 */

import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./email-layout";

interface ReviewFlaggedEmailProps {
  adminName: string;
  reviewerName: string;
  productName: string;
  rating: number;
  reviewExcerpt: string;
  flagReasons: string[];
  flaggedBy: string;
  dashboardUrl: string;
}

export function ReviewFlaggedEmail({
  adminName,
  reviewerName,
  productName,
  rating,
  reviewExcerpt,
  flagReasons,
  flaggedBy,
  dashboardUrl,
}: ReviewFlaggedEmailProps) {
  const previewText = `A review for ${productName} has been flagged for moderation`;

  return (
    <EmailLayout preview={previewText}>
      <Section style={{ textAlign: "center", padding: "20px" }}>
        <span style={{ ...styles.statusBadge, backgroundColor: "#fef2f2", color: "#dc2626" }}>
          REVIEW FLAGGED
        </span>
      </Section>

      <Section style={{ padding: "0 24px" }}>
        <Text style={styles.heading}>Review Needs Moderation</Text>
        <Text style={styles.paragraph}>
          Hi {adminName},
        </Text>
        <Text style={styles.paragraph}>
          A review by <strong>{reviewerName}</strong> on <strong>{productName}</strong> has been
          flagged for moderation by {flaggedBy}. Please review and take appropriate action.
        </Text>
      </Section>

      <Section style={flagCardStyle}>
        <Text style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#dc2626", fontWeight: "600" as const }}>
          FLAG REASONS
        </Text>
        {flagReasons.map((reason, index) => (
          <Text key={index} style={{ margin: "4px 0", fontSize: "14px", color: "#374151" }}>
            - {reason}
          </Text>
        ))}
      </Section>

      <Section style={reviewCardStyle}>
        <Text style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" as const }}>
          FLAGGED REVIEW
        </Text>
        <Text style={{ margin: "0 0 4px 0", color: "#f59e0b", fontSize: "16px", letterSpacing: "2px" }}>
          {"★".repeat(rating)}{"☆".repeat(5 - rating)}
        </Text>
        <Text style={{ ...styles.paragraph, fontStyle: "italic", margin: "0 0 8px 0" }}>
          &ldquo;{reviewExcerpt}&rdquo;
        </Text>
        <Text style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
          By {reviewerName}
        </Text>
      </Section>

      <Section style={{ padding: "0 24px", textAlign: "center" as const }}>
        <Button style={{ ...styles.button, backgroundColor: "#dc2626" }} href={dashboardUrl}>
          Review in Dashboard
        </Button>
      </Section>

      <Section style={{ padding: "16px 24px" }}>
        <Text style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center" as const }}>
          This is an automated moderation alert. You are receiving this because you are an admin.
        </Text>
      </Section>
    </EmailLayout>
  );
}

const flagCardStyle: React.CSSProperties = {
  margin: "16px 24px 8px 24px",
  padding: "16px",
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  borderLeft: "4px solid #dc2626",
};

const reviewCardStyle: React.CSSProperties = {
  margin: "8px 24px 16px 24px",
  padding: "16px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  borderLeft: "4px solid #d1d5db",
};
