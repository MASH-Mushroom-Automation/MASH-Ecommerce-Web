"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Check, X } from "lucide-react";

const RETURNS = [
  {
    id: "RET-001",
    orderId: "MASH-A1B2C3",
    customer: "Maria Santos",
    reason: "Product arrived spoiled",
    date: "Oct 18, 2025",
    status: "Pending review",
  },
  {
    id: "RET-002",
    orderId: "MASH-D4E5F6",
    customer: "Jose Cruz",
    reason: "Wrong item delivered",
    date: "Oct 17, 2025",
    status: "Approved",
  },
  {
    id: "RET-003",
    orderId: "MASH-G7H8I9",
    customer: "Ana Reyes",
    reason: "Quality concerns",
    date: "Oct 15, 2025",
    status: "Resolved",
  },
];

export default function SellerReturnsPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16">
      <div>
        <h1 className="text-2xl font-semibold">Returns & Refunds</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage customer return requests and refunds
        </p>
      </div>

      {/* Alert */}
      <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              1 return request pending review
            </p>
            <p className="text-sm text-muted-foreground">
              Please respond within 24 hours to maintain your seller rating
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Return requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Return ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RETURNS.map((ret) => (
                <TableRow key={ret.id}>
                  <TableCell className="font-mono text-sm">{ret.id}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {ret.orderId}
                  </TableCell>
                  <TableCell>{ret.customer}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {ret.reason}
                  </TableCell>
                  <TableCell>{ret.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ret.status === "Pending review"
                          ? "default"
                          : ret.status === "Approved"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {ret.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {ret.status === "Pending review" && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <X className="size-4" />
                          Reject
                        </Button>
                        <Button size="sm">
                          <Check className="size-4" />
                          Approve
                        </Button>
                      </div>
                    )}
                    {ret.status !== "Pending review" && (
                      <Button variant="ghost" size="sm">
                        View details
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Return guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            • <strong>Review promptly:</strong> Respond to return requests
            within 24 hours
          </p>
          <p>
            • <strong>Fair assessment:</strong> Approve returns when quality
            issues are legitimate
          </p>
          <p>
            • <strong>Replacement first:</strong> Offer replacements before
            refunds when possible
          </p>
          <p>
            • <strong>Learn and improve:</strong> Use return feedback to improve
            product quality
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
