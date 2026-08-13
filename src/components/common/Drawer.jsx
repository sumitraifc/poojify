import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * Generic right-side sliding drawer — reused for Login/OTP and Profile menu.
 *
 * Fix: the close (X) button now lives in its own fixed header row, separate
 * from the scrollable body. Previously it was absolutely positioned *inside*
 * the same scrolling container as the content, so scrolling the drawer down
 * carried the button away — making it look like the drawer "wouldn't close"
 * when in fact the X was just no longer on screen.
 */
export default function Drawer({ open, onClose, children, width = "max-w-md" }) {
  // Lock background scroll while the drawer is open
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  // Escape key also closes the drawer
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, handleClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={handleClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={`fixed right-0 top-0 z-[61] flex h-full w-full ${width} flex-col bg-white shadow-cardHover dark:bg-[#1B140F]`}
          >
            {/* Fixed header — close button always stays reachable, never scrolls away */}
            <div className="flex shrink-0 justify-end p-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream-200 dark:hover:bg-white/10"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-2 pb-6">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
