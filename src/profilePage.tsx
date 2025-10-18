"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const ORDERS = [
  { id: "1001", date: "2025-09-01", total: 118.0, status: "Shipped" },
  { id: "1002", date: "2025-09-15", total: 79.0, status: "Delivered" },
  { id: "1003", date: "2025-10-03", total: 39.0, status: "Processing" },
];

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16">
      <div className="grid gap-8 md:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader className="flex-row items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src="" alt="User" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>Alex Doe</CardTitle>
              <CardDescription>alex@example.com</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Member since</span>
              <span>2024</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tier</span>
              <Badge variant="secondary" className="rounded">
                Silver
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Orders</span>
              <span>{ORDERS.length}</span>
            </div>
            <div className="pt-2">
              <Button className="w-full">Edit profile</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ORDERS.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>#{o.id}</TableCell>
                    <TableCell>{o.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded">
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${o.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>Showing last {ORDERS.length} orders</TableCaption>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
