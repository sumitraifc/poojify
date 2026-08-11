import { Link } from "react-router-dom";

export default function Logo({ size = "md" }) {
  const heightClass = size === "lg" ? "h-14" : size === "sm" ? "h-8" : "h-10";
  return (
    <Link to="/" className="flex flex-col items-start leading-none">
      <img src="/assets/logo.png" alt="Poojify" className={`${heightClass} w-auto object-contain`} />
      {size !== "sm" && (
        <span className="mt-0.5 text-[11px] font-medium text-ink-500 dark:text-cream-100/60">
          Connecting Devotion to You
        </span>
      )}
    </Link>
  );
}
