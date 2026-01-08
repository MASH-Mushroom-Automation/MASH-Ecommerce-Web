# 🚀 DO THIS NOW - Appointment Widget Implementation

**Time to Complete:** 90 minutes  
**Prerequisites:** AI-007 n8n workflow must be active ✅

---

## 🎯 STEP 1: Create Types (5 minutes)

Create `src/types/appointments.ts`:

```bash
# Create directory if it doesn't exist
mkdir -p src/types

# Create file
notepad src/types/appointments.ts
```

**Copy this entire content:**

```typescript
export interface Seller {
  seller_uid: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  specialties: string[];
  capacity_kg_per_week: number;
  role: 'GROWER' | 'SELLER';
}

export interface AvailabilitySlot {
  id: string;
  seller_uid: string;
  available_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
}

export interface Appointment {
  id: string;
  buyer_uid: string;
  seller_uid: string;
  product_type: string;
  quantity: number;
  scheduled_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
}

export interface FindSellersRequest {
  action: 'find_sellers';
  productType: string;
  quantity: number;
  location: string;
  preferredDate: string;
}

export interface GetAvailabilityRequest {
  action: 'get_availability';
  sellerId: string;
  preferredDate: string;
}

export interface SetAppointmentRequest {
  action: 'set_appointment';
  buyerId: string;
  sellerId: string;
  slotId: string;
  productType: string;
  quantity: number;
  specialRequests?: string;
}
```

Save and close (Ctrl+S, Alt+F4).

---

## 🎯 STEP 2: Create API Route (10 minutes)

Create `src/app/api/appointments/route.ts`:

```bash
mkdir -p src/app/api/appointments
notepad src/app/api/appointments/route.ts
```

**Copy this entire content:**

```typescript
import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/mash-appointments';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    console.log('📤 Forwarding to n8n:', body);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log('📥 n8n response:', data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Appointment request failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Appointment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Save and close.

---

## 🎯 STEP 3: Create Hook (15 minutes)

Create `src/hooks/useAppointments.ts`:

```bash
mkdir -p src/hooks
notepad src/hooks/useAppointments.ts
```

**Copy this entire content:**

```typescript
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type {
  FindSellersRequest,
  GetAvailabilityRequest,
  SetAppointmentRequest,
  Seller,
  AvailabilitySlot,
} from '@/types/appointments';

export function useAppointments() {
  const [loading, setLoading] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  const findSellers = async (request: Omit<FindSellersRequest, 'action'>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'find_sellers',
          ...request,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find sellers');
      }

      setSellers(data.sellers || []);
      return data;
    } catch (error) {
      console.error('Find sellers error:', error);
      toast.error('Could not find available sellers');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAvailability = async (request: Omit<GetAvailabilityRequest, 'action'>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_availability',
          ...request,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get availability');
      }

      setAvailability(data.availableSlots || []);
      return data;
    } catch (error) {
      console.error('Get availability error:', error);
      toast.error('Could not load seller availability');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async (request: Omit<SetAppointmentRequest, 'action'>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_appointment',
          ...request,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      toast.success('Appointment booked successfully!');
      return data;
    } catch (error) {
      console.error('Book appointment error:', error);
      toast.error('Could not book appointment');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    sellers,
    availability,
    findSellers,
    getAvailability,
    bookAppointment,
  };
}
```

Save and close.

---

## 🎯 STEP 4: Create Seller Card Component (15 minutes)

Create `src/components/appointments/SellerCard.tsx`:

```bash
mkdir -p src/components/appointments
notepad src/components/appointments/SellerCard.tsx
```

**Copy this entire content:**

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock } from 'lucide-react';
import type { Seller } from '@/types/appointments';

interface SellerCardProps {
  seller: Seller;
  onViewSlots: (sellerId: string) => void;
  loading?: boolean;
}

export function SellerCard({ seller, onViewSlots, loading }: SellerCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{seller.name}</CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span>{seller.location}</span>
            </div>
          </div>
          <Badge variant="secondary">{seller.role}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-1">Specialties:</p>
          <div className="flex flex-wrap gap-1">
            {seller.specialties.map((specialty) => (
              <Badge key={specialty} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>Capacity: {seller.capacity_kg_per_week}kg/week</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onViewSlots(seller.seller_uid)}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Loading...' : 'View Available Slots'}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

Save and close.

---

## 🎯 STEP 5: Create Time Slot Picker (20 minutes)

Create `src/components/appointments/TimeSlotPicker.tsx`:

```bash
notepad src/components/appointments/TimeSlotPicker.tsx
```

**Copy this entire content:**

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AvailabilitySlot } from '@/types/appointments';

interface TimeSlotPickerProps {
  slots: AvailabilitySlot[];
  selectedSlot: AvailabilitySlot | null;
  onSelectSlot: (slot: AvailabilitySlot) => void;
}

export function TimeSlotPicker({ slots, selectedSlot, onSelectSlot }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const slotsByDate = slots.reduce((acc, slot) => {
    const date = slot.available_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);

  const availableDates = Object.keys(slotsByDate).map((date) => parseISO(date));

  const slotsForSelectedDate = selectedDate
    ? slotsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <p className="text-sm font-medium mb-2">Select Date:</p>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            return !slotsByDate[dateStr] || slotsByDate[dateStr].length === 0;
          }}
          className="rounded-md border"
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Available Times:</p>
        {!selectedDate ? (
          <p className="text-sm text-muted-foreground">Select a date to see available times</p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {slotsForSelectedDate.length === 0 ? (
                <p className="text-sm text-muted-foreground">No slots available for this date</p>
              ) : (
                slotsForSelectedDate.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                    className={cn('w-full justify-start', !slot.is_available && 'opacity-50')}
                    onClick={() => onSelectSlot(slot)}
                    disabled={!slot.is_available}
                  >
                    {slot.start_time} - {slot.end_time}
                    {!slot.is_available && ' (Booked)'}
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
```

