"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { SellerCard } from "./SellerCard";
import { useAppointments } from "@/hooks/useAppointments";
import { useAuth } from "@/contexts/AuthContext";
import type { Seller, TimeSlot, AppointmentBooking } from "./types";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AppointmentWidgetProps {
  productType: string;
  productSlug: string;
  quantity?: number;
  className?: string;
}

export function AppointmentWidget({
  productType,
  productSlug,
  quantity = 1,
  className,
}: AppointmentWidgetProps) {
  const { user, isAuthenticated } = useAuth();
  const {
    loading,
    error,
    findMatchingSellers,
    bookAppointment,
  } = useAppointments();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"sellers" | "confirm" | "success">("sellers");
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Booking form data
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerLocation, setBuyerLocation] = useState("Manila");
  const [bookingQuantity, setBookingQuantity] = useState(quantity);
  const [specialRequests, setSpecialRequests] = useState("");

  // Reset state when dialog opens
  useEffect(() => {
    if (open && user) {
      setBuyerName(user.displayName || "");
      setBuyerPhone(user.phoneNumber || "");
      setStep("sellers");
      setBookingSuccess(false);
      loadSellers();
    }
  }, [open, user]);

  const loadSellers = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to book appointments");
      setOpen(false);
      return;
    }

    const matchedSellers = await findMatchingSellers({
      productType,
      quantity: bookingQuantity,
      buyerLocation,
    });

    setSellers(matchedSellers);

    if (matchedSellers.length === 0) {
      toast.info("No sellers found for this product. Try adjusting your search criteria.");
    }
  };

  const handleSelectSlot = (seller: Seller, slot: TimeSlot) => {
    setSelectedSeller(seller);
    setSelectedSlot(slot);
  };

  const handleContinueToConfirm = () => {
    if (!selectedSeller || !selectedSlot) {
      toast.error("Please select a seller and time slot");
      return;
    }
    setStep("confirm");
  };

  const handleConfirmBooking = async () => {
    if (!selectedSeller || !selectedSlot || !user) return;

    const booking: AppointmentBooking = {
      sellerId: selectedSeller.uid,
      sellerName: selectedSeller.name,
      sellerEmail: selectedSeller.email,
      buyerName,
      buyerEmail: user.email || "",
      buyerPhone,
      buyerLocation,
      productType,
      quantity: bookingQuantity,
      scheduledDate: selectedSlot.date,
      scheduledTime: selectedSlot.time,
      specialRequests,
    };

    const result = await bookAppointment(booking);

    if (result.success) {
      setBookingSuccess(true);
      setStep("success");
      toast.success("Appointment booked successfully!");
    } else {
      toast.error(result.message);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStep("sellers");
    setSelectedSeller(null);
    setSelectedSlot(null);
    setBookingSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Calendar className="w-4 h-4 mr-2" />
          Book Meeting with Grower
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Step 1: Select Seller & Time Slot */}
        {step === "sellers" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Meet Your Perfect Mushroom Supplier
              </DialogTitle>
              <DialogDescription>
                We've matched you with the best growers based on your needs.
                Select a seller and time slot to book your appointment.
              </DialogDescription>
            </DialogHeader>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                <span className="ml-3 text-muted-foreground">Finding sellers...</span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!loading && !error && sellers.length > 0 && (
              <div className="space-y-4">
                {sellers.map((seller) => (
                  <SellerCard
                    key={seller.id}
                    seller={seller}
                    selectedSlot={
                      selectedSeller?.id === seller.id ? selectedSlot : undefined
                    }
                    onSelectSlot={(slot) => handleSelectSlot(seller, slot)}
                  />
                ))}
              </div>
            )}

            {!loading && !error && sellers.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No sellers available for this product at the moment.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={loadSellers}
                >
                  Try Again
                </Button>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleContinueToConfirm}
                disabled={!selectedSeller || !selectedSlot}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 2: Confirm Booking Details */}
        {step === "confirm" && selectedSeller && selectedSlot && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Your Appointment</DialogTitle>
              <DialogDescription>
                Please review your appointment details and fill in your information.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Appointment Summary */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h3 className="font-semibold">Appointment Summary</h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p><span className="font-medium">Seller:</span> {selectedSeller.name}</p>
                  <p><span className="font-medium">Product:</span> {productType}</p>
                  <p><span className="font-medium">Quantity:</span> {bookingQuantity} kg</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedSlot.date).toLocaleDateString()}</p>
                  <p><span className="font-medium">Time:</span> {selectedSlot.time}</p>
                  <p><span className="font-medium">Location:</span> {selectedSeller.location.address}</p>
                </div>
              </div>

              {/* Buyer Details Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="buyerName">Your Name *</Label>
                  <Input
                    id="buyerName"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="buyerPhone">Phone Number *</Label>
                  <Input
                    id="buyerPhone"
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+63 912 345 6789"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="buyerLocation">Your Location *</Label>
                  <Input
                    id="buyerLocation"
                    value={buyerLocation}
                    onChange={(e) => setBuyerLocation(e.target.value)}
                    placeholder="Manila"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity (kg) *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={bookingQuantity}
                    onChange={(e) => setBookingQuantity(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <Textarea
                    id="specialRequests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requirements or questions for the seller..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStep("sellers")}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={
                  loading ||
                  !buyerName ||
                  !buyerPhone ||
                  !buyerLocation ||
                  bookingQuantity < 1
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Appointment"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3: Success Message */}
        {step === "success" && selectedSeller && selectedSlot && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">
                Appointment Confirmed!
              </DialogTitle>
              <DialogDescription className="text-center">
                Your appointment has been successfully booked. You will receive a
                confirmation email shortly.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-muted p-6 rounded-lg space-y-3">
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">{selectedSeller.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedSlot.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-muted-foreground">{selectedSlot.time}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedSeller.location.address}
                </p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>What's Next?</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                  <li>Check your email for the confirmation details</li>
                  <li>The seller will contact you to confirm the appointment</li>
                  <li>You can view and manage your appointments in your dashboard</li>
                </ul>
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
