import { Minus, Plus } from "lucide-react";

export default function QuantityStepper({ value, onChange, min = 1, max = 99 }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-ink-500/15 bg-white">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center text-ink-700 hover:text-primary-600 disabled:opacity-30"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus size={15} />
      </button>
      <span className="w-8 text-center text-sm font-semibold">{value}</span>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center text-ink-700 hover:text-primary-600 disabled:opacity-30"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
