import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Shield, Package, RefreshCw, Headset } from "lucide-react";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import { useAuthStore } from "../../store/authStore";

const shopCategories = ["Pooja Samagri", "Pooja Kits", "Flowers & Garlands", "Havan Essentials", "Agarbatti, Dhoop & Incense", "Diyas & Lighting"];
const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Purohit Ji Booking", to: "/purohit-booking" },
  { label: "Shop", to: "/shop" },
  { label: "Combo Offers", to: "/combo-offers" },
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
];
const customerService = [
  { label: "Shipping Policy", to: "/shipping-policy" },
  { label: "Return & Refund Policy", to: "/refund-policy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact Us", to: "/contact" },
];
const myAccount = [
  { label: "My Orders", to: "/orders" },
  { label: "Wishlist", to: "/wishlist" },
  { label: "Track Order", to: "/orders" },
  // { label: "My Bookings", to: "/my-bookings" },
];

const guestLinks = [
  { label: "Login / Register", to: "/login" },
];

const trustBadges = [
  { icon: Shield, title: "100% Authentic Products", subtitle: "Sourced from trusted vendors" },
  { icon: Package, title: "Secure Packaging", subtitle: "Safe & hygienic delivery" },
  { icon: RefreshCw, title: "Easy Returns", subtitle: "Hassle-free return policy" },
  { icon: Headset, title: "Customer Support", subtitle: "We're here to help you" },
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-16 bg-white dark:bg-[#1B140F]">

      {/* Trust badges */}
      <div className="border-t border-ink-500/10 py-8 dark:border-white/10">
        <div className="section grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustBadges.map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                <b.icon size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold dark:text-cream-100">{b.title}</p>
                <p className="text-xs text-ink-500 dark:text-cream-100/50">{b.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer links */}
      <div className="bg-cream-100 py-10 dark:bg-[#241B14]">
        <div className="section grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-ink-500 dark:text-cream-100/60">{t("footer.trustedPlatform")}</p>
            <div className="mt-4 flex gap-3">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon-700 text-white hover:bg-primary-500">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title={t("footer.shopCategories")} items={shopCategories.map((label) => ({ label, to: "/shop" }))} />
          <FooterCol title={t("footer.quickLinks")} items={quickLinks} />
          <FooterCol title={t("footer.customerService")} items={customerService} />
          <FooterCol title={t("footer.myAccount")} items={myAccount} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-maroon-700 py-4 text-center text-xs text-white/80 dark:bg-black/60">
        {t("footer.rights")}
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-ink-900 dark:text-cream-100">{title}</h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link to={item.to} className="text-sm text-ink-500 hover:text-primary-600 dark:text-cream-100/60 dark:hover:text-[#E9C878]">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
