import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-3">
      <Spinner />
      <p className="text-sm text-ink-500">Loading, please wait...</p>
    </div>
  );
}

export function Spinner({ size = 40 }) {
  return (
    <motion.div
      className="rounded-full border-4 border-primary-100 border-t-primary-500"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
    />
  );
}

/** Skeleton block — use for card/list placeholders while data fetches */
export function SkeletonBlock({ className = "h-4 w-full" }) {
  return <div className={`skeleton ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card">
      <SkeletonBlock className="h-40 w-full mb-3 rounded-lg" />
      <SkeletonBlock className="h-4 w-3/4 mb-2" />
      <SkeletonBlock className="h-4 w-1/2 mb-3" />
      <SkeletonBlock className="h-9 w-full rounded-lg" />
    </div>
  );
}
