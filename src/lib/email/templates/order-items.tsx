/**
 * Order Items Component
 *
 * Reusable component for displaying order items in emails.
 */

import { Column, Img, Row, Section, Text } from "@react-email/components";
import * as React from "react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderItemsProps {
  items: OrderItem[];
  subtotal: number;
  deliveryFee?: number;
  total: number;
  deliveryMethod?: "pickup" | "lalamove";
}

export function OrderItems({
  items,
  subtotal,
  deliveryFee = 0,
  total,
  deliveryMethod = "pickup",
}: OrderItemsProps) {
  return (
    <Section style={container}>
      <Text style={sectionTitle}>Order Details</Text>

      {/* Order Items */}
      {items.map((item, index) => (
        <Row key={index} style={itemRow}>
          <Column style={imageColumn}>
            <Img
              src={item.image || "https://mash.ph/placeholder-product.png"}
              width="60"
              height="60"
              alt={item.name}
              style={productImage}
            />
          </Column>
          <Column style={detailsColumn}>
            <Text style={itemName}>{item.name}</Text>
            <Text style={itemQuantity}>Qty: {item.quantity}</Text>
          </Column>
          <Column style={priceColumn}>
            <Text style={itemPrice}>₱{item.price.toFixed(2)}</Text>
          </Column>
        </Row>
      ))}

      {/* Divider */}
      <hr style={divider} />

      {/* Summary */}
      <Row style={summaryRow}>
        <Column>
          <Text style={summaryLabel}>Subtotal</Text>
        </Column>
        <Column>
          <Text style={summaryValue}>₱{subtotal.toFixed(2)}</Text>
        </Column>
      </Row>

      {deliveryMethod === "lalamove" && (
        <Row style={summaryRow}>
          <Column>
            <Text style={summaryLabel}>Delivery Fee (Lalamove)</Text>
          </Column>
          <Column>
            <Text style={summaryValue}>₱{deliveryFee.toFixed(2)}</Text>
          </Column>
        </Row>
      )}

      {deliveryMethod === "pickup" && (
        <Row style={summaryRow}>
          <Column>
            <Text style={summaryLabel}>Pickup</Text>
          </Column>
          <Column>
            <Text style={summaryValueFree}>FREE</Text>
          </Column>
        </Row>
      )}

      <hr style={divider} />

      <Row style={totalRow}>
        <Column>
          <Text style={totalLabel}>Total</Text>
        </Column>
        <Column>
          <Text style={totalValue}>₱{total.toFixed(2)}</Text>
        </Column>
      </Row>
    </Section>
  );
}

// Styles
const container = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "bold" as const,
  color: "#1E392A",
  marginBottom: "16px",
};

const itemRow = {
  marginBottom: "12px",
};

const imageColumn = {
  width: "70px",
};

const productImage = {
  borderRadius: "8px",
  objectFit: "cover" as const,
};

const detailsColumn = {
  paddingLeft: "12px",
  verticalAlign: "top" as const,
};

const priceColumn = {
  textAlign: "right" as const,
  verticalAlign: "top" as const,
};

const itemName = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#333",
  margin: "0 0 4px",
};

const itemQuantity = {
  fontSize: "13px",
  color: "#666",
  margin: "0",
};

const itemPrice = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#333",
  margin: "0",
};

const divider = {
  borderTop: "1px solid #ddd",
  margin: "16px 0",
};

const summaryRow = {
  marginBottom: "8px",
};

const summaryLabel = {
  fontSize: "14px",
  color: "#666",
  margin: "0",
};

const summaryValue = {
  fontSize: "14px",
  color: "#333",
  textAlign: "right" as const,
  margin: "0",
};

const summaryValueFree = {
  fontSize: "14px",
  color: "#6A994E",
  fontWeight: "600" as const,
  textAlign: "right" as const,
  margin: "0",
};

const totalRow = {
  marginTop: "8px",
};

const totalLabel = {
  fontSize: "16px",
  fontWeight: "bold" as const,
  color: "#1E392A",
  margin: "0",
};

const totalValue = {
  fontSize: "18px",
  fontWeight: "bold" as const,
  color: "#1E392A",
  textAlign: "right" as const,
  margin: "0",
};

export default OrderItems;
