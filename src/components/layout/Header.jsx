import { useState, useRef, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, Menu, LogIn, User, Bell, CheckCheck, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Logo from "./Logo";
import LocationBar from "./LocationBar";
import TopBar from "./TopBar";
import MobileMenu from "./MobileMenu";
import LoginDrawer from "../../features/auth/LoginDrawer";
import ProfileDrawer from "../../features/profile/ProfileDrawer";
import { useAuthStore } from "../../store/authStore";
import { useHomeStore } from "../../store/homeStore";
import { getCartList } from "../../api/cartApi";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../api/notificationApi";
import { useClickOutside } from "../../hooks/useClickOutside";
import { formatINR } from "../../utils/format";

const navLinks = [
  { to: "/", key: "nav.home" },
  { to: "/purohit-booking", key: "nav.purohitBooking" },
  { to: "/shop", key: "nav.shop" },
  { to: "/combo-offers", key: "nav.comboOffers" },
  { to: "/policy/about-us", key: "nav.aboutUs" },
  { to: "/policy/contact-us", key: "nav.contactUs" },
];

function CategoryDropdown({ categories, onSelect }) {
  return (
    <div className="absolute left-0 top-full z-[100] mt-1 w-full rounded-xl border border-ink-500/10 bg-white shadow-cardHover dark:bg-[#1B140F]">
      <p className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold text-ink-500">
        <TrendingUp size={13} /> Popular Categories
      </p>
      <div className="grid grid-cols-5 gap-3 px-4 pb-4">
        {categories.slice(0, 10).map((cat) => (
          <button
            key={cat.id}
            type="button"
            onMouseDown={() => onSelect(cat.name)}
            className="flex flex-col items-center gap-2 rounded-xl p-2 transition hover:bg-primary-50"
          >
            <div className="h-12 w-12 overflow-hidden rounded-full border border-ink-500/10 bg-cream-100 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
              <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
            </div>
            <span className="w-full text-center text-[10px] font-medium leading-tight text-ink-700 sm:text-xs">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// unread check — handles both 0/1 integer and false/true boolean from API
function isUnread(n) {
  return n.is_read === 0 || n.is_read === false || n.is_read === "0";
}

function NotifList({ notifications, onReadOne, onReadAll, unreadCount }) {
  return (
    <div onMouseDown={(e) => e.stopPropagation()} className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-ink-500/10 bg-white shadow-cardHover dark:bg-[#1B140F]">
      <div className="flex items-center justify-between border-b border-ink-500/10 px-4 py-3">
        <p className="font-semibold">Notifications</p>
        {unreadCount > 0 && (
          <button onClick={onReadAll} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-500">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => onReadOne(n.id)}
              className={`cursor-pointer border-b border-ink-500/5 px-4 py-3 transition hover:bg-cream-50 dark:hover:bg-white/5 ${isUnread(n) ? "bg-primary-50/60 dark:bg-primary-900/10" : ""}`}
            >
              <div className="flex items-start gap-2">
                {isUnread(n) && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
                <div className={isUnread(n) ? "" : "pl-4"}>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-ink-500">{n.message}</p>
                  <p className="mt-1 text-[10px] text-ink-500/60">
                    {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const queryClient = useQueryClient();
  const { pathname } = useLocation();

  const handleMenuClose = useCallback(() => setMenuOpen(false), []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(searchRef, () => setSearchFocused(false));

  useEffect(() => {
    const handler = () => setLoginOpen(true);
    window.addEventListener("poojify:require-login", handler);
    return () => window.removeEventListener("poojify:require-login", handler);
  }, []);

  const { isAuthenticated, user } = useAuthStore();
  const categories = useHomeStore((s) => s.categories);

  const { data: cartData } = useQuery({
    queryKey: ["cart-list"],
    queryFn: getCartList,
    enabled: isAuthenticated,
    select: (res) => res?.data ?? [],
  });
  const cartItems = Array.isArray(cartData) ? cartData : [];
  const cartCount = cartItems.reduce((sum, i) => sum + Number(i.quantity ?? 1), 0);
  const cartSubtotal = cartItems.reduce((sum, i) => sum + Number(i.discount_price ?? i.price ?? 0) * Number(i.quantity ?? 1), 0);

  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: isAuthenticated,
    select: (res) => res?.data ?? { unread_count: 0, list: [] },
  });
  const unreadCount = notifData?.unread_count ?? 0;
  const notifications = notifData?.list ?? [];

  const { mutate: readOne } = useMutation({
    mutationFn: (id) => markNotificationRead(id),
    onMutate: (id) => {
      queryClient.setQueryData(["notifications"], (old) => {
        if (!old) return old;
        const prev = old?.data ?? old;
        const updated = {
          ...prev,
          unread_count: Math.max(0, (prev.unread_count ?? 1) - 1),
          list: (prev.list ?? []).map((n) => n.id === id ? { ...n, is_read: 1 } : n),
        };
        return old?.data !== undefined ? { ...old, data: updated } : updated;
      });
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const { mutate: readAll } = useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: () => {
      queryClient.setQueryData(["notifications"], (old) => {
        if (!old) return old;
        const prev = old?.data ?? old;
        const updated = {
          ...prev,
          unread_count: 0,
          list: (prev.list ?? []).map((n) => ({ ...n, is_read: 1 })),
        };
        return old?.data !== undefined ? { ...old, data: updated } : updated;
      });
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      setSearchFocused(false);
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  }

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearch(val);
    if (val.trim().length >= 1) {
      setSearchFocused(false);
      navigate(`/search?q=${encodeURIComponent(val.trim())}`);
    }
  }

  function handleCategoryClick(name) {
    setSearch(name);
    setSearchFocused(false);
    navigate(`/search?q=${encodeURIComponent(name)}`);
  }

  const showDropdown = searchFocused && !search && categories.length > 0;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm dark:bg-[#1B140F] dark:shadow-black/40" style={{ overflow: "visible" }}>
      <TopBar />

      <div className="section flex items-center gap-4 py-3">
        <button className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu size={24} />
        </button>

        <Logo />
        <LocationBar />

        <form onSubmit={handleSearch} className="hidden flex-1 items-center lg:flex">
          <div ref={searchRef} className="relative w-full">
            <div className="flex w-full overflow-hidden rounded-lg border border-ink-500/15 dark:border-white/15">
              <input
                value={search}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                type="text"
                placeholder={t("nav.search")}
                className="w-full bg-transparent px-4 py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-500/50 dark:text-cream-100 dark:placeholder:text-cream-100/40"
              />
              <button type="submit" className="flex items-center justify-center bg-primary-500 px-5 text-white hover:bg-primary-600">
                <Search size={18} />
              </button>
            </div>
            {showDropdown && <CategoryDropdown categories={categories} onSelect={handleCategoryClick} />}
          </div>
        </form>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          {isAuthenticated ? (
            <button onClick={() => setProfileOpen(true)} className="hidden lg:flex items-center gap-2 rounded-full border border-ink-500/15 py-1.5 pl-1.5 pr-3 hover:bg-cream-200 dark:border-white/15 dark:hover:bg-white/5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <User size={15} />
              </span>
              <span className="hidden text-sm font-medium sm:inline">Hello, {user?.name || "User"}</span>
            </button>
          ) : (
            <button onClick={() => setLoginOpen(true)} className="btn-outline hidden sm:inline-flex">
              <LogIn size={16} /> {t("nav.login")}
            </button>
          )}

          {isAuthenticated && (
            <div ref={notifRef} className="relative hidden lg:block">
              <button
                onClick={(e) => { e.stopPropagation(); setNotifOpen((p) => !p); }}
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 dark:bg-white/10"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <NotifList
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onReadOne={readOne}
                  onReadAll={readAll}
                />
              )}
            </div>
          )}

          <Link to="/cart" className="relative flex items-center gap-2">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 dark:bg-white/10">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="hidden text-xs leading-tight sm:block">
              <span className="block text-ink-500 dark:text-cream-100/60">{t("nav.myCart")}</span>
              <span className="font-semibold">{formatINR(cartSubtotal)}</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile search + user/notif icons */}
      <div className="section pb-3 lg:hidden">
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex-1">
            <div ref={searchRef} className="relative">
              <div className="flex overflow-hidden rounded-lg border border-ink-500/15 dark:border-white/15">
                <input
                  value={search}
                  onChange={handleSearchChange}
                  onFocus={() => setSearchFocused(true)}
                  type="text"
                  placeholder={t("nav.search")}
                  className="w-full bg-transparent px-4 py-2 text-sm text-ink-900 outline-none placeholder:text-ink-500/50 dark:text-cream-100 dark:placeholder:text-cream-100/40"
                />
                <button type="submit" className="flex items-center justify-center bg-primary-500 px-4 text-white">
                  <Search size={16} />
                </button>
              </div>
              {showDropdown && <CategoryDropdown categories={categories} onSelect={handleCategoryClick} />}
            </div>
          </form>

          {isAuthenticated ? (
            <button onClick={() => setProfileOpen(true)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <User size={17} />
            </button>
          ) : (
            <button onClick={() => setLoginOpen(true)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-200 dark:bg-white/10">
              <LogIn size={17} />
            </button>
          )}

          {isAuthenticated && (
            <div ref={notifRef} className="relative shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setNotifOpen((p) => !p); }}
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 dark:bg-white/10"
                aria-label="Notifications"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <NotifList
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onReadOne={readOne}
                  onReadAll={readAll}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <nav className="hidden border-t border-ink-500/10 dark:border-white/10 lg:block">
        <div className="section flex items-center gap-7 py-3 text-sm font-medium">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => (isActive ? "text-primary-600 dark:text-[#E9C878]" : "text-ink-700 hover:text-primary-600 dark:text-cream-100/80 dark:hover:text-[#E9C878]")}
            >
              {t(link.key)}
            </NavLink>
          ))}
        </div>
      </nav>

      <MobileMenu open={menuOpen} onClose={handleMenuClose} onLoginClick={() => setLoginOpen(true)} />
      <LoginDrawer open={loginOpen} onClose={() => setLoginOpen(false)} />
      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
}
