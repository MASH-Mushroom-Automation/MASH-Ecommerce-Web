"use client";

import { useState } from "react";
import Image from "next/image";
import SellerDashboardLayout from "@/components/seller/SellerLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

interface ReturnRequest {
  id: string;
  requestId: string;
  orderId: string;
  buyerName: string;
  buyerAvatar: string;
  productName: string;
  variation: string;
  price: number;
  image: string;
  requestReason: string;
  status: string;
  dueDate: string;
}

export default function ReturnsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const requests: ReturnRequest[] = [
    {
      id: "1",
      requestId: "REFUND9X6H9Q2F5L125",
      orderId: "9X6H9Q2F5L125",
      buyerName: "Mikaela Samante",
      buyerAvatar: "/placeholder.png",
      productName: "Mushroom Party",
      variation: "1kg",
      price: 900.0,
      image: "/placeholder.png",
      requestReason: "Wrong Item Received",
      status: "In Seller Review",
      dueDate: "3 Days",
    },
    {
      id: "2",
      requestId: "REFUND9X6H9Q2F5L125",
      orderId: "9X6H9Q2F5L125",
      buyerName: "Mikaela Samante",
      buyerAvatar: "/placeholder.png",
      productName: "Mushroom Party",
      variation: "1kg",
      price: 900.0,
      image: "/placeholder.png",
      requestReason: "Wrong Item Received",
      status: "In Seller Review",
      dueDate: "3 Days",
    },
  ];

  return (
    <SellerDashboardLayout>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Return/Refund/Cancel</h1>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 max-w-2xl">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="refund">Refund</TabsTrigger>
            <TabsTrigger value="cancellation">Cancellation</TabsTrigger>
            <TabsTrigger value="failed">Failed Delivery</TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search by Order ID or Request ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button className="bg-[#1E392A] hover:bg-[#1E392A]/90">
              Search
            </Button>
          </div>

          <TabsContent value="all" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              {requests.length} Request
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-3 border-b bg-gray-50 p-4 rounded-t-lg font-semibold text-sm">
              <div className="col-span-1 flex items-center">
                <Checkbox />
              </div>
              <div className="col-span-3">Product(s)</div>
              <div className="col-span-2 flex items-center gap-1 cursor-pointer">
                Amount <ArrowUpDown className="h-3 w-3" />
              </div>
              <div className="col-span-2">Request Reason</div>
              <div className="col-span-2">Request Status</div>
              <div className="col-span-1">Due Date</div>
              <div className="col-span-1">Action</div>
            </div>

            {/* Requests */}
            {requests.map((request) => (
              <div
                key={request.id}
                className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50"
              >
                <div className="col-span-1 flex items-start pt-4">
                  <Checkbox />
                </div>
                <div className="col-span-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.buyerAvatar} />
                      <AvatarFallback>M</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">{request.buyerName}</p>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    Order ID: {request.orderId}
                  </div>
                  <div className="text-xs text-gray-600 mb-3">
                    Request ID: {request.requestId}
                  </div>
                  <div className="flex items-start space-x-3">
                    <Image
                      src={request.image}
                      alt={request.productName}
                      width={60}
                      height={60}
                      className="rounded-md"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {request.productName}
                      </p>
                      <p className="text-xs text-gray-600">
                        Variation: {request.variation}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 flex items-start pt-4">
                  <p className="font-semibold text-lg">
                    ₱ {request.price.toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2 flex items-start pt-4">
                  <p className="text-sm">{request.requestReason}</p>
                </div>
                <div className="col-span-2 flex items-start pt-4">
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    {request.status}
                  </Badge>
                </div>
                <div className="col-span-1 flex items-start pt-4">
                  <p className="text-sm font-medium text-red-600">
                    {request.dueDate}
                  </p>
                </div>
                <div className="col-span-1 flex flex-col gap-2 items-start pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50 w-full"
                  >
                    Dispute
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#6A994E] hover:bg-[#6A994E]/90 w-full"
                  >
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="refund">
            <div className="text-sm text-gray-600 mb-4">0 Request</div>
            <div className="text-center py-12 text-gray-500">
              No refund requests found
            </div>
          </TabsContent>
          <TabsContent value="cancellation">
            <div className="text-sm text-gray-600 mb-4">0 Request</div>
            <div className="text-center py-12 text-gray-500">
              No cancellation requests found
            </div>
          </TabsContent>
          <TabsContent value="failed">
            <div className="text-sm text-gray-600 mb-4">0 Request</div>
            <div className="text-center py-12 text-gray-500">
              No failed delivery requests found
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SellerDashboardLayout>
  );
}
