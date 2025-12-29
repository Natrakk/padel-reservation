import { db } from "../mocks/database";
import type { Booking, Resource, User, AdminBookingView } from "../types";

// Petit utilitaire pour simuler la latence (ex: 500ms)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // --- RESOURCES ---
  getResources: async (): Promise<Resource[]> => {
    await delay(300);
    return db.resources;
  },

  // --- BOOKINGS (CLIENT) ---
  // Vérifie dispo et crée
  createBooking: async (
    bookingData: Omit<Booking, "id" | "status" | "checkedIn">
  ): Promise<Booking> => {
    await delay(800); // Simulation paiement/traitement

    // Vérification collision basique (Server-side simulation)
    const collision = db.bookings.some(
      (b) =>
        b.resourceId === bookingData.resourceId &&
        b.status !== "cancelled" &&
        ((bookingData.start >= b.start && bookingData.start < b.end) ||
          (bookingData.end > b.start && bookingData.end <= b.end))
    );

    if (collision)
      throw new Error(
        "Oups ! Ce créneau vient d'être réservé par quelqu'un d'autre."
      );

    const newBooking: Booking = {
      ...bookingData,
      id: Math.random().toString(36).substr(2, 9),
      status: "confirmed",
      checkedIn: false,
    };

    return db.addBooking(newBooking);
  },

  // Récupérer les créneaux pris pour une date (pour le calendrier)
  getBookingsForResource: async (
    resourceId: string,
    dateStr: string
  ): Promise<Booking[]> => {
    await delay(200);
    // On filtre côté "serveur"
    return db.bookings.filter(
      (b) =>
        b.resourceId === resourceId &&
        b.start.startsWith(dateStr) &&
        b.status !== "cancelled"
    );
  },

  // --- ADMIN ---
  getAllBookingsWithDetails: async (): Promise<AdminBookingView[]> => {
    await delay(500);
    const bookings = db.bookings;
    const users = db.users;
    const resources = db.resources;

    // "Join" SQL simulé
    return bookings.map((b) => ({
      ...b,
      user: users.find((u) => u.id === b.userId),
      resourceName: resources.find((r) => r.id === b.resourceId)?.name,
    }));
  },

  updateBookingStatus: async (
    bookingId: string,
    updates: Partial<Booking>
  ): Promise<Booking> => {
    await delay(300);
    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error("Booking not found");

    const updated = { ...booking, ...updates };
    return db.updateBooking(updated);
  },
};
