import { Truck, Star, Phone, Headset } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TopBar() {
  const { t } = useTranslation();
  return (
    <div className="hidden bg-primary-50 py-2 text-xs text-ink-700 dark:bg-white/5 dark:text-cream-100/80 sm:block">
      <div className="section flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Truck size={14} className="text-primary-500" /> {t("topbar.freeDelivery")}
        </span>
        <span className="flex items-center gap-1.5">
          <Star size={14} className="fill-primary-500 text-primary-500" /> {t("topbar.trusted")}
        </span>
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Headset size={14} className="text-primary-500" /> {t("topbar.support")}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Phone size={14} className="text-primary-500" /> +91 98765 43210
          </span>
        </span>
      </div>
    </div>
  );
}
