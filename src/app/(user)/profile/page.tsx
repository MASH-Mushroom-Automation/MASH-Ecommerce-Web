"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Edit2, Save, Package } from "lucide-react";

const ORDERS = [
  {
    id: "ORD-2025-001",
    date: "October 20, 2025",
    status: "Delivered",
    items: [
      { name: "Fresh White Oyster Mushrooms", quantity: 2, price: 120 },
      { name: "Crispy Mushroom Chicharon", quantity: 1, price: 150 },
    ],
    total: 390,
    payment: "GCash",
    address: "123 Mushroom Lane, Caloocan City",
  },
  {
    id: "ORD-2025-002",
    date: "October 15, 2025",
    status: "Shipping",
    items: [{ name: "Blue Oyster Mushrooms", quantity: 1, price: 150 }],
    total: 150,
    payment: "Cash on Delivery",
    address: "123 Mushroom Lane, Caloocan City",
  },
  {
    id: "ORD-2025-003",
    date: "October 10, 2025",
    status: "To Pay",
    items: [{ name: "DIY Mushroom Growing Kit", quantity: 1, price: 350 }],
    total: 350,
    payment: "Pending",
    address: "123 Mushroom Lane, Caloocan City",
  },
];

export default function ProfilePage() {
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [activeOrderTab, setActiveOrderTab] = useState("all");

  // User info state
  const [userInfo, setUserInfo] = useState({
    firstName: "Juan",
    lastName: "Dela Cruz",
    email: "juan.delacruz@email.com",
    phone: "+63 956 955 2608",
    address: "123 Mushroom Lane",
    city: "Caloocan City",
    province: "Metro Manila",
    postalCode: "1400",
  });

  const filteredOrders = ORDERS.filter((order) => {
    if (activeOrderTab === "all") return true;
    if (activeOrderTab === "to-pay") return order.status === "To Pay";
    if (activeOrderTab === "to-receive") return order.status === "Shipping";
    if (activeOrderTab === "completed") return order.status === "Delivered";
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Shipping":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "To Pay":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Account
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage your account information and orders
          </p>
        </div>

        {/* Profile Overview Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-[#6A994E] text-white text-2xl">
                  {userInfo.firstName[0]}
                  {userInfo.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-900">
                  {userInfo.firstName} {userInfo.lastName}
                </h2>
                <p className="text-gray-600">{userInfo.email}</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                  <Badge variant="secondary" className="rounded">
                    Silver Member
                  </Badge>
                  <Badge variant="outline" className="rounded">
                    {ORDERS.length} Orders
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="information" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="information">My Information</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
          </TabsList>

          {/* My Information Tab */}
          <TabsContent value="information" className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingInfo(!isEditingInfo)}
                >
                  {isEditingInfo ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={userInfo.firstName}
                      disabled={!isEditingInfo}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={userInfo.lastName}
                      disabled={!isEditingInfo}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    disabled={!isEditingInfo}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, email: e.target.value })
                    }
                    icon={<Mail className="h-5 w-5" />}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={userInfo.phone}
                    disabled={!isEditingInfo}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, phone: e.target.value })
                    }
                    icon={<Phone className="h-5 w-5" />}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={userInfo.address}
                    disabled={!isEditingInfo}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, address: e.target.value })
                    }
                    icon={<MapPin className="h-5 w-5" />}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={userInfo.city}
                      disabled={!isEditingInfo}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">Province</Label>
                    <Input
                      id="province"
                      value={userInfo.province}
                      disabled={!isEditingInfo}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, province: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={userInfo.postalCode}
                      disabled={!isEditingInfo}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, postalCode: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Password</p>
                    <p className="text-sm text-gray-500">
                      Last changed 3 months ago
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Order History Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Order Status Filter */}
            <Card>
              <CardContent className="p-4">
                <Tabs value={activeOrderTab} onValueChange={setActiveOrderTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="to-pay">To Pay</TabsTrigger>
                    <TabsTrigger value="to-receive">To Receive</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You haven&apos;t placed any orders yet
                  </p>
                  <Button className="bg-[#6A994E] hover:bg-[#6A994E]/90">
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              Order {order.id}
                            </h3>
                            <Badge
                              variant="outline"
                              className={getStatusColor(order.status)}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{order.date}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 sm:mt-0"
                        >
                          View Details
                        </Button>
                      </div>

                      <Separator className="my-4" />

                      {/* Order Items */}
                      <div className="space-y-3 mb-4">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold text-[#1E392A]">
                              ₱{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-4" />

                      {/* Order Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Payment Method</p>
                          <p className="font-medium text-gray-900">
                            {order.payment}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Delivery Address</p>
                          <p className="font-medium text-gray-900">
                            {order.address}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-gray-600">Order Total</p>
                          <p className="text-xl font-bold text-[#1E392A]">
                            ₱{order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {order.status === "Delivered" && (
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Rate Products
                          </Button>
                          <Button
                            className="flex-1 bg-[#1E392A] hover:bg-[#1E392A]/90"
                            size="sm"
                          >
                            Buy Again
                          </Button>
                        </div>
                      )}
                      {order.status === "Shipping" && (
                        <div className="mt-4">
                          <Button
                            className="w-full bg-[#6A994E] hover:bg-[#6A994E]/90"
                            size="sm"
                          >
                            Track Order
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
