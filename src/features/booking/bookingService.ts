import { api } from "../../services/api";
import type { Resource, Booking } from "../../types";

// --- CONSTANTES ---
const OPENING_HOUR = 10;
const CLOSING_HOUR = 22;

export interface TimeSlot {
  time: string;
  available: boolean;
  start: Date;
  end: Date;
}

// Récupérer les ressources
export const fetchResources = async (): Promise<Resource[]> => {
  return await api.getResources();
};

// Générer les créneaux horaires (Logique combinée Client + API)
export const getDailySlots = async (
  resourceId: string,
  dateStr: string
): Promise<TimeSlot[]> => {
  // 1. On demande à l'API les réservations existantes pour ce jour/terrain
  const existingBookings = await api.getBookingsForResource(
    resourceId,
    dateStr
  );

  const slots: TimeSlot[] = [];
  const baseDate = new Date(dateStr);

  // 2. On génère les créneaux heure par heure
  for (let h = OPENING_HOUR; h < CLOSING_HOUR; h++) {
    const start = new Date(baseDate);
    start.setHours(h, 0, 0, 0);

    const end = new Date(baseDate);
    end.setHours(h + 1, 0, 0, 0);

    // 3. On vérifie si ce créneau est pris
    const isTaken = existingBookings.some((b) => {
      const bStart = new Date(b.start);
      // Comparaison simple sur l'heure de début (suffisant pour des créneaux fixes d'1h)
      return bStart.getHours() === h;
    });

    slots.push({
      time: `${h}:00`,
      available: !isTaken,
      start,
      end,
    });
  }

  return slots;
};

// Créer la réservation avec logique de prix
export const createBooking = async (
  resourceId: string,
  start: Date,
  end: Date,
  userId: string,
  fullPrice: number,
  paymentMode: "full" | "split"
): Promise<Booking> => {
  // Calcul du reste à payer sur place
  // Si split (1/4 payé), alors 3/4 reste à payer. Si full, 0 reste à payer.
  const amountDue = paymentMode === "full" ? 0 : fullPrice * 0.75;
  const paymentStatus = paymentMode === "full" ? "paid" : "partial";

  // Appel à l'API (qui va gérer l'ID et la sauvegarde)
  return await api.createBooking({
    resourceId,
    userId,
    start: start.toISOString(),
    end: end.toISOString(),
    paymentStatus,
    amountDue,
    // Note: status 'confirmed' et checkedIn 'false' sont gérés par défaut dans l'API mock
  });
};
