import { Star } from "lucide-react";

export default function Rating({ value = 0, count, size = 14, showCount = true }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={n <= Math.round(value) ? "fill-primary-500 text-primary-500" : "text-ink-500/20"}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-ink-500">
          {value} ({count})
        </span>
      )}
    </div>
  );
}
