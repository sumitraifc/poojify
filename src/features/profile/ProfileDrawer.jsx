import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Pencil, Crown, Package, Heart, User, MapPin, Headset, MessageSquare,
  Sun, Moon, Globe, Shield, FileText, RefreshCw, Info, LogOut, ChevronRight, Clock, CheckCircle, XCircle,
} from "lucide-react";
import Drawer from "../../components/common/Drawer";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { getProfile } from "../../api/userApi";

export default function ProfileDrawer({ open, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: !!useAuthStore.getState().token,
    select: (res) => res?.data ?? res,
  });

  const pandit = profileData?.pandit ?? null;
  const approvalStatus = pandit?.approval_status;

  function go(to) {
    onClose();
    setTimeout(() => navigate(to), 0);
  }

  function handleLogout() {
    logout();
    onClose();
    navigate("/");
  }

  const accountLinks = [
    { icon: User, label: "Edit Profile", to: "/profile/edit" },
    { icon: MapPin, label: "Manage Address", to: "/profile/address" },
    { icon: Headset, label: "Contact Us", to: "/contact" },
    { icon: MessageSquare, label: "Send Feedback", to: "/profile/feedback" },
  ];

  const supportLinks = [
    { icon: Shield, label: "Privacy Policy", to: "/privacy-policy" },
    { icon: FileText, label: "Terms & Conditions", to: "/terms" },
    { icon: RefreshCw, label: "Refund & Cancellation Policy", to: "/refund-policy" },
    { icon: Info, label: "About Us", to: "/about" },
    { icon: Headset, label: "Contact Us", to: "/contact" },
  ];

  return (
    <Drawer open={open} onClose={onClose}>
      <div className="p-6">
        <div className="mb-5 flex items-center justify-between rounded-xl">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <User size={22} />
            </span>
            <div>
              <p className="font-semibold">Hello, {user?.name || "Devotee"} 🙏</p>
              <p className="text-sm text-ink-500">{user?.mobile || user?.phone || ""}</p>
            </div>
          </div>
          <button onClick={() => go("/profile/edit")} className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-500/15 hover:bg-cream-200">
            <Pencil size={14} />
          </button>
        </div>

        {/* Pandit status / become purohit */}
        {pandit ? (
          <div className={`mb-5 flex w-full items-center justify-between rounded-xl px-4 py-3 ${
            approvalStatus === 1 ? "bg-success/10" : approvalStatus === 2 ? "bg-danger/10" : "bg-amber-50"
          }`}>
            <span className={`flex items-center gap-2 text-sm font-semibold ${
              approvalStatus === 1 ? "text-success" : approvalStatus === 2 ? "text-danger" : "text-amber-700"
            }`}>
              {approvalStatus === 1 ? <CheckCircle size={16} /> : approvalStatus === 2 ? <XCircle size={16} /> : <Clock size={16} />}
              {approvalStatus === 1 ? "Purohit Profile Active" : approvalStatus === 2 ? "Application Rejected" : "Application Under Review"}
            </span>
            <div className="flex items-center gap-2">
              {approvalStatus === 0 && <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">PENDING</span>}
              {approvalStatus === 1 && <span className="rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-bold text-success">APPROVED</span>}
              {approvalStatus === 2 && <span className="rounded-full bg-danger/20 px-2 py-0.5 text-[10px] font-bold text-danger">REJECTED</span>}
              {approvalStatus === 1 && (
                <button onClick={() => go("/pandit-dashboard")} className="flex items-center gap-1 rounded-lg bg-success px-3 py-1 text-xs font-bold text-white hover:bg-success/90 transition">
                  Dashboard <ChevronRight size={12} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => go("/purohit-registration")}
            className="mb-5 flex w-full items-center justify-between rounded-xl bg-primary-50 px-4 py-3 text-left"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-primary-700">
              <Crown size={16} /> Become a Worshipper (Purohit)
            </span>
            <ChevronRight size={16} className="text-primary-500" />
          </button>
        )}

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">My Orders</p>
        <div className="mb-5 grid grid-cols-2 gap-3">
          <DrawerTile icon={Package} label="My Orders" onClick={() => go("/orders")} />
          <DrawerTile icon={Heart} label="Wishlist" onClick={() => go("/wishlist")} tint="danger" />
          <DrawerTile icon={Crown} label="My Bookings" onClick={() => go("/my-bookings")} />
        </div>

        <Section title="Account Details" links={accountLinks} onNavigate={go} />

        <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-cream-100/50">Appearance</p>
        <div className="mb-5 space-y-1">
          {/* <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-cream-100 dark:hover:bg-white/5"
          >
            <span className="flex items-center gap-3">
              {theme === "dark" ? <Moon size={16} className="text-[#E9C878]" /> : <Sun size={16} className="text-primary-500" />}
              Theme
            </span>
            <span className="flex items-center gap-2">
              <span className="text-ink-500 dark:text-cream-100/60">{theme === "dark" ? "Dark" : "Light"}</span>
              <span className={`relative h-5 w-9 rounded-full transition-colors ${theme === "dark" ? "bg-[#D9A441]" : "bg-ink-500/20"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${theme === "dark" ? "translate-x-4" : "translate-x-0.5"}`} />
              </span>
            </span>
          </button> */}
          <button onClick={() => go("/language")} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-cream-100 dark:hover:bg-white/5">
            <span className="flex items-center gap-3"><Globe size={16} className="text-primary-500" /> Language</span>
            <span className="flex items-center gap-1 text-ink-500 dark:text-cream-100/60">{t("brand") === "पूजिफाई" ? "हिन्दी" : "English"} <ChevronRight size={14} /></span>
          </button>
        </div>

        <Section title="Support" links={supportLinks} onNavigate={go} />

        <button
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-danger/30 py-3 text-sm font-semibold text-danger hover:bg-danger/5"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </Drawer>
  );
}

function DrawerTile({ icon: Icon, label, onClick, tint = "primary" }) {
  return (
    <button onClick={onClick} className="card flex items-center gap-2 !p-3 text-left hover:border-primary-300">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${tint === "danger" ? "bg-danger/10 text-danger" : "bg-primary-50 text-primary-600"}`}>
        <Icon size={15} />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function Section({ title, links, onNavigate }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">{title}</p>
      <div className="space-y-1">
        {links.map((l) => (
          <button
            key={l.label}
            onClick={() => onNavigate(l.to)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-cream-100"
          >
            <span className="flex items-center gap-3"><l.icon size={16} className="text-primary-500" /> {l.label}</span>
            <ChevronRight size={14} className="text-ink-500" />
          </button>
        ))}
      </div>
    </div>
  );
}

function RowItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm">
      <span className="flex items-center gap-3"><Icon size={16} className="text-primary-500" /> {label}</span>
      <span className="text-ink-500">{value}</span>
    </div>
  );
}
