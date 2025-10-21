"use client";

import { useState } from "react";
import Image from "next/image";
import SellerDashboardLayout from "@/components/seller/SellerLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderItem {
  name: string;
  variation: string;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  buyer: string;
  buyerAvatar: string;
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: string;
  status: string;
  shippingChannel: string;
  shippingMethod: string;
}

export default function MyOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("order_id");

  const orders: Order[] = [
    {
      id: "9X6H9Q2F5L125YD7SA64DA",
      buyer: "NicoRobin",
      buyerAvatar: "/placeholder.png",
      items: [
        {
          name: "Oyster Mushroom",
          variation: "200g",
          quantity: 1,
          image: "/placeholder.png",
        },
        {
          name: "Mushroom Party",
          variation: "10pcs",
          quantity: 1,
          image: "/placeholder.png",
        },
      ],
      totalPrice: 1150.0,
      paymentMethod: "Cash on Delivery",
      status: "To Ship",
      shippingChannel: "Standard Local",
      shippingMethod: "SPX Express\nDrop off/Pick Up",
    },
    {
      id: "9X6H9Q2F5L125YD7SA64DA",
      buyer: "NicoRobin",
      buyerAvatar: "/placeholder.png",
      items: [
        {
          name: "Oyster Mushroom",
          variation: "200g",
          quantity: 1,
          image: "/placeholder.png",
        },
        {
          name: "Mushroom Party",
          variation: "10pcs",
          quantity: 1,
          image: "/placeholder.png",
        },
      ],
      totalPrice: 1150.0,
      paymentMethod: "Cash on Delivery",
      status: "Unpaid",
      shippingChannel: "Delivery express",
      shippingMethod: "SPX Express\nDrop off/Pick Up",
    },
  ];

  return (
    <SellerDashboardLayout>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
            <TabsTrigger value="toship">To Ship</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="return">Return/Refund</TabsTrigger>
          </TabsList>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order_id">Order ID</SelectItem>
                <SelectItem value="buyer">Buyer Name</SelectItem>
                <SelectItem value="product">Product Name</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Input Order ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <TabsContent value="all" className="space-y-6">
            <div className="mb-4 text-sm text-gray-600">
              {orders.length} Parcels
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-3 border-b bg-gray-50 p-4 rounded-t-lg font-semibold text-sm">
              <div className="col-span-5">Product(s)</div>
              <div className="col-span-2">Total Price</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Shipping Channel</div>
              <div className="col-span-1">Action</div>
            </div>

            {/* Orders */}
            {orders.map((order, orderIndex) => (
              <div
                key={orderIndex}
                className="border rounded-lg overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={order.buyerAvatar}
                      alt={order.buyer}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <span className="font-medium">{order.buyer}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    Order ID {order.id}
                  </span>
                </div>

                {/* Order Content */}
                <div className="grid grid-cols-12 gap-4 p-4 items-start">
                  {/* Products */}
                  <div className="col-span-5 space-y-3">
                    {order.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center space-x-3"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="rounded-md"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">
                            Variation: {item.variation}
                          </p>
                        </div>
                        <p className="text-sm">{item.quantity}x</p>
                      </div>
                    ))}
                  </div>

                  {/* Total Price */}
                  <div className="col-span-2">
                    <p className="font-bold">₱{order.totalPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-600">
                      {order.paymentMethod}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "To Ship"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Shipping Channel */}
                  <div className="col-span-2">
                    <p className="text-sm font-medium">
                      {order.shippingChannel}
                    </p>
                    <p className="text-xs text-gray-600 whitespace-pre-line">
                      {order.shippingMethod}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="col-span-1">
                    <Button
                      variant="link"
                      className="text-[#1E392A] p-0 h-auto font-semibold"
                    >
                      Arrange
                      <br />
                      Shipment
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="unpaid">
            {/* Same structure filtered by unpaid */}
          </TabsContent>
          <TabsContent value="toship">
            {/* Same structure filtered by to ship */}
          </TabsContent>
          <TabsContent value="shipping">
            {/* Same structure filtered by shipping */}
          </TabsContent>
          <TabsContent value="completed">
            {/* Same structure filtered by completed */}
          </TabsContent>
          <TabsContent value="return">
            {/* Same structure filtered by returns */}
          </TabsContent>
        </Tabs>
      </div>
    </SellerDashboardLayout>
  );
}
