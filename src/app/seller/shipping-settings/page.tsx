"use client";

import { useState } from "react";
import SellerDashboardLayout from "@/components/seller/SellerLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function ShippingSettingsPage() {
  const [codEnabled, setCodEnabled] = useState(true);

  const addresses = [
    {
      id: 1,
      fullName: "Juan Dela Cruz",
      phone: "+63 917 234 5678",
      address: "123 Mabini St., Brgy. San Isidro, Quezon City, Metro Manila",
    },
    {
      id: 2,
      fullName: "Maria Isabel Santos",
      phone: "+63 920 876 5432",
      address: "45 Lopez Jaena Ave., Brgy. Poblacion, Cebu City, Cebu",
    },
    {
      id: 3,
      fullName: 'Roberto "Robert" Tan',
      phone: "+63 915 333 2211",
      address: "78 Rizal Blvd., Brgy. Banilad, Davao City, Davao del Sur",
    },
  ];

  return (
    <SellerDashboardLayout>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <Tabs defaultValue="shipping" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="address">Address Management</TabsTrigger>
            <TabsTrigger value="shipping">Shipping Channel</TabsTrigger>
          </TabsList>

          {/* Address Management Tab */}
          <TabsContent value="address">
            <div>
              <h2 className="text-2xl font-bold mb-2">My Addresses</h2>
              <p className="text-gray-600 mb-6">
                Manage your shipping and pickup addresses
              </p>

              <div className="space-y-4">
                {addresses.map((address, index) => (
                  <div
                    key={address.id}
                    className="bg-gray-50 p-6 rounded-lg border"
                  >
                    <h3 className="font-semibold mb-4">Address {index + 1}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="w-32 text-gray-600">Full Name</span>
                        <span className="font-medium">{address.fullName}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-600">Phone Number</span>
                        <span className="font-medium">{address.phone}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-600">Address</span>
                        <span className="font-medium">{address.address}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Shipping Channel Tab */}
          <TabsContent value="shipping">
            <div>
              <p className="text-gray-600 mb-6">
                Related settings for logistics transportation
              </p>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Standard Local</h3>
                  <span className="text-sm text-gray-500">[COD enabled]</span>
                </div>

                {/* COD Option */}
                <div className="bg-gray-100 p-4 rounded-lg mb-6">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="cod"
                      checked={codEnabled}
                      onCheckedChange={(checked) =>
                        setCodEnabled(checked as boolean)
                      }
                      className="data-[state=checked]:bg-[#1E392A] data-[state=checked]:border-[#1E392A]"
                    />
                    <Label
                      htmlFor="cod"
                      className="text-sm font-medium cursor-pointer"
                    >
                      COD
                    </Label>
                  </div>
                </div>

                {/* Shipping Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <span className="font-medium">Lalamove Express</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <span className="font-medium">J&T Express</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SellerDashboardLayout>
  );
}
