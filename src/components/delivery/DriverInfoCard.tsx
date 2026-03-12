"use client";

import { Button } from "@/components/ui/button";
import { Phone, User } from "lucide-react";

interface DriverInfoCardProps {
  name: string;
  phone?: string;
  plateNumber?: string;
  photo?: string;
  className?: string;
}

export default function DriverInfoCard({
  name,
  phone,
  plateNumber,
  photo,
  className,
}: DriverInfoCardProps) {
  return (
    <div className={`rounded-lg border p-3 space-y-2 ${className || ""}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 overflow-hidden">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-emerald-700" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{name}</p>
          {plateNumber && (
            <p className="text-xs text-muted-foreground">{plateNumber}</p>
          )}
        </div>
        {phone && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`tel:${phone}`, "_self")}
          >
            <Phone className="h-3.5 w-3.5 mr-1" />
            Call
          </Button>
        )}
      </div>
    </div>
  );
}
