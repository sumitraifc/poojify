import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * Generic right-side sliding drawer — reused for Login/OTP and Profile menu.
 * Matches the "Welcome to Poojify" / "Hello, Priya" panels from the design.
 */
export default function Drawer({ open, onClose, children, width = "max-w-md" }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className={`fixed right-0 top-0 z-50 h-full w-full ${width} overflow-y-auto bg-white shadow-cardHover`}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full hover:bg-cream-200"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
