/**
 * Order Rejected Email Template
 *
 * Sent when admin rejects an order.
 * Includes reason for rejection and next steps.
 */

import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./email-layout";
import { OrderItems } from "./order-items";

interface OrderRejectedEmailProps {
  customerName: string;
  orderNumber: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: "pickup" | "lalamove";
  rejectionReason: string;
}

export function OrderRejectedEmail({
  customerName,
  orderNumber,
  orderId,
  items,
  subtotal,
  deliveryFee,
  total,
  deliveryMethod,
  rejectionReason,
}: OrderRejectedEmailProps) {
  const previewText = `Order #${orderNumber} could not be processed - Action required`;

  return (
    <EmailLayout preview={previewText}>
      {/* Status Badge */}
      <Section style={{ textAlign: "center", padding: "20px" }}>
        <span
          style={{
            ...styles.statusBadge,
            ...styles.statusRejected,
          }}
        >
          ❌ ORDER CANCELLED
        </span>
      </Section>

      {/* Greeting */}
      <Section style={{ padding: "0 24px" }}>
        <Text style={styles.heading}>We're Sorry, Your Order Could Not Be Processed</Text>
        <Text style={styles.paragraph}>
          Hi {customerName},
        </Text>
        <Text style={styles.paragraph}>
          Unfortunately, we were unable to process your order at this time. We
          sincerely apologize for any inconvenience this may cause.
        </Text>
      </Section>

      {/* Order Info */}
      <Section style={orderInfoSection}>
        <Text style={orderInfoLabel}>Order Number</Text>
        <Text style={orderInfoValue}>#{orderNumber}</Text>
      </Section>

      {/* Rejection Reason */}
      <Section style={{ padding: "0 24px" }}>
        <div style={reasonCard}>
          <Text style={reasonTitle}>📋 Reason</Text>
          <Text style={reasonText}>{rejectionReason}</Text>
        </div>
      </Section>

      {/* Order Items */}
      <Section style={{ padding: "0 24px" }}>
        <OrderItems
          items={items}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
          deliveryMethod={deliveryMethod}
        />
      </Section>

      {/* What's Next */}
      <Section style={{ padding: "0 24px" }}>
        <Text style={whatsNextTitle}>What can you do?</Text>
        <ul style={optionsList}>
          <li style={optionItem}>
            <strong>Try ordering again</strong> - Some items may have become
            available or the issue may have been resolved
          </li>
          <li style={optionItem}>
            <strong>Contact us</strong> - If you have questions about why your
            order was cancelled, please reach out to our support team
          </li>
          <li style={optionItem}>
            <strong>Check product availability</strong> - Visit our shop to see
            what's currently in stock
          </li>
        </ul>
      </Section>

      {/* No Charge Notice */}
      <Section style={{ padding: "0 24px" }}>
        <div style={noticeCard}>
          <Text style={noticeText}>
            💳 <strong>No charge was made</strong> - Since we use Cash on
            Pickup/Delivery, no payment was processed for this order.
          </Text>
        </div>
      </Section>

      {/* CTA Buttons */}
      <Section style={{ padding: "0 24px 24px", textAlign: "center" }}>
        <Button href="https://mash.ph/shop" style={styles.button}>
          Browse Our Products
        </Button>
        <Text style={styles.smallText}>
          or{" "}
          <a href="mailto:support@mash.ph" style={linkStyle}>
            contact support
          </a>{" "}
          for assistance
        </Text>
      </Section>
    </EmailLayout>
  );
}

// Additional styles
const orderInfoSection = {
  backgroundColor: "#991B1B",
  padding: "20px",
  textAlign: "center" as const,
  margin: "24px",
  borderRadius: "8px",
};

const orderInfoLabel = {
  fontSize: "12px",
  color: "#FCA5A5",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
  letterSpacing: "1px",
};

const orderInfoValue = {
  fontSize: "28px",
  fontWeight: "bold" as const,
  color: "#fff",
  margin: "0",
};

const reasonCard = {
  backgroundColor: "#FEF2F2",
  borderLeft: "4px solid #991B1B",
  borderRadius: "0 8px 8px 0",
  padding: "16px 20px",
  marginBottom: "24px",
};

const reasonTitle = {
  fontSize: "14px",
  fontWeight: "bold" as const,
  color: "#991B1B",
  margin: "0 0 8px",
};

const reasonText = {
  fontSize: "14px",
  color: "#7F1D1D",
  margin: "0",
  lineHeight: "1.5",
};

const whatsNextTitle = {
  fontSize: "18px",
  fontWeight: "bold" as const,
  color: "#1E392A",
  margin: "24px 0 16px",
};

const optionsList = {
  margin: "0",
  paddingLeft: "20px",
};

const optionItem = {
  fontSize: "14px",
  color: "#333",
  marginBottom: "12px",
  lineHeight: "1.5",
};

const noticeCard = {
  backgroundColor: "#F0FDF4",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "16px",
};

const noticeText = {
  fontSize: "14px",
  color: "#166534",
  margin: "0",
};

const linkStyle = {
  color: "#6A994E",
  textDecoration: "underline",
};

export default OrderRejectedEmail;
