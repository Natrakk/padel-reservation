import type { User, Resource, Booking } from "../types";

// --- DATA INITIALE (SEED) ---
const SEED_USERS: User[] = [
  {
    id: "admin1",
    email: "admin@padel.com",
    name: "Directeur Club",
    role: "admin",
    avatar: "👔",
    phone: "06 00 00 00 00"
  },
  {
    id: "staff1",
    email: "staff@padel.com",
    name: "Accueil",
    role: "admin", // ou staff
    avatar: "🧢",
    phone: "06 11 11 11 11"
  },
  {
    id: "u1",
    email: "jean@demo.com",
    name: "Jean Dupont",
    role: "client",
    avatar: "Je", // Initiales ou Emoji
    phone: "06 12 34 56 78" // <--- AJOUTÉ
  },
  {
    id: "u2",
    email: "sophie@demo.com",
    name: "Sophie Martin",
    role: "client",
    avatar: "So",
    phone: "07 98 76 54 32" // <--- AJOUTÉ
  },
];

const SEED_RESOURCES: Resource[] = [
  { id: "p1", name: "Indoor1", type: "Indoor2", pricePerHour: 40, image: "🏆" },
  { id: "p2", name: "Indoor2", type: "Indoor", pricePerHour: 40, image: "🎾" },
  { id: "p3", name: "Indoor3", type: "Indoor", pricePerHour: 40, image: "🎾" },
  { id: "p4", name: "Indoor4", type: "Indoor", pricePerHour: 40, image: "☀️" },
  { id: "p5", name: "Indoor5", type: "Indoor", pricePerHour: 40, image: "☀️" },
];

const generateBookings = (): Booking[] => {
  const today = new Date().toISOString().split("T")[0];
  return [
    {
      id: "b1", resourceId: "p1", userId: "u1",
      start: `${today}T10:00:00.000Z`, end: `${today}T11:00:00.000Z`,
      status: "confirmed", paymentStatus: "paid", amountDue: 0, checkedIn: true,
    },
    {
      id: "b2", resourceId: "p2", userId: "u2",
      start: `${today}T14:00:00.000Z`, end: `${today}T15:00:00.000Z`,
      status: "confirmed", paymentStatus: "partial", amountDue: 21, checkedIn: false,
    },
  ];
};

// --- SIMULATEUR DB (LOCALSTORAGE) ---
class MockDB {
  private get<T>(key: string, seed: T): T {
    // Note: Pour éviter les problèmes de cache pendant le dév, 
    // on peut commenter la lecture du localStorage si on veut forcer le seed
    const stored = localStorage.getItem(`mock_${key}`);
    if (stored) return JSON.parse(stored);

    localStorage.setItem(`mock_${key}`, JSON.stringify(seed));
    return seed;
  }

  private set(key: string, data: any) {
    localStorage.setItem(`mock_${key}`, JSON.stringify(data));
  }

  get users(): User[] { return this.get("users", SEED_USERS); }
  get resources(): Resource[] { return this.get("resources", SEED_RESOURCES); }
  get bookings(): Booking[] { return this.get("bookings", generateBookings()); }

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
    const bookings = this.bookings.map((b) => b.id === updatedBooking.id ? updatedBooking : b);
    this.set("bookings", bookings);
    return updatedBooking;
  }
}

export const db = new MockDB();