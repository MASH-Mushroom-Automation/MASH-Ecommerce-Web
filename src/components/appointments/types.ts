// Appointment Widget Types
// Used by AI-004 appointment booking system

export interface Seller {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  specialty: string[]; // e.g., ["Oyster", "King Oyster"]
  location: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  distance?: number; // km from buyer (calculated dynamically)
  rating?: number;
  avatar?: string;
  capacity: number; // kg per week
  availableSlots: TimeSlot[];
}

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24-hour format)
  available: boolean;
  isRecommended?: boolean;
}

export interface AppointmentBooking {
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerLocation: string;
  productType: string;
  quantity: number; // kg
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  specialRequests?: string;
}

export interface AppointmentResponse {
  success: boolean;
  appointmentId?: string;
  message: string;
  emailSent?: boolean;
}

export interface SellerMatchRequest {
  productType: string;
  quantity: number;
  buyerLocation: string;
  preferredDate?: string;
}
