"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Loader2 } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import Image from "next/image";

export default function OrderHistoryPage() {
  const [orderTab, setOrderTab] = useState<
    "to-pay" | "to-receive" | "completed"
  >("to-pay");

  // Fetch orders with current tab filter
  const { orders, loading, error } = useOrders({ status: orderTab });

  const filteredOrders = orders.filter((order) => order.status === orderTab);

  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6 sm:p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#1E392A]" />
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6 sm:p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="h-12 w-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load orders
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#6A994E] text-white rounded-md hover:bg-[#1E392A]"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-1">
          <Package className="h-5 w-5 text-[#1E392A]" />
          <h2 className="text-xl font-bold text-[#212121]">Order History</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          You can view your order history here
        </p>

        {/* Order Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setOrderTab("to-pay")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              orderTab === "to-pay" ? "text-[#1E392A]" : "text-gray-500"
            }`}
          >
            To Pay
            {orderTab === "to-pay" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E392A]" />
            )}
          </button>
          <button
            onClick={() => setOrderTab("to-receive")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              orderTab === "to-receive" ? "text-[#1E392A]" : "text-gray-500"
            }`}
          >
            To Receive
            {orderTab === "to-receive" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E392A]" />
            )}
          </button>
          <button
            onClick={() => setOrderTab("completed")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              orderTab === "completed" ? "text-[#1E392A]" : "text-gray-500"
            }`}
          >
            Completed
            {orderTab === "completed" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E392A]" />
            )}
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <Package className="h-5 w-5 text-[#1E392A]" />
                  <span className="text-sm text-gray-600">{order.date}</span>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-6">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden relative flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Estimated Shipping Day
                    </span>
                    <span className="font-medium">{order.shipping}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">{order.payment}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2">
                    <span>Total Fee</span>
                    <span className="text-[#1E392A]">
                      ₱{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No orders in this category
          </div>
        )}
      </CardContent>
    </Card>
  );
}