Save and close.

---

## 🎯 STEP 6: Create Main Widget (25 minutes)

Create `src/components/appointments/AppointmentWidget.tsx`:

```bash
notepad src/components/appointments/AppointmentWidget.tsx
```

**Copy the complete widget from the README.md in this folder** (too large to include here - see lines 300-500 in README.md)

Or download from:
```
ai-automation-tasks/ai-004-appointment-widget/AppointmentWidget.tsx.txt
```

---

## 🎯 STEP 7: Test the Widget (10 minutes)

### 7.1 Start Development Server

```bash
npm run dev
```

### 7.2 Test API Route

Open PowerShell:

```powershell
# Test find_sellers
Invoke-RestMethod -Uri "http://localhost:3000/api/appointments" -Method POST -Body '{"action":"find_sellers","productType":"Oyster Mushroom","quantity":10,"location":"Manila","preferredDate":"2026-01-15"}' -ContentType "application/json"
```

**Expected:** JSON with `sellers` array containing 3 sellers.

### 7.3 Add Widget to Product Page

Edit `src/app/(shop)/product/[slug]/page.tsx`:

```typescript
import { AppointmentWidget } from '@/components/appointments/AppointmentWidget';

// Inside the component, after "Add to Cart" button:
<AppointmentWidget
  productType={product.name}
  productName={product.name}
  defaultQuantity={1}
  variant="button"
/>
```

### 7.4 Manual Test

1. Go to: http://localhost:3000/product/oyster-mushroom
2. Click "Book Meeting with Grower"
3. Verify 3 sellers appear
4. Click "View Available Slots" on first seller
5. Select a date with green highlight
6. Click a time slot
7. Fill in special requests (optional)
8. Click "Confirm Appointment"
9. **Expected:** Success message "Appointment Confirmed! 🎉"

---

## ✅ VERIFICATION CHECKLIST

- [ ] API route responds with sellers
- [ ] Widget opens when clicking button
- [ ] 3 sellers display in modal
- [ ] Seller cards show all details
- [ ] Time slots load for selected seller
- [ ] Calendar highlights available dates
- [ ] Time slot buttons work correctly
- [ ] Confirmation screen shows booking summary
- [ ] Success message appears after booking
- [ ] No console errors
- [ ] Widget closes and resets properly

---

## 🐛 TROUBLESHOOTING

### Issue: "Cannot connect to n8n webhook"
**Check:**
```powershell
# Verify n8n is running
docker ps | findstr n8n

# Test webhook directly
Invoke-RestMethod -Uri "http://localhost:5678/webhook/mash-appointments" -Method POST -Body '{"action":"health_check"}' -ContentType "application/json"
```

### Issue: "No sellers found"
**Check PostgreSQL:**
```sql
SELECT COUNT(*) FROM growers;
-- Should return 3
```

### Issue: "Slots not loading"
**Check database:**
```sql
SELECT COUNT(*) FROM availability_slots;
-- Should return 672
```

---

## 🎉 NEXT STEPS

After widget works:
1. Add to other pages (shop, cart, profile)
2. Implement appointment management dashboard
3. Add cancel/reschedule functionality
4. Email notifications (AI-011)
5. Seller dashboard (AI-010)

**🚀 Great job! Your appointment booking system is now live!**
