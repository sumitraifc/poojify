import { Link } from "react-router-dom";
import { Flame } from "lucide-react";

export default function Logo({ size = "md" }) {
  const textSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <Link to="/" className="flex flex-col leading-none">
      <span className={`flex items-center gap-1 font-display font-bold ${textSize} text-ink-900`}>
        P
        <span className="relative inline-flex h-[0.85em] w-[0.85em] items-center justify-center rounded-full bg-primary-100">
          <Flame size={size === "lg" ? 18 : 14} className="text-primary-500" />
        </span>
        OJIFY
      </span>
      {size !== "sm" && <span className="text-[11px] font-medium text-ink-500">Connecting Devotion to You</span>}
    </Link>
  );
}
