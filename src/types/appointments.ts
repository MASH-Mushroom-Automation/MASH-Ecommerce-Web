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
