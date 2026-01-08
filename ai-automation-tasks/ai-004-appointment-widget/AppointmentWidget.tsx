'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppointments } from '@/hooks/useAppointments';
import { SellerCard } from './SellerCard';
import { TimeSlotPicker } from './TimeSlotPicker';
import type { Seller, AvailabilitySlot } from '@/types/appointments';

interface AppointmentWidgetProps {
  productType: string;
  productName: string;
  defaultQuantity?: number;
  variant?: 'button' | 'icon';
}

export function AppointmentWidget({
  productType,
  productName,
  defaultQuantity = 1,
  variant = 'button',
}: AppointmentWidgetProps) {
  const { user } = useAuth();
  const { loading, sellers, availability, findSellers, getAvailability, bookAppointment } = useAppointments();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'sellers' | 'slots' | 'confirm' | 'success'>('sellers');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [specialRequests, setSpecialRequests] = useState('');
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  const handleOpen = async () => {
    setOpen(true);
    
    if (sellers.length === 0) {
      await findSellers({
        productType,
        quantity,
        location: 'Manila',
        preferredDate: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleViewSlots = async (sellerId: string) => {
    const seller = sellers.find((s) => s.seller_uid === sellerId);
    if (!seller) return;

    setSelectedSeller(seller);
    await getAvailability({
      sellerId,
      preferredDate: new Date().toISOString().split('T')[0],
    });
    setStep('slots');
  };

  const handleSelectSlot = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setStep('confirm');
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedSeller || !selectedSlot) return;

    try {
      const result = await bookAppointment({
        buyerId: user.uid,
        sellerId: selectedSeller.seller_uid,
        slotId: selectedSlot.id,
        productType,
        quantity,
        specialRequests,
      });

      setAppointmentDetails(result.appointment);
      setStep('success');
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep('sellers');
      setSelectedSeller(null);
      setSelectedSlot(null);
      setSpecialRequests('');
      setAppointmentDetails(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'button' ? (
          <Button onClick={handleOpen} className="w-full" variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Book Meeting with Grower
          </Button>
        ) : (
          <Button onClick={handleOpen} size="icon" variant="ghost">
            <Calendar className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        {step === 'sellers' && (
          <>
            <DialogHeader>
              <DialogTitle>Meet Your Perfect Mushroom Supplier</DialogTitle>
              <DialogDescription>
                We'll match you with the best grower based on your needs for {productName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              {loading ? (
                <p className="text-center text-muted-foreground">Finding sellers...</p>
              ) : sellers.length === 0 ? (
                <p className="text-center text-muted-foreground">No sellers available</p>
              ) : (
                <div className="grid gap-4">
                  {sellers.map((seller) => (
                    <SellerCard
                      key={seller.seller_uid}
                      seller={seller}
                      onViewSlots={handleViewSlots}
                      loading={loading}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {step === 'slots' && selectedSeller && (
          <>
            <DialogHeader>
              <DialogTitle>Choose Time Slot</DialogTitle>
              <DialogDescription>
                Book an appointment with {selectedSeller.name}
              </DialogDescription>
            </DialogHeader>

            <TimeSlotPicker
              slots={availability}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
            />

            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep('sellers')}>
                Back to Sellers
              </Button>
            </div>
          </>
        )}

        {step === 'confirm' && selectedSeller && selectedSlot && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Appointment</DialogTitle>
              <DialogDescription>Review and confirm your booking details</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="rounded-lg border p-4 space-y-2">
                <p>
                  <strong>Seller:</strong> {selectedSeller.name}
                </p>
                <p>
                  <strong>Product:</strong> {productName}
                </p>
                <p>
                  <strong>Quantity:</strong> {quantity}kg
                </p>
                <p>
                  <strong>Date:</strong> {selectedSlot.available_date}
                </p>
                <p>
                  <strong>Time:</strong> {selectedSlot.start_time} - {selectedSlot.end_time}
                </p>
              </div>

              <div>
                <Label htmlFor="requests">Special Requests (optional)</Label>
                <Textarea
                  id="requests"
                  placeholder="Any specific requirements or notes..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('slots')}>
                  Back
                </Button>
                <Button onClick={handleConfirmBooking} disabled={loading} className="flex-1">
                  {loading ? 'Booking...' : 'Confirm Appointment'}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'success' && appointmentDetails && (
          <>
            <DialogHeader>
              <DialogTitle>Appointment Confirmed! 🎉</DialogTitle>
              <DialogDescription>
                Your meeting has been successfully scheduled
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2">
                <p className="font-semibold text-green-900">
                  You're all set to meet {selectedSeller?.name}!
                </p>
                <p className="text-sm text-green-800">
                  Confirmation email sent to your inbox
                </p>
              </div>

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
