/**
 * Order Delivered Email Template
 *
 * Sent when order has been successfully delivered.
 * Includes thank you message and review request.
 */

import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./email-layout";
import { OrderItems } from "./order-items";

interface OrderDeliveredEmailProps {
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
}

export function OrderDeliveredEmail({
  customerName,
  orderNumber,
  orderId,
  items,
  subtotal,
  deliveryFee,
  total,
  deliveryMethod,
}: OrderDeliveredEmailProps) {
  const previewText = `Order #${orderNumber} ${
    deliveryMethod === "lalamove" ? "delivered" : "picked up"
  } successfully! 🎉`;

  return (
    <EmailLayout preview={previewText}>
      {/* Status Badge */}
      <Section style={{ textAlign: "center", padding: "20px" }}>
        <span
          style={{
            ...styles.statusBadge,
            ...styles.statusDelivered,
          }}
        >
          🎉 {deliveryMethod === "lalamove" ? "DELIVERED" : "PICKED UP"}
        </span>
      </Section>

      {/* Greeting */}
      <Section style={{ padding: "0 24px" }}>
        <Text style={styles.heading}>
          {deliveryMethod === "lalamove"
            ? "Your Order Has Been Delivered!"
            : "Thanks for Picking Up Your Order!"}
        </Text>
        <Text style={styles.paragraph}>
          Hi {customerName},
        </Text>
        <Text style={styles.paragraph}>
          {deliveryMethod === "lalamove"
            ? "Your fresh mushrooms have been delivered! We hope you enjoy them."
            : "Thank you for visiting us to pick up your order. We hope you enjoy your fresh mushrooms!"}
        </Text>
      </Section>

      {/* Celebration Section */}
      <Section style={celebrationSection}>
        <Text style={celebrationEmoji}>🍄</Text>
        <Text style={celebrationTitle}>Thank You for Your Order!</Text>
        <Text style={celebrationText}>
          We truly appreciate your business and hope our fresh mushrooms bring
          joy to your kitchen.
        </Text>
      </Section>

      {/* Order Info */}
      <Section style={orderInfoSection}>
        <Text style={orderInfoLabel}>Order Number</Text>
        <Text style={orderInfoValue}>#{orderNumber}</Text>
        <Text style={completedLabel}>✓ COMPLETED</Text>
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

      {/* Order Status - Complete */}
      <Section style={{ padding: "0 24px" }}>
        <Text style={statusTitle}>Order Complete!</Text>
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
          <div style={{ ...statusLine, ...statusLineComplete }}></div>
          <div style={statusStep}>
            <div style={{ ...statusDot, ...statusDotComplete }}>✓</div>
            <Text style={{ ...statusStepText, fontWeight: "bold" }}>
              {deliveryMethod === "lalamove" ? "Delivered" : "Picked Up"}
            </Text>
          </div>
        </div>
      </Section>

      {/* Review Request */}
      <Section style={{ padding: "0 24px" }}>
        <div style={reviewCard}>
          <Text style={reviewTitle}>⭐ How was your experience?</Text>
          <Text style={reviewText}>
            We'd love to hear your feedback! Your reviews help other customers
            and help us improve our products and service.
          </Text>
          <Button
            href={`https://mash.ph/orders/${orderId}/review`}
            style={reviewButton}
          >
            Leave a Review
          </Button>
        </div>
      </Section>

      {/* Recipe Suggestions */}
      <Section style={{ padding: "0 24px" }}>
        <div style={recipeCard}>
          <Text style={recipeTitle}>🍳 Need Recipe Ideas?</Text>
          <Text style={recipeText}>
            Check out our blog for delicious mushroom recipes from simple
            stir-fries to gourmet dishes!
          </Text>
          <Button href="https://mash.ph/recipes" style={recipeButton}>
            Browse Recipes
          </Button>
        </div>
      </Section>

      {/* Reorder Button */}
      <Section style={{ padding: "0 24px 24px", textAlign: "center" }}>
        <Button href="https://mash.ph/shop" style={styles.button}>
          Order Again
        </Button>
        <Text style={styles.smallText}>
          Use code <strong>FRESH10</strong> for 10% off your next order!
        </Text>
      </Section>
    </EmailLayout>
  );
}

// Additional styles
const celebrationSection = {
  backgroundColor: "#F0FDF4",
  padding: "24px",
  margin: "0 24px 24px",
  borderRadius: "8px",
  textAlign: "center" as const,
};

const celebrationEmoji = {
  fontSize: "48px",
  margin: "0",
};

const celebrationTitle = {
  fontSize: "20px",
  fontWeight: "bold" as const,
  color: "#166534",
  margin: "12px 0 8px",
};

const celebrationText = {
  fontSize: "14px",
  color: "#15803D",
  margin: "0",
};

const orderInfoSection = {
  backgroundColor: "#6A994E",
  padding: "20px",
  textAlign: "center" as const,
  margin: "0 24px 24px",
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
  margin: "0 0 8px",
};

const completedLabel = {
  fontSize: "12px",
  fontWeight: "bold" as const,
  color: "#A7C957",
  margin: "0",
  letterSpacing: "1px",
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

const reviewCard = {
  backgroundColor: "#FFFBEB",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "16px",
  textAlign: "center" as const,
};

const reviewTitle = {
  fontSize: "16px",
  fontWeight: "bold" as const,
  color: "#92400E",
  margin: "0 0 8px",
};

const reviewText = {
  fontSize: "14px",
  color: "#78350F",
  margin: "0 0 16px",
};

const reviewButton = {
  backgroundColor: "#F59E0B",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  padding: "10px 20px",
};

const recipeCard = {
  backgroundColor: "#FFF7ED",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "16px",
  textAlign: "center" as const,
};

const recipeTitle = {
  fontSize: "16px",
  fontWeight: "bold" as const,
  color: "#9A3412",
  margin: "0 0 8px",
};

const recipeText = {
  fontSize: "14px",
  color: "#7C2D12",
  margin: "0 0 16px",
};

const recipeButton = {
  backgroundColor: "#EA580C",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  padding: "10px 20px",
};

export default OrderDeliveredEmail;
