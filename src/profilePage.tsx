"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, User, ShoppingBag, LogOut } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  estimatedShipping: string;
  paymentMethod: string;
  totalFee: number;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("info");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "Juanito",
    lastName: "Dela Cruz",
    email: "jdelacruz@gmail.com",
    phone: "+63 956 955 2808",
    newPassword: "",
    confirmPassword: "",
    streetAddress: "Brgy 176-b Bagong Silang",
    addressLine2: "",
    city: "Caloocan City",
    stateProvince: "",
    zipCode: "1428",
    landmark: "",
  });

  const orders: Order[] = [
    {
      id: "1",
      date: "3:47PM 09 / 25 / 2025",
      items: [
        {
          name: "Fresh White Oyster Mushrooms",
          quantity: 1,
          price: 120.0,
          image: "/placeholder.png",
        },
        {
          name: "Vibrant Pink Oyster Mushrooms",
          quantity: 2,
          price: 280.0,
          image: "/placeholder.png",
        },
        {
          name: "Dried Shiitake Mushrooms",
          quantity: 1,
          price: 200.0,
          image: "/placeholder.png",
        },
        {
          name: "Lions Mane 'Brain' Mushrooms",
          quantity: 1,
          price: 250.0,
          image: "/placeholder.png",
        },
      ],
      estimatedShipping: "1-3 Days",
      paymentMethod: "Cash-on-Delivery (COD)",
      totalFee: 832.0,
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setShowSuccessModal(true);
    setHasChanges(false);
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 2000);
  };

  const handleDiscard = () => {
    setFormData({
      firstName: "Juanito",
      lastName: "Dela Cruz",
      email: "jdelacruz@gmail.com",
      phone: "+63 956 955 2808",
      newPassword: "",
      confirmPassword: "",
      streetAddress: "Brgy 176-b Bagong Silang",
      addressLine2: "",
      city: "Caloocan City",
      stateProvince: "",
      zipCode: "1428",
      landmark: "",
    });
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-end mb-6">
          <Button variant="ghost" className="text-gray-600">
            <User className="mr-2 h-4 w-4" />
            Account
          </Button>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-xl font-bold mb-6">Account</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("info")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "info"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <User className="h-5 w-5" />
                <span>My Information</span>
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "orders"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Order History</span>
              </button>
            </nav>
            <div className="border-t mt-6 pt-6">
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-left transition-colors">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {activeTab === "info" && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-6 w-6 text-[#6A994E]" />
                  <h2 className="text-2xl font-bold">Account Information</h2>
                </div>
                <p className="text-gray-600 mb-8">
                  You can change your information here seamlessly
                </p>

                <div className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) =>
                          handleInputChange("newPassword", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* My Address Section */}
                  <div className="border-t pt-6 mt-8">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="h-6 w-6 rounded-full bg-[#6A994E] flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                      <h3 className="text-xl font-bold">My Address</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                      We&apos;ll ship your orders to this address.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="streetAddress">Street Address</Label>
                        <Input
                          id="streetAddress"
                          value={formData.streetAddress}
                          onChange={(e) =>
                            handleInputChange("streetAddress", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="addressLine2">Address Line 2</Label>
                        <Input
                          id="addressLine2"
                          value={formData.addressLine2}
                          onChange={(e) =>
                            handleInputChange("addressLine2", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stateProvince">
                          State/Province/Region
                        </Label>
                        <Input
                          id="stateProvince"
                          value={formData.stateProvince}
                          onChange={(e) =>
                            handleInputChange("stateProvince", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) =>
                            handleInputChange("zipCode", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="landmark">Landmark</Label>
                        <Input
                          id="landmark"
                          value={formData.landmark}
                          onChange={(e) =>
                            handleInputChange("landmark", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <ShoppingBag className="h-6 w-6 text-[#6A994E]" />
                  <h2 className="text-2xl font-bold">Order History</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  You can view your order history here
                </p>

                {/* Tabs for order status */}
                <Tabs defaultValue="topay" className="mb-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="topay">To Pay</TabsTrigger>
                    <TabsTrigger value="toreceive">To Receive</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                  <TabsContent value="topay" className="mt-6">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-6 space-y-4"
                      >
                        <div className="flex items-center space-x-2 mb-4">
                          <ShoppingBag className="h-5 w-5" />
                          <h3 className="font-bold">To Pay</h3>
                        </div>
                        <p className="text-sm text-gray-600">{order.date}</p>

                        {/* Order Items */}
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <div className="flex items-center space-x-3">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={48}
                                  height={48}
                                  className="rounded-md"
                                />
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-gray-600">
                                    Quantity: {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <p className="font-semibold">
                                ₱{item.price.toFixed(2)}
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
                            <span className="font-medium">
                              {order.estimatedShipping}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Payment Method
                            </span>
                            <span className="font-medium">
                              {order.paymentMethod}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-bold">Total Fee</span>
                            <span className="font-bold">
                              ₱{order.totalFee.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="toreceive">
                    <div className="text-center py-12 text-gray-500">
                      No orders to receive
                    </div>
                  </TabsContent>
                  <TabsContent value="completed">
                    <div className="text-center py-12 text-gray-500">
                      No completed orders
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unsaved Changes Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1E392A] text-white py-4 px-6 flex justify-between items-center shadow-lg z-50">
          <span>You have unsaved changes.</span>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={handleDiscard}
              className="bg-transparent border-white text-white hover:bg-white/10"
            >
              Discard
            </Button>
            <Button
              onClick={handleSave}
              className="bg-white text-[#1E392A] hover:bg-gray-100"
            >
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center">
            <div className="bg-[#6A994E] rounded-full p-4 mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Successful
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              Changes in the account details has been updated!
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setShowSuccessModal(false)}
            className="w-full bg-[#1E392A] hover:bg-[#1E392A]/90 mt-4"
          >
            Great!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
