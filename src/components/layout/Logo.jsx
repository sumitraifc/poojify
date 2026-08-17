import { Link } from "react-router-dom";

export default function Logo({ size = "md" }) {
  const heightClass = size === "lg" ? "h-16" : size === "sm" ? "h-10" : "h-10 md:h-14";
  return (
    <Link to="/" className="flex flex-col items-start leading-none">
      <img src="/assets/logo.png" alt="Poojify" className={`${heightClass} w-auto object-contain`} />
    </Link>
  );
}
