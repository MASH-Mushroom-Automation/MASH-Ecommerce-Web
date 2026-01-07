"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, Calendar, TrendingUp } from "lucide-react";
import type { Seller, TimeSlot } from "./types";
import { cn } from "@/lib/utils";

interface SellerCardProps {
  seller: Seller;
  onSelectSlot: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot;
}

export function SellerCard({ seller, onSelectSlot, selectedSlot }: SellerCardProps) {
  // Get next 3 available slots for quick display
  const quickSlots = seller.availableSlots
    .filter((slot) => slot.available)
    .slice(0, 3);

  // Format date for display (e.g., "Mon, Jan 8")
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Format time (e.g., "9:00 AM")
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Seller Avatar */}
          <Avatar className="w-16 h-16">
            <AvatarImage src={seller.avatar} alt={seller.name} />
            <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-600 text-white text-lg font-semibold">
              {getInitials(seller.name)}
            </AvatarFallback>
          </Avatar>

          {/* Seller Info */}
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{seller.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MapPin className="w-4 h-4" />
              <span>{seller.location.city}</span>
              {seller.distance && (
                <span className="text-xs">• {seller.distance}km away</span>
              )}
            </div>

            {/* Rating */}
            {seller.rating && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{seller.rating.toFixed(1)}</span>
              </div>
            )}

            {/* Specialty Badges */}
            <div className="flex flex-wrap gap-1">
              {seller.specialty.map((spec) => (
                <Badge key={spec} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          {/* Capacity Badge */}
          <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-950 rounded-md">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              {seller.capacity}kg/week
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription className="mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">Available time slots:</span>
        </CardDescription>

        {quickSlots.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {quickSlots.map((slot) => {
              const isSelected =
                selectedSlot?.date === slot.date &&
                selectedSlot?.time === slot.time;
              return (
                <button
                  key={`${slot.date}-${slot.time}`}
                  onClick={() => onSelectSlot(slot)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all",
                    "hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950",
                    isSelected
                      ? "border-green-500 bg-green-50 dark:bg-green-950 ring-2 ring-green-200 dark:ring-green-800"
                      : "border-gray-200 dark:border-gray-800",
                    slot.isRecommended && "border-amber-400 bg-amber-50 dark:bg-amber-950"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-left">
                      <div className="text-sm font-medium">
                        {formatDate(slot.date)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(slot.time)}
                      </div>
                    </div>
                    {slot.isRecommended && (
                      <Badge variant="outline" className="text-xs border-amber-400 text-amber-600">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No available slots in the next 7 days
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          variant="default"
          className="w-full"
          disabled={!selectedSlot || !quickSlots.length}
        >
          {selectedSlot ? "Confirm Appointment" : "Select a time slot"}
        </Button>
      </CardFooter>
    </Card>
  );
}
