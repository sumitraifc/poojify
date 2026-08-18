import { Star, Phone, Headset, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../store/settingsStore";

export default function TopBar() {
  const { t } = useTranslation();
  const customerService = useSettingsStore((s) => s.customerService);
  const phoneEntry = customerService.find((c) => c.type === "phone");
  const phoneHref = phoneEntry?.value ?? "tel:9151124094";
  const phoneDisplay = phoneHref.replace("tel:", "");

  return (
    <div className="hidden bg-primary-50 py-2 text-xs text-ink-700 dark:bg-white/5 dark:text-cream-100/80 sm:block">
      <div className="section flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <CreditCard size={14} className="text-primary-500" /> {t("topbar.paymentModes")}
        </span>
        <span className="flex items-center gap-1.5">
          <Star size={14} className="fill-primary-500 text-primary-500" /> {t("topbar.trusted")}
        </span>
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Headset size={14} className="text-primary-500" /> {t("topbar.support")}
          </span>
          <a href={phoneHref} className="flex items-center gap-1.5 font-medium hover:text-primary-600">
            <Phone size={14} className="text-primary-500" /> {phoneDisplay}
          </a>
        </span>
      </div>
    </div>
  );
}
