import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Pencil, Crown, Package, Heart, User, MapPin, Headset, MessageSquare,
  Sun, Globe, Shield, FileText, RefreshCw, Info, LogOut, ChevronRight,
} from "lucide-react";
import Drawer from "../../components/common/Drawer";
import { useAuthStore } from "../../store/authStore";

export default function ProfileDrawer({ open, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  function go(to) {
    onClose();
    navigate(to);
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
              <p className="text-sm text-ink-500">{user?.phone || "+91 98765 43210"}</p>
            </div>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-500/15 hover:bg-cream-200">
            <Pencil size={14} />
          </button>
        </div>

        <button
          onClick={() => go("/purohit-registration")}
          className="mb-5 flex w-full items-center justify-between rounded-xl bg-primary-50 px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-primary-700">
            <Crown size={16} /> Become a Worshipper (Purohit)
          </span>
          <ChevronRight size={16} className="text-primary-500" />
        </button>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">My Orders</p>
        <div className="mb-5 grid grid-cols-2 gap-3">
          <DrawerTile icon={Package} label="My Orders" onClick={() => go("/orders")} />
          <DrawerTile icon={Heart} label="Wishlist" onClick={() => go("/wishlist")} tint="danger" />
          <DrawerTile icon={Crown} label="My Bookings" onClick={() => go("/my-bookings")} />
        </div>

        <Section title="Account Details" links={accountLinks} onNavigate={go} />

        <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-500">Appearance</p>
        <div className="mb-5 space-y-1">
          <RowItem icon={Sun} label="Theme" value="Light" />
          <button onClick={() => go("/language")} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-cream-100">
            <span className="flex items-center gap-3"><Globe size={16} className="text-primary-500" /> Language</span>
            <span className="flex items-center gap-1 text-ink-500">{t("brand") === "पूजिफाई" ? "हिन्दी" : "English"} <ChevronRight size={14} /></span>
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
