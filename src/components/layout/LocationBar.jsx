import { useNavigate } from "react-router-dom";
import { MapPin, ChevronDown } from "lucide-react";
import { useLocationStore } from "../../store/locationStore";

export default function LocationBar() {
  const navigate = useNavigate();
  const { latitude, longitude, address } = useLocationStore();

  const label = address
    ? address
    : latitude
    ? `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
    : "Set your location";

  return (
    <button
      onClick={() => navigate("/profile/address")}
      className="hidden shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-left hover:bg-cream-200 dark:hover:bg-white/5 md:flex"
    >
      <MapPin size={17} className="shrink-0 text-primary-500" />
      <span className="leading-tight">
        <span className="block text-[10px] text-ink-500">Deliver to</span>
        <span className="block max-w-[130px] truncate text-xs font-semibold">{label}</span>
      </span>
      <ChevronDown size={13} className="text-ink-500" />
    </button>
  );
}
