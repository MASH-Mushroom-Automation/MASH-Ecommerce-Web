/**
 * Order Approved Email Template
 *
 * Sent when admin approves an order.
 * Status: Approved - Being Prepared
 */

import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./email-layout";
import { OrderItems } from "./order-items";

interface OrderApprovedEmailProps {
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
  deliveryAddress?: string;
  pickupLocation?: string;
  estimatedDelivery?: string;
}

export function OrderApprovedEmail({
  customerName,
  orderNumber,
  orderId,
  items,
  subtotal,
  deliveryFee,
  total,
  deliveryMethod,
  deliveryAddress,
  pickupLocation,
  estimatedDelivery,
}: OrderApprovedEmailProps) {
  const previewText = `Order #${orderNumber} confirmed! We're preparing your mushrooms 🍄`;

  return (
    <EmailLayout preview={previewText}>
      {/* Status Badge */}
      <Section style={{ textAlign: "center", padding: "20px" }}>
        <span
          style={{
            ...styles.statusBadge,
            ...styles.statusApproved,
          }}
        >
          ✅ ORDER CONFIRMED
        </span>
      </Section>

      {/* Greeting */}
      <Section style={{ padding: "0 24px" }}>
        <Text style={styles.heading}>Great News! Your Order is Confirmed!</Text>
        <Text style={styles.paragraph}>
          Hi {customerName},
        </Text>
        <Text style={styles.paragraph}>
          Your order has been approved and we're now preparing your fresh
          mushrooms. We'll notify you when it's ready{" "}
          {deliveryMethod === "lalamove" ? "for delivery" : "for pickup"}.
        </Text>
      </Section>

      {/* Order Info */}
      <Section style={orderInfoSection}>
        <Text style={orderInfoLabel}>Order Number</Text>
        <Text style={orderInfoValue}>#{orderNumber}</Text>
        {estimatedDelivery && (
          <>
            <Text style={estimatedLabel}>Estimated Ready</Text>
            <Text style={estimatedValue}>{estimatedDelivery}</Text>
          </>
        )}
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

      {/* Delivery/Pickup Info */}
      <Section style={{ padding: "0 24px" }}>
        <div style={infoCard}>
          {deliveryMethod === "lalamove" ? (
            <>
              <Text style={infoCardTitle}>📍 Delivery Address</Text>
              <Text style={infoCardText}>{deliveryAddress}</Text>
              <Text style={infoCardNote}>
                A Lalamove driver will be assigned once your order is ready.
              </Text>
            </>
          ) : (
            <>
              <Text style={infoCardTitle}>🏪 Pickup Location</Text>
              <Text style={infoCardText}>
                {pickupLocation || "MASH Fresh Mushrooms Store"}
              </Text>
              <Text style={infoCardNote}>
                We'll send you another email when your order is ready for
                pickup.
              </Text>
            </>
          )}
        </div>
      </Section>

      {/* Current Status */}
      <Section style={{ padding: "0 24px" }}>
        <Text style={statusTitle}>Order Status</Text>
        <div style={statusContainer}>
          <div style={statusStep}>
            <div style={{ ...statusDot, ...statusDotComplete }}>✓</div>
            <Text style={statusStepText}>Order Placed</Text>
          </div>
          <div style={statusLine}></div>
          <div style={statusStep}>
            <div style={{ ...statusDot, ...statusDotComplete }}>✓</div>
            <Text style={statusStepText}>Confirmed</Text>
          </div>
          <div style={statusLine}></div>
          <div style={statusStep}>
            <div style={{ ...statusDot, ...statusDotActive }}>●</div>
            <Text style={{ ...statusStepText, fontWeight: "bold" }}>
              Preparing
            </Text>
          </div>
          <div style={statusLine}></div>
          <div style={statusStep}>
            <div style={statusDot}>○</div>
            <Text style={statusStepText}>
              {deliveryMethod === "lalamove" ? "Out for Delivery" : "Ready"}
            </Text>
          </div>
        </div>
      </Section>

      {/* Track Order Button */}
      <Section style={{ padding: "0 24px 24px" }}>
        <Button
          href={`https://mash.ph/orders/${orderId}`}
          style={styles.button}
        >
          Track Your Order
        </Button>
      </Section>
    </EmailLayout>
  );
}

// Additional styles
const orderInfoSection = {
  backgroundColor: "#6A994E",
  padding: "20px",
  textAlign: "center" as const,
  margin: "24px",
  borderRadius: "8px",
};

const orderInfoLabel = {
  fontSize: "12px",
  color: "#D4EDDA",
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

const estimatedLabel = {
  fontSize: "12px",
  color: "#D4EDDA",
  textTransform: "uppercase" as const,
  margin: "16px 0 4px",
  letterSpacing: "1px",
};

const estimatedValue = {
  fontSize: "16px",
  fontWeight: "600" as const,
  color: "#fff",
  margin: "0",
};

const infoCard = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "12px",
};

const infoCardTitle = {
  fontSize: "14px",
  fontWeight: "bold" as const,
  color: "#1E392A",
  margin: "0 0 8px",
};

const infoCardText = {
  fontSize: "14px",
  color: "#333",
  margin: "0",
};

const infoCardNote = {
  fontSize: "13px",
  color: "#666",
  fontStyle: "italic" as const,
  margin: "8px 0 0",
};

const statusTitle = {
  fontSize: "18px",
  fontWeight: "bold" as const,
  color: "#1E392A",
  margin: "24px 0 16px",
};

const statusContainer = {
  display: "flex" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  padding: "20px 0",
};

const statusStep = {
  textAlign: "center" as const,
};

const statusDot = {
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  backgroundColor: "#e0e0e0",
  display: "flex" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  margin: "0 auto 8px",
  fontSize: "12px",
  color: "#999",
};

const statusDotComplete = {
  backgroundColor: "#6A994E",
  color: "#fff",
};

const statusDotActive = {
  backgroundColor: "#A7C957",
  color: "#1E392A",
};

const statusLine = {
  width: "40px",
  height: "2px",
  backgroundColor: "#e0e0e0",
  margin: "0 8px 24px",
};

const statusStepText = {
  fontSize: "11px",
  color: "#666",
  margin: "0",
};

export default OrderApprovedEmail;
