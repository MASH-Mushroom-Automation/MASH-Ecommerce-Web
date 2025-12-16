/**
 * Base Email Layout Component
 *
 * Provides consistent styling for all email templates.
 * Uses React Email components for cross-client compatibility.
 */

import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://mash.ph/logo.png"
              width="120"
              height="40"
              alt="MASH"
              style={logo}
            />
          </Section>

          {/* Content */}
          {children}

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Thank you for choosing MASH Fresh Mushrooms!
            </Text>
            <Text style={footerText}>
              <Link href="https://mash.ph" style={footerLink}>
                Visit our website
              </Link>{" "}
              •{" "}
              <Link href="mailto:support@mash.ph" style={footerLink}>
                Contact support
              </Link>
            </Text>
            <Text style={footerTextSmall}>
              © {new Date().getFullYear()} MASH Fresh Mushrooms. All rights
              reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Reusable styles
export const styles = {
  // Typography
  heading: {
    fontSize: "24px",
    fontWeight: "bold" as const,
    color: "#1E392A",
    textAlign: "center" as const,
    margin: "20px 0",
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#333",
    margin: "16px 0",
  },
  smallText: {
    fontSize: "14px",
    color: "#666",
  },
  // Buttons
  button: {
    backgroundColor: "#6A994E",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold" as const,
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block" as const,
    padding: "14px 24px",
    margin: "24px auto",
  },
  // Sections
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    padding: "20px",
    margin: "16px 0",
  },
  divider: {
    borderTop: "1px solid #eee",
    margin: "24px 0",
  },
  // Status badges
  statusBadge: {
    display: "inline-block" as const,
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "bold" as const,
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  statusApproved: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },
  statusRejected: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
  statusShipped: {
    backgroundColor: "#DBEAFE",
    color: "#1E40AF",
  },
  statusDelivered: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },
};

// Layout styles
const main = {
  backgroundColor: "#f4f4f4",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#1E392A",
  padding: "24px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const footer = {
  backgroundColor: "#f9f9f9",
  padding: "24px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "14px",
  color: "#666",
  margin: "8px 0",
};

const footerLink = {
  color: "#6A994E",
  textDecoration: "none",
};

const footerTextSmall = {
  fontSize: "12px",
  color: "#999",
  margin: "16px 0 0",
};

export default EmailLayout;
