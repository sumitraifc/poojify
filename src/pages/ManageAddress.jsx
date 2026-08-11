import { useState } from "react";
import { LocateFixed, MapPin, Plus, Pencil, Trash2, Home, Briefcase, Check } from "lucide-react";
import PageTransition from "../components/common/PageTransition";
import Breadcrumb from "../components/common/Breadcrumb";
import Button from "../components/common/Button";
import { showToast } from "../components/common/Toast";
import { useLocationStore } from "../store/locationStore";

const initialAddresses = [
  { id: "a1", label: "Home", icon: Home, isDefault: true, line: "123, Shanti Nagar, Indiranagar, Lucknow, Uttar Pradesh - 226016" },
  { id: "a2", label: "Work", icon: Briefcase, isDefault: false, line: "Plot No. 45, Malviya Nagar, Jaipur, Rajasthan - 302017" },
];

export default function ManageAddress() {
  const { latitude, longitude, address, setCoords, setAddress } = useLocationStore();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [pin, setPin] = useState(null); // { xPercent, yPercent }
  const [locating, setLocating] = useState(false);
  const [resolvedText, setResolvedText] = useState(address || "");

  function useCurrentLocation() {
    if (!navigator.geolocation) return showToast.error("Location isn't supported on this device");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setCoords(pos.coords.latitude, pos.coords.longitude);
        const label = `Near ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`;
        setResolvedText(label);
        setAddress(label);
        setPin({ xPercent: 50, yPercent: 50 });
        showToast.success("Current location detected");
      },
      () => {
        setLocating(false);
        showToast.error("Couldn't access your location. Please allow permission.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function handleMapClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
    setPin({ xPercent, yPercent });

    // Simulate reverse-geocoding the pinned pixel into a readable address
    const mockLat = (26.85 + (50 - yPercent) * 0.002).toFixed(4);
    const mockLng = (80.94 + (xPercent - 50) * 0.002).toFixed(4);
    const label = `Pinned location · ${mockLat}° N, ${mockLng}° E`;
    setResolvedText(label);
  }

  function confirmPinnedLocation() {
    if (!pin) return showToast.error("Drop a pin on the map first");
    setAddress(resolvedText);
    showToast.success("Location set from map");
  }

  function removeAddress(id) {
    setAddresses((list) => list.filter((a) => a.id !== id));
    showToast("Address removed", { icon: "🗑️" });
  }

  return (
    <PageTransition>
      <div className="section-y">
        <div className="section max-w-3xl">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Manage Address" }]} />
          <h1 className="mb-1 text-2xl font-bold">Manage Address</h1>
          <p className="mb-6 text-sm text-ink-500">Set your delivery location using your current location or by pinning it on the map.</p>

          {/* Current location */}
          <div className="card mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  <LocateFixed size={17} className="text-primary-500" /> Use Current Location
                </p>
                <p className="text-sm text-ink-500">
                  {latitude ? `Detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : "We'll use your device GPS to detect your address"}
                </p>
              </div>
              <Button size="sm" loading={locating} onClick={useCurrentLocation}>
                <LocateFixed size={15} /> Detect My Location
              </Button>
            </div>
          </div>

          {/* Pick on map */}
          <div className="card mb-6">
            <p className="mb-3 flex items-center gap-2 font-semibold">
              <MapPin size={17} className="text-primary-500" /> Pick Location on Map
            </p>
            <div
              onClick={handleMapClick}
              className="relative h-56 w-full cursor-crosshair overflow-hidden rounded-xl bg-[repeating-linear-gradient(45deg,theme(colors.cream.200),theme(colors.cream.200)_10px,theme(colors.cream.100)_10px,theme(colors.cream.100)_20px)]"
            >
              <div className="absolute inset-0 flex items-center justify-center text-xs text-ink-500">
                Tap anywhere to drop a pin (map preview)
              </div>
              {pin && (
                <span
                  className="absolute -translate-x-1/2 -translate-y-full"
                  style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }}
                >
                  <MapPin size={30} className="fill-primary-500 text-primary-700 drop-shadow" />
                </span>
              )}
            </div>

            {pin && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input value={resolvedText} onChange={(e) => setResolvedText(e.target.value)} className="input flex-1" placeholder="Confirm or edit address label" />
                <Button size="sm" onClick={confirmPinnedLocation}><Check size={15} /> Set This Location</Button>
              </div>
            )}
          </div>

          {/* Saved addresses */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Saved Addresses</h2>
            <button className="flex items-center gap-1 text-sm font-medium text-primary-600">
              <Plus size={14} /> Add New Address
            </button>
          </div>
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="card flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                    <addr.icon size={16} />
                  </span>
                  <div>
                    <p className="flex items-center gap-2 font-semibold">
                      {addr.label} {addr.isDefault && <span className="badge-success">Default</span>}
                    </p>
                    <p className="text-sm text-ink-500">{addr.line}</p>
                  </div>
                </div>
                <div className="flex gap-2 text-ink-500">
                  <button aria-label="Edit"><Pencil size={15} /></button>
                  <button aria-label="Delete" onClick={() => removeAddress(addr.id)} className="text-danger"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
