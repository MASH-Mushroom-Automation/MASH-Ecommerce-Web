/**
 * Order Shipped Email Template
 *
 * Sent when order is out for delivery via Lalamove.
 * Includes driver details and tracking information.
 */

import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./email-layout";
import { OrderItems } from "./order-items";

interface OrderShippedEmailProps {
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
  deliveryAddress: string;
  driverName?: string;
  driverPhone?: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
}

export function OrderShippedEmail({
  customerName,
  orderNumber,
  orderId,
  items,
  subtotal,
  deliveryFee,
  total,
  deliveryAddress,
  driverName,
  driverPhone,
  estimatedDelivery,
  trackingUrl,
}: OrderShippedEmailProps) {
  const previewText = `Order #${orderNumber} is on its way! 🚗`;

  return (
    <EmailLayout preview={previewText}>
      {/* Status Badge */}
      <Section style={{ textAlign: "center", padding: "20px" }}>
        <span
          style={{
            ...styles.statusBadge,
            ...styles.statusShipped,
          }}
        >
          🚗 OUT FOR DELIVERY
        </span>
      </Section>

      {/* Greeting */}
      <Section style={{ padding: "0 24px" }}>
        <Text style={styles.heading}>Your Order is On Its Way!</Text>
        <Text style={styles.paragraph}>
          Hi {customerName},
        </Text>
        <Text style={styles.paragraph}>
          Great news! Your order has been picked up by our Lalamove driver and
          is now on its way to you. Please make sure someone is available to
          receive the delivery.
        </Text>
      </Section>

      {/* Order Info */}
      <Section style={orderInfoSection}>
        <Text style={orderInfoLabel}>Order Number</Text>
        <Text style={orderInfoValue}>#{orderNumber}</Text>
        {estimatedDelivery && (
          <>
            <Text style={estimatedLabel}>Estimated Arrival</Text>
            <Text style={estimatedValue}>{estimatedDelivery}</Text>
          </>
        )}
      </Section>

      {/* Driver Info */}
      {(driverName || driverPhone) && (
        <Section style={{ padding: "0 24px" }}>
          <div style={driverCard}>
            <Text style={driverCardTitle}>🚗 Your Driver</Text>
            <div style={driverInfo}>
              <div style={driverAvatar}>
                {driverName ? driverName.charAt(0).toUpperCase() : "D"}
              </div>
              <div>
                <Text style={driverName1}>
                  {driverName || "Lalamove Driver"}
                </Text>
                {driverPhone && (
                  <Text style={driverPhone1}>
                    <a href={`tel:${driverPhone}`} style={phoneLink}>
                      📞 {driverPhone}
                    </a>
                  </Text>
                )}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Delivery Address */}
      <Section style={{ padding: "0 24px" }}>
        <div style={addressCard}>
          <Text style={addressCardTitle}>📍 Delivering To</Text>
          <Text style={addressText}>{deliveryAddress}</Text>
        </div>
      </Section>

      {/* Live Tracking Button */}
      {trackingUrl && (
        <Section style={{ padding: "0 24px" }}>
          <Button href={trackingUrl} style={trackingButton}>
            📍 Track Live on Lalamove
          </Button>
        </Section>
      )}

      {/* Order Items */}
      <Section style={{ padding: "0 24px" }}>
        <OrderItems
          items={items}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
          deliveryMethod="lalamove"
        />
      </Section>

      {/* Current Status */}
      <Section style={{ padding: "0 24px" }}>
        <Text style={statusTitle}>Order Status</Text>
        <div style={statusContainer}>
          <div style={statusStep}>
            <div style={{ ...statusDot, ...statusDotComplete }}>✓</div>
            <Text style={statusStepText}>Placed</Text>
          </div>
          <div style={{ ...statusLine, ...statusLineComplete }}></div>
          <div style={statusStep}>
            <div style={{ ...statusDot, ...statusDotComplete }}>✓</div>
            <Text style={statusStepText}>Confirmed</Text>
          </div>
          <div style={{ ...statusLine, ...statusLineComplete }}></div>
          <div style={statusStep}>
            <div style={{ ...statusDot, ...statusDotComplete }}>✓</div>
            <Text style={statusStepText}>Prepared</Text>
          </div>
          <div style={statusLine}></div>
          <div style={statusStep}>
            <div style={{ ...statusDot, ...statusDotActive }}>●</div>
            <Text style={{ ...statusStepText, fontWeight: "bold" }}>
              Delivering
            </Text>
          </div>
        </div>
      </Section>

      {/* Payment Reminder */}
      <Section style={{ padding: "0 24px" }}>
        <div style={paymentCard}>
          <Text style={paymentTitle}>💵 Payment on Delivery</Text>
          <Text style={paymentText}>
            Please have <strong>₱{total.toFixed(2)}</strong> ready in cash to
            pay the driver upon delivery.
          </Text>
        </div>
      </Section>

      {/* Track Order Button */}
      <Section style={{ padding: "0 24px 24px" }}>
        <Button
          href={`https://mash.ph/orders/${orderId}`}
          style={styles.button}
        >
          View Order Details
        </Button>
      </Section>
    </EmailLayout>
  );
}

// Additional styles
const orderInfoSection = {
  backgroundColor: "#1E40AF",
  padding: "20px",
  textAlign: "center" as const,
  margin: "24px",
  borderRadius: "8px",
};

const orderInfoLabel = {
  fontSize: "12px",
  color: "#BFDBFE",
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
  color: "#BFDBFE",
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

const driverCard = {
  backgroundColor: "#EFF6FF",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "12px",
};

const driverCardTitle = {
  fontSize: "14px",
  fontWeight: "bold" as const,
  color: "#1E40AF",
  margin: "0 0 12px",
};

const driverInfo = {
  display: "flex" as const,
  alignItems: "center" as const,
};

const driverAvatar = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  backgroundColor: "#1E40AF",
  color: "#fff",
  display: "flex" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  fontSize: "20px",
  fontWeight: "bold" as const,
  marginRight: "12px",
};

const driverName1 = {
  fontSize: "16px",
  fontWeight: "600" as const,
  color: "#1E392A",
  margin: "0 0 4px",
};

const driverPhone1 = {
  fontSize: "14px",
  color: "#666",
  margin: "0",
};

const phoneLink = {
  color: "#1E40AF",
  textDecoration: "none",
};

const addressCard = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "12px",
};

const addressCardTitle = {
  fontSize: "14px",
  fontWeight: "bold" as const,
  color: "#1E392A",
  margin: "0 0 8px",
};

const addressText = {
  fontSize: "14px",
  color: "#333",
  margin: "0",
  lineHeight: "1.5",
};

const trackingButton = {
  backgroundColor: "#F97316",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block" as const,
  padding: "12px 24px",
  margin: "16px auto",
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
  backgroundColor: "#1E40AF",
  color: "#fff",
};

const statusLine = {
  width: "30px",
  height: "2px",
  backgroundColor: "#e0e0e0",
  margin: "0 4px 24px",
};

const statusLineComplete = {
  backgroundColor: "#6A994E",
};

const statusStepText = {
  fontSize: "10px",
  color: "#666",
  margin: "0",
};

const paymentCard = {
  backgroundColor: "#FEF3C7",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "16px",
};

const paymentTitle = {
  fontSize: "14px",
  fontWeight: "bold" as const,
  color: "#92400E",
  margin: "0 0 8px",
};

const paymentText = {
  fontSize: "14px",
  color: "#78350F",
  margin: "0",
};

export default OrderShippedEmail;
