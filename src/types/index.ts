export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'client';
  avatar?: string;
  phone?: string; // <--- AJOUT ICI
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
  image?: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  start: string;
  end: string;
  status: 'confirmed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'partial';
  amountDue: number;
  checkedIn?: boolean;
}

// Votre type étendu pour l'interface
export interface ExtendedBooking extends Booking {
  user?: User;
  resourceName?: string;
  paidSeats?: number;
  rackets?: number;
}