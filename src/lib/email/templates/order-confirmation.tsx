/**
 * Order Confirmation Email Template
 *
 * Sent immediately after a customer places an order.
 * Status: Pending Admin Approval
 */

import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./email-layout";
import { OrderItems } from "./order-items";

interface OrderConfirmationEmailProps {
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
  paymentMethod: string;
}

export function OrderConfirmationEmail({
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
  paymentMethod,
}: OrderConfirmationEmailProps) {
  const previewText = `Order #${orderNumber} received - Awaiting confirmation`;

  return (
    <EmailLayout preview={previewText}>
      {/* Status Badge */}
      <Section style={{ textAlign: "center", padding: "20px" }}>
        <span
          style={{
            ...styles.statusBadge,
            ...styles.statusPending,
          }}
        >
          🕐 PENDING CONFIRMATION
        </span>
      </Section>

      {/* Greeting */}
      <Section style={{ padding: "0 24px" }}>
        <Text style={styles.heading}>Thank You for Your Order!</Text>
        <Text style={styles.paragraph}>
          Hi {customerName},
        </Text>
        <Text style={styles.paragraph}>
          We've received your order and it's now being reviewed by our team.
          You'll receive another email once your order is confirmed.
        </Text>
      </Section>

      {/* Order Info */}
      <Section style={orderInfoSection}>
        <Text style={orderInfoLabel}>Order Number</Text>
        <Text style={orderInfoValue}>#{orderNumber}</Text>
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
            </>
          ) : (
            <>
              <Text style={infoCardTitle}>🏪 Pickup Location</Text>
              <Text style={infoCardText}>
                {pickupLocation || "MASH Fresh Mushrooms Store"}
              </Text>
              <Text style={infoCardNote}>
                We'll notify you when your order is ready for pickup.
              </Text>
            </>
          )}
        </div>

        <div style={infoCard}>
          <Text style={infoCardTitle}>💳 Payment Method</Text>
          <Text style={infoCardText}>
            {paymentMethod === "cod" ? "Cash on Pickup/Delivery" : paymentMethod}
          </Text>
        </div>
      </Section>

      {/* What's Next */}
      <Section style={{ padding: "0 24px" }}>
        <Text style={whatsNextTitle}>What happens next?</Text>
        <ol style={stepsList}>
          <li style={stepItem}>
            <strong>Order Review</strong> - Our team will verify your order and product availability
          </li>
          <li style={stepItem}>
            <strong>Confirmation</strong> - You'll receive an email once approved
          </li>
          <li style={stepItem}>
            <strong>Preparation</strong> - We'll prepare your fresh mushrooms
          </li>
          <li style={stepItem}>
            <strong>
              {deliveryMethod === "lalamove" ? "Delivery" : "Ready for Pickup"}
            </strong>{" "}
            - {deliveryMethod === "lalamove"
              ? "Lalamove driver will deliver to your address"
              : "Come pick up your order at our store"}
          </li>
        </ol>
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
  backgroundColor: "#1E392A",
  padding: "20px",
  textAlign: "center" as const,
  margin: "24px",
  borderRadius: "8px",
};

const orderInfoLabel = {
  fontSize: "12px",
  color: "#A7C957",
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

const whatsNextTitle = {
  fontSize: "18px",
  fontWeight: "bold" as const,
  color: "#1E392A",
  margin: "24px 0 16px",
};

const stepsList = {
  margin: "0",
  paddingLeft: "20px",
};

const stepItem = {
  fontSize: "14px",
  color: "#333",
  marginBottom: "12px",
  lineHeight: "1.5",
};

export default OrderConfirmationEmail;
