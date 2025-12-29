import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // Récupération du User connecté
import type { Resource } from "../../types";
import {
  fetchResources,
  createBooking,
  getDailySlots,
  type TimeSlot,
} from "./bookingService";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Calendar } from "../../components/ui/Calendar";

// --- TYPES LOCALES ---
type PaymentMode = "full" | "split";

// --- HELPERS ---
const formatCardNumber = (v: string) =>
  v
    .replace(/\s+/g, "")
    .replace(/[^0-9]/gi, "")
    .replace(/\d{4}(?=.)/g, "$& ");
const getGenericResourceName = (res: Resource) => {
  if (res.name.toLowerCase().includes("indoor")) return "Padel Indoor";
  if (res.name.toLowerCase().includes("outdoor")) return "Padel Outdoor";
  return "Terrain Padel";
};

// --- INDICATEUR ---
const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="flex justify-center mb-8">
    <div className="flex items-center gap-2">
      {["Terrain", "Date", "Tarif", "Paiement"].map((_, idx) => (
        <div
          key={idx}
          className={`h-2 w-12 rounded-full transition-all duration-300 ${
            idx + 1 <= currentStep ? "bg-indigo-600" : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  </div>
);

export default function BookingWizard() {
  const { user } = useAuth(); // On récupère l'utilisateur connecté

  // States
  const [step, setStep] = useState(1);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("full");

  // Fake Form
  const [cardNumber, setCardNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Init
  useEffect(() => {
    fetchResources().then(setResources);
  }, []);

  // Update Slots
  useEffect(() => {
    if (selectedResource && step === 2) {
      setSlotsLoading(true);
      setSelectedSlot(null);
      getDailySlots(selectedResource.id, selectedDate)
        .then(setAvailableSlots)
        .finally(() => setSlotsLoading(false));
    }
  }, [selectedDate, selectedResource, step]);

  // Actions
  const handleFinalBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource || !selectedSlot || !user) return;

    setIsLoading(true);
    try {
      // APPEL DU SERVICE
      const booking = await createBooking(
        selectedResource.id,
        selectedSlot.start,
        selectedSlot.end,
        user.id,
        selectedResource.pricePerHour,
        paymentMode
      );

      setSuccessId(booking.id);
      setStep(5);
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDU ETAPES ---

  // 1. Choix Terrain
  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">
        Choisissez votre terrain
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((res) => (
          <Card
            key={res.id}
            onClick={() => {
              setSelectedResource(res);
              setStep(2);
            }}
            selected={selectedResource?.id === res.id}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-5xl">{res.image}</span>
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">
                {res.pricePerHour}€/h
              </span>
            </div>
            <h3 className="text-xl font-bold">{res.name}</h3>
            <p className="text-slate-400 text-sm">{res.type}</p>
          </Card>
        ))}
      </div>
    </div>
  );

  // 2. Date & Heure
  const renderStep2 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in zoom-in-95">
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          📅 Choisir la date
        </h3>
        <div className="flex justify-center">
          <Calendar
            selectedDate={new Date(selectedDate)}
            onChange={(d) => {
              const offset = new Date(
                d.getTime() - d.getTimezoneOffset() * 60000
              );
              setSelectedDate(offset.toISOString().split("T")[0]);
            }}
          />
        </div>
      </div>
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          ⏰ Choisir l'horaire
        </h3>
        <div className="flex-1">
          {slotsLoading ? (
            <div className="text-center py-10 text-slate-400">
              Chargement...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {availableSlots.map((slot, i) => (
                <button
                  key={i}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-3 rounded-xl font-bold border transition-all ${
                    !slot.available
                      ? "bg-slate-50 text-slate-300 line-through"
                      : selectedSlot?.time === slot.time
                      ? "bg-slate-900 text-white scale-105 shadow-lg"
                      : "bg-white border-slate-200 hover:border-indigo-500"
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setStep(3)} disabled={!selectedSlot}>
            Suivant →
          </Button>
        </div>
      </div>
    </div>
  );

  // 3. Paiement Mode
  const renderStep3 = () => {
    if (!selectedResource) return null;
    const price = selectedResource.pricePerHour;
    return (
      <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8">
        <div
          onClick={() => {
            setPaymentMode("full");
            setStep(4);
          }}
          className="cursor-pointer p-8 bg-white border-2 border-slate-100 hover:border-indigo-500 hover:shadow-xl rounded-3xl transition-all group"
        >
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
            💎
          </div>
          <h3 className="font-bold text-xl">Tout payer</h3>
          <p className="text-slate-500 text-sm mt-2">
            Vous réglez {price}€. Vos amis n'ont rien à payer.
          </p>
        </div>
        <div
          onClick={() => {
            setPaymentMode("split");
            setStep(4);
          }}
          className="cursor-pointer p-8 bg-white border-2 border-slate-100 hover:border-indigo-500 hover:shadow-xl rounded-3xl transition-all group"
        >
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
            🍕
          </div>
          <h3 className="font-bold text-xl">Juste ma part</h3>
          <p className="text-slate-500 text-sm mt-2">
            Vous réglez {(price / 4).toFixed(2)}€. Le reste sur place.
          </p>
        </div>
      </div>
    );
  };

  // 4. Checkout
  const renderStep4 = () => {
    if (!selectedResource || !selectedSlot) return null;
    const finalPrice =
      paymentMode === "full"
        ? selectedResource.pricePerHour
        : selectedResource.pricePerHour / 4;

    return (
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
          <h3 className="font-bold text-lg mb-4">Récapitulatif</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Terrain</span>
              <span className="font-bold">
                {getGenericResourceName(selectedResource)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span className="font-bold">
                {new Date(selectedDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Heure</span>
              <span className="font-bold">{selectedSlot.time}</span>
            </div>
            <div className="h-px bg-slate-200 my-4" />
            <div className="flex justify-between text-lg text-indigo-600 font-bold">
              <span>Total à payer</span>
              <span>{finalPrice.toFixed(2)}€</span>
            </div>
            {paymentMode === "split" && (
              <p className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
                ⚠️ Reste{" "}
                {(selectedResource.pricePerHour - finalPrice).toFixed(2)}€ à
                régler sur place.
              </p>
            )}
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <h3 className="font-bold text-xl mb-6">Paiement sécurisé</h3>
          <form onSubmit={handleFinalBooking} className="space-y-4">
            <input
              type="text"
              placeholder="Numéro de carte"
              required
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              className="w-full p-3 bg-slate-50 border rounded-xl"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="MM/AA"
                required
                maxLength={5}
                className="w-full p-3 bg-slate-50 border rounded-xl text-center"
              />
              <input
                type="text"
                placeholder="CVC"
                required
                maxLength={3}
                className="w-full p-3 bg-slate-50 border rounded-xl text-center"
              />
            </div>
            <Button disabled={isLoading} className="w-full py-4 mt-4 text-lg">
              {isLoading ? "Traitement..." : `Payer ${finalPrice.toFixed(2)}€`}
            </Button>
          </form>
        </div>
      </div>
    );
  };

  // 5. Success
  const renderSuccess = () => (
    <div className="text-center py-12 animate-in zoom-in">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-3xl font-bold mb-4">Réservation Confirmée !</h2>
      <p className="text-slate-500 mb-8">
        Votre numéro de commande est <strong>#{successId}</strong>
      </p>
      <Button variant="secondary" onClick={() => window.location.reload()}>
        Nouvelle réservation
      </Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {step < 5 && <StepIndicator currentStep={step} />}
      <div className="mt-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderSuccess()}
      </div>
    </div>
  );
}
