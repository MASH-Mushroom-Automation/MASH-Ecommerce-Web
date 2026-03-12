"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Package, Truck } from "lucide-react";
import {
  LALAMOVE_VEHICLES,
  calculateEstimate,
  type VehicleType,
} from "@/lib/lalamove/vehicle-types";

export interface VehicleTypeSelectorProps {
  distanceKm?: number;
  addStops?: number;
  onSelect: (vehicle: VehicleType) => void;
  selectedId?: string;
  className?: string;
}

export default function VehicleTypeSelector({
  distanceKm,
  addStops = 0,
  onSelect,
  selectedId,
  className,
}: VehicleTypeSelectorProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Truck className="h-5 w-5 text-emerald-600" />
        <h3 className="font-semibold text-lg">Select Vehicle Type</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {LALAMOVE_VEHICLES.map((vehicle) => {
          const isSelected = selectedId === vehicle.id;
          const isHovered = hoveredId === vehicle.id;
          const estimate =
            distanceKm != null
              ? calculateEstimate(vehicle.id, distanceKm, addStops)
              : null;

          return (
            <Card
              key={vehicle.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`Select ${vehicle.name}`}
              className={cn(
                "cursor-pointer transition-all duration-200 border-2",
                isSelected
                  ? "border-emerald-500 bg-emerald-50 shadow-md"
                  : isHovered
                    ? "border-emerald-300 shadow-sm"
                    : "border-transparent hover:border-emerald-200"
              )}
              onClick={() => onSelect(vehicle)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(vehicle);
                }
              }}
              onMouseEnter={() => setHoveredId(vehicle.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl flex-shrink-0" aria-hidden="true">
                      {vehicle.image}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm leading-tight truncate">
                        {vehicle.name}
                      </p>
                      {vehicle.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {vehicle.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    <span>{vehicle.weightLimit}kg max</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {estimate != null ? (
                      <>~₱{estimate.toLocaleString()}</>
                    ) : (
                      <>₱{vehicle.baseFare} base</>
                    )}
                  </span>
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  {vehicle.sizeLimit}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedId && (
        <SelectedVehicleSummary
          vehicle={LALAMOVE_VEHICLES.find((v) => v.id === selectedId)!}
          distanceKm={distanceKm}
          addStops={addStops}
        />
      )}
    </div>
  );
}

function SelectedVehicleSummary({
  vehicle,
  distanceKm,
  addStops = 0,
}: {
  vehicle: VehicleType;
  distanceKm?: number;
  addStops?: number;
}) {
  const estimate =
    distanceKm != null
      ? calculateEstimate(vehicle.id, distanceKm, addStops)
      : null;

  return (
    <div
      className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 mt-3"
      data-testid="vehicle-summary"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg" aria-hidden="true">
          {vehicle.image}
        </span>
        <span className="font-medium text-sm">{vehicle.name}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Base Fare</span>
        <span className="text-right font-medium text-foreground">
          ₱{vehicle.baseFare}
        </span>
        <span>Weight Limit</span>
        <span className="text-right">{vehicle.weightLimit}kg</span>
        <span>Size Limit</span>
        <span className="text-right">{vehicle.sizeLimit}</span>
        <span>Add Stop Fee</span>
        <span className="text-right">₱{vehicle.addStopFee}</span>
        {estimate != null && (
          <>
            <span className="font-medium text-foreground">Est. Total</span>
            <span className="text-right font-semibold text-emerald-700">
              ~₱{estimate.toLocaleString()}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
