import type { User, Resource, Booking } from "../types";

// --- DATA INITIALE (SEED) ---
const SEED_USERS: User[] = [
  {
    id: "admin1",
    email: "admin@padel.com",
    name: "Directeur Club",
    role: "admin",
    avatar: "👔",
  },
  {
    id: "staff1",
    email: "staff@padel.com",
    name: "Accueil",
    role: "admin",
    avatar: "🧢",
  },
  {
    id: "u1",
    email: "jean@demo.com",
    name: "Jean Dupont",
    role: "client",
    avatar: "🧔",
  },
  {
    id: "u2",
    email: "sophie@demo.com",
    name: "Sophie Martin",
    role: "client",
    avatar: "👩",
  },
];

const SEED_RESOURCES: Resource[] = [
  {
    id: "p1",
    name: "Indoor1",
    type: "Indoor",
    pricePerHour: 30,
    image: "🏆",
  },
  { id: "p2", name: "Indoor2", type: "Indoor", pricePerHour: 28, image: "🎾" },
  { id: "p3", name: "Indoor3", type: "Indoor", pricePerHour: 28, image: "🎾" },
  { id: "p4", name: "Indoor4", type: "Indoor", pricePerHour: 20, image: "☀️" },
  { id: "p5", name: "Indoor5", type: "Indoor", pricePerHour: 20, image: "☀️" },
];

// Générateur de quelques réservations pour peupler le planning
const generateBookings = (): Booking[] => {
  const today = new Date().toISOString().split("T")[0];
  return [
    {
      id: "b1",
      resourceId: "p1",
      userId: "u1",
      start: `${today}T10:00:00.000Z`,
      end: `${today}T11:00:00.000Z`,
      status: "confirmed",
      paymentStatus: "paid",
      amountDue: 0,
      checkedIn: true,
    },
    {
      id: "b2",
      resourceId: "p2",
      userId: "u2",
      start: `${today}T14:00:00.000Z`,
      end: `${today}T15:00:00.000Z`,
      status: "confirmed",
      paymentStatus: "partial",
      amountDue: 21,
      checkedIn: false,
    },
  ];
};

// --- SIMULATEUR DB (LOCALSTORAGE) ---
class MockDB {
  private get<T>(key: string, seed: T): T {
    const stored = localStorage.getItem(`mock_${key}`);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(`mock_${key}`, JSON.stringify(seed));
    return seed;
  }

  private set(key: string, data: any) {
    localStorage.setItem(`mock_${key}`, JSON.stringify(data));
  }

  // Getters
  get users(): User[] {
    return this.get("users", SEED_USERS);
  }
  get resources(): Resource[] {
    return this.get("resources", SEED_RESOURCES);
  }
  get bookings(): Booking[] {
    return this.get("bookings", generateBookings());
  }

  // Actions
  addUser(user: User) {
    const users = this.users;
    users.push(user);
    this.set("users", users);
  }

  addBooking(booking: Booking) {
    const bookings = this.bookings;
    bookings.push(booking);
    this.set("bookings", bookings);
    return booking;
  }

  updateBooking(updatedBooking: Booking) {
    const bookings = this.bookings.map((b) =>
      b.id === updatedBooking.id ? updatedBooking : b
    );
    this.set("bookings", bookings);
    return updatedBooking;
  }
}

export const db = new MockDB();
