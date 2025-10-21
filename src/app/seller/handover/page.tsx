"use client";

import SellerDashboardLayout from "@/components/seller/SellerLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";

export default function HandoverCenterPage() {
  const pickupData = [
    {
      date: "2025-09-13",
      courier: "J&T Express",
      driver: "Maria Santos",
      planned: 15,
      done: 12,
      pending: 3,
    },
    {
      date: "2025-09-14",
      courier: "J&T Express",
      driver: "Robert Tan",
      planned: 30,
      done: 25,
      pending: 5,
    },
    {
      date: "2025-09-12",
      courier: "Lalamove",
      driver: "Juan Dela Cruz",
      planned: 20,
      done: 20,
      pending: 0,
    },
    {
      date: "2025-09-13",
      courier: "J&T Express",
      driver: "Maria Santos",
      planned: 15,
      done: 12,
      pending: 3,
    },
    {
      date: "2025-09-14",
      courier: "J&T Express",
      driver: "Robert Tan",
      planned: 30,
      done: 25,
      pending: 5,
    },
    {
      date: "2025-09-14",
      courier: "J&T Express",
      driver: "Robert Tan",
      planned: 30,
      done: 25,
      pending: 5,
    },
    {
      date: "2025-09-14",
      courier: "J&T Express",
      driver: "Robert Tan",
      planned: 30,
      done: 25,
      pending: 5,
    },
  ];

  return (
    <SellerDashboardLayout>
      <div className="bg-white rounded-lg shadow-sm">
        <Tabs defaultValue="pickup" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 m-6">
            <TabsTrigger value="pickup">Pickup</TabsTrigger>
            <TabsTrigger value="dropoff">Drop-off</TabsTrigger>
          </TabsList>

          {/* Pickup Tab */}
          <TabsContent value="pickup" className="px-6 pb-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Pickup Date</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Pickup Driver</TableHead>
                  <TableHead>Planned Pickup</TableHead>
                  <TableHead>Pickup Done</TableHead>
                  <TableHead>Pending Pickup</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pickupData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.courier}</TableCell>
                    <TableCell>{row.driver}</TableCell>
                    <TableCell>{row.planned} parcels</TableCell>
                    <TableCell>{row.done} parcels</TableCell>
                    <TableCell>{row.pending} parcels</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Drop-off Tab */}
          <TabsContent value="dropoff" className="px-6 pb-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Drop-off Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Drop-off Pickup</TableHead>
                  <TableHead>Drop-off Done</TableHead>
                  <TableHead>Pending Drop-off</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                      <FileText className="h-16 w-16 mb-4" />
                      <p className="text-lg font-medium">No Orders Found</p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </SellerDashboardLayout>
  );
}
