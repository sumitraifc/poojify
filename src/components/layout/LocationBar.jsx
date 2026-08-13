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
      className="flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-1 text-left hover:bg-cream-200 dark:hover:bg-white/5"
    >
      <MapPin size={13} className="shrink-0 text-primary-500 md:size-[17px]" />
      <span className="leading-tight">
        <span className="block text-[9px] text-ink-500 md:text-[10px]">Deliver to</span>
        <span className="block max-w-[90px] truncate text-[10px] font-semibold md:max-w-[130px] md:text-xs">{label}</span>
      </span>
      <ChevronDown size={11} className="text-ink-500 md:size-[13px]" />
    </button>
  );
}
