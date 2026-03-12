"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Truck, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DeliveryStatusBadge from "./DeliveryStatusBadge";
import DriverInfoCard from "./DriverInfoCard";
import DeliveryProofImage from "./DeliveryProofImage";

interface TimelineEntry {
  status: string;
  timestamp: string;
  note?: string;
}

interface LalamoveOrderSummaryData {
  status: string;
  vehicleType?: string;
  fee?: number;
  currency?: string;
  driver?: {
    name: string;
    phone?: string;
    plateNumber?: string;
    photo?: string;
  };
  timeline?: TimelineEntry[];
  proofImageUrl?: string;
  proofTimestamp?: string;
  createdAt?: string;
  completedAt?: string;
}

interface LalamoveOrderSummaryProps {
  data: LalamoveOrderSummaryData;
  className?: string;
}

function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-emerald-600" />
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-3 pt-0">{children}</div>}
    </div>
  );
}

export default function LalamoveOrderSummary({
  data,
  className,
}: LalamoveOrderSummaryProps) {
  const {
    status,
    vehicleType,
    fee,
    currency = "PHP",
    driver,
    timeline,
    proofImageUrl,
    proofTimestamp,
    createdAt,
  } = data;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Delivery Summary</h3>
        <DeliveryStatusBadge status={status} />
      </div>

      {/* Vehicle & Cost row */}
      <div className="flex items-center gap-4 text-sm">
        {vehicleType && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Truck className="h-4 w-4" />
            {vehicleType}
          </span>
        )}
        {fee != null && (
          <span className="flex items-center gap-1.5 font-medium">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            {currency === "PHP" ? "₱" : currency}{" "}
            {fee.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        )}
        {createdAt && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
            <Clock className="h-3.5 w-3.5" />
            {new Date(createdAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Driver info */}
      {driver && (
        <CollapsibleSection title="Driver Information" icon={Truck} defaultOpen>
          <DriverInfoCard
            name={driver.name}
            phone={driver.phone}
            plateNumber={driver.plateNumber}
            photo={driver.photo}
          />
        </CollapsibleSection>
      )}

      {/* Timeline */}
      {timeline && timeline.length > 0 && (
        <CollapsibleSection title="Delivery Timeline" icon={Clock}>
          <ul className="space-y-2">
            {timeline.map((entry, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{entry.status}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-xs text-muted-foreground">{entry.note}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Proof of delivery */}
      {status === "COMPLETED" && (
        <CollapsibleSection title="Proof of Delivery" icon={Truck}>
          <DeliveryProofImage
            imageUrl={proofImageUrl}
            timestamp={proofTimestamp}
          />
        </CollapsibleSection>
      )}
    </div>
  );
}
