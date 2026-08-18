import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import Logo from "./Logo";
import { useAuthStore } from "../../store/authStore";

const links = [
  { to: "/", key: "nav.home" },
  { to: "/purohit-booking", key: "nav.purohitBooking" },
  { to: "/shop", key: "nav.shop" },
  { to: "/combo-offers", key: "nav.comboOffers" },
  { to: "/about", key: "nav.aboutUs" },
  { to: "/contact", key: "nav.contactUs" },
];

export default function MobileMenu({ open, onClose, onLoginClick }) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    if (open) onClose();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed left-0 top-0 z-50 h-full w-72 overflow-y-auto bg-white p-5 shadow-cardHover dark:bg-[#1B140F] lg:hidden"
          >
            <div className="mb-6 flex items-center justify-between">
              <Logo size="sm" />
              <button onClick={onClose} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive ? "bg-primary-50 text-primary-600" : "text-ink-700 hover:bg-cream-100"
                    }`
                  }
                >
                  {t(link.key)}
                </NavLink>
              ))}
            </nav>

            <div className="mt-6 flex flex-col gap-2 border-t border-ink-500/10 pt-4">
              <Link to="/language" onClick={onClose} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-100">
                <Globe size={16} className="text-primary-500" /> {t("language.title")}
              </Link>
              {!isAuthenticated && (
                <button
                  onClick={() => {
                    onClose();
                    onLoginClick?.();
                  }}
                  className="btn-primary mt-2 justify-center"
                >
                  <LogIn size={16} /> {t("nav.login")}
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
