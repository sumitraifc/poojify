import { motion } from "framer-motion";
import Button from "./Button";

export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
          <Icon className="h-8 w-8 text-primary-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-ink-500">{subtitle}</p>}
      {actionLabel && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
