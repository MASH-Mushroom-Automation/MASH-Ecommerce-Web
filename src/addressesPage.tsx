"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";

const ADDRESSES = [
  {
    id: "1",
    label: "Home",
    name: "Juan Dela Cruz",
    phone: "+63 917 123 4567",
    street: "123 Mabini Street, San Isidro",
    city: "Quezon City, Metro Manila 1100",
    isDefault: true,
  },
  {
    id: "2",
    label: "Office",
    name: "Juan Dela Cruz",
    phone: "+63 917 123 4567",
    street: "456 Ayala Avenue, Bel-Air",
    city: "Makati City, Metro Manila 1200",
    isDefault: false,
  },
];

export default function AddressesPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Saved Addresses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your delivery locations
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          Add address
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {ADDRESSES.map((address) => (
          <Card key={address.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <CardTitle className="text-base">{address.label}</CardTitle>
                </div>
                {address.isDefault && (
                  <Badge variant="secondary" className="rounded">
                    Default
                  </Badge>
                )}
              </div>
              <CardDescription>
                {address.name} • {address.phone}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>{address.street}</p>
                <p>{address.city}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Pencil className="size-3" />
                  Edit
                </Button>
                {!address.isDefault && (
                  <Button variant="ghost" size="sm">
                    <Trash2 className="size-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
