import { useState } from "react";
import TourMap from "../components/Map";
import Message from "../components/Message";

export default function MyLocationPage() {
  const [saved, setSaved] = useState<{ lat: number; lng: number } | null>(null);
  const [toast, setToast] = useState<{ type: 'success'|'error'|'info'|'warning'; text: string } | null>(null);

  return (
    <section className="container py-3">
      <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="card-body">
          <h1 className="h4 mb-1">Kaži nam gde si</h1>
          <p className="text-secondary mb-0">
            Klikni <strong>Where are you?</strong>, pa klikni na mapu da postaviš svoju trenutnu lokaciju.
          </p>
        </div>
      </div>

      <TourMap
        mode="view"
        checkPoints={[]}
        onPickCoords={({ latitude, longitude }) => {
          setSaved({ lat: latitude, lng: longitude });
          setToast({
            type: 'success',
            text: `Lokacija sačuvana: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
          });
        }}
      />

      {toast && (
        <Message
          type={toast.type}
          text={toast.text}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </section>
  );
}
