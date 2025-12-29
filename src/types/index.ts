export type Role = "admin" | "client" | "staff";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: "Indoor" | "Outdoor";
  pricePerHour: number;
  image: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  start: string; // ISO String
  end: string; // ISO String
  status: "confirmed" | "cancelled";
  paymentStatus: "paid" | "partial" | "pending";
  amountDue: number; // Reste à payer
  checkedIn: boolean; // Le joueur est-il arrivé ?
}

// Type étendu pour l'admin (inclut les infos user)
export interface AdminBookingView extends Booking {
  user?: User;
  resourceName?: string;
}
