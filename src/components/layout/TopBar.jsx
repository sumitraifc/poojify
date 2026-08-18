import { Star, Phone, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../store/settingsStore";

export default function TopBar() {
  const { t } = useTranslation();
  const customerService = useSettingsStore((s) => s.customerService);
  const phoneEntry = customerService.find((c) => c.type === "phone");
  const phoneHref = phoneEntry?.value ?? "tel:9151124094";
  const phoneDisplay = phoneHref.replace("tel:", "");

  return (
    <div className="hidden bg-primary-50 py-1.5 text-xs text-ink-700 dark:bg-white/5 dark:text-cream-100/80 sm:block">
      <div className="section flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 shrink-0">
          <CreditCard size={13} className="text-primary-500" />
          <span className="hidden xs:inline">{t("topbar.paymentModes")}</span>
          <span className="xs:hidden">Online &amp; Offline Payment</span>
        </span>

        <span className="hidden sm:flex items-center gap-1">
          <Star size={13} className="fill-primary-500 text-primary-500" />
          {t("topbar.trusted")}
        </span>

        <a href={phoneHref} className="flex items-center gap-1 font-medium hover:text-primary-600 shrink-0">
          <Phone size={13} className="text-primary-500" />
          {phoneDisplay}
        </a>
      </div>
    </div>
  );
}
