import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, LogIn, User } from "lucide-react";
import { useTranslation } from "react-i18next";

import Logo from "./Logo";
import TopBar from "./TopBar";
import MobileMenu from "./MobileMenu";
import LoginDrawer from "../../features/auth/LoginDrawer";
import ProfileDrawer from "../../features/profile/ProfileDrawer";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { formatINR } from "../../utils/format";

const navLinks = [
  { to: "/", key: "nav.home" },
  { to: "/purohit-booking", key: "nav.purohitBooking" },
  { to: "/shop", key: "nav.shop" },
  { to: "/combo-offers", key: "nav.comboOffers" },
  { to: "/about", key: "nav.aboutUs" },
  { to: "/contact", key: "nav.contactUs" },
];

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const totalItems = useCartStore((s) => s.totalItems());
  const subtotal = useCartStore((s) => s.subtotal());
  const { isAuthenticated } = useAuthStore();

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?q=${encodeURIComponent(search.trim())}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <TopBar />

      <div className="section flex items-center gap-4 py-3">
        <button className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu size={24} />
        </button>

        <Logo />

        <form onSubmit={handleSearch} className="hidden flex-1 items-center md:flex">
          <div className="flex w-full overflow-hidden rounded-lg border border-ink-500/15">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder={t("nav.search")}
              className="w-full px-4 py-2.5 text-sm outline-none"
            />
            <button type="submit" className="flex items-center justify-center bg-primary-500 px-5 text-white hover:bg-primary-600">
              <Search size={18} />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          {isAuthenticated ? (
            <button onClick={() => setProfileOpen(true)} className="flex items-center gap-2 rounded-full border border-ink-500/15 py-1.5 pl-1.5 pr-3 hover:bg-cream-200">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <User size={15} />
              </span>
              <span className="hidden text-sm font-medium sm:inline">Hello, Priya</span>
            </button>
          ) : (
            <button onClick={() => setLoginOpen(true)} className="btn-outline hidden sm:inline-flex">
              <LogIn size={16} /> {t("nav.login")}
            </button>
          )}

          <Link to="/cart" className="relative flex items-center gap-2">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-cream-200">
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </span>
            <span className="hidden text-xs leading-tight sm:block">
              <span className="block text-ink-500">{t("nav.myCart")}</span>
              <span className="font-semibold">{formatINR(subtotal)}</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile search */}
      <form onSubmit={handleSearch} className="section pb-3 md:hidden">
        <div className="flex overflow-hidden rounded-lg border border-ink-500/15">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder={t("nav.search")}
            className="w-full px-4 py-2 text-sm outline-none"
          />
          <button type="submit" className="flex items-center justify-center bg-primary-500 px-4 text-white">
            <Search size={16} />
          </button>
        </div>
      </form>

      <nav className="hidden border-t border-ink-500/10 lg:block">
        <div className="section flex items-center gap-7 py-3 text-sm font-medium">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => (isActive ? "text-primary-600" : "text-ink-700 hover:text-primary-600")}
            >
              {t(link.key)}
            </NavLink>
          ))}
        </div>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onLoginClick={() => setLoginOpen(true)} />
      <LoginDrawer open={loginOpen} onClose={() => setLoginOpen(false)} />
      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
}
