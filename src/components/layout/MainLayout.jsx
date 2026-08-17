import { Outlet } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import { useSettingsStore } from "../../store/settingsStore";

export default function MainLayout() {
  const waEntry = useSettingsStore((s) => s.customerService.find((c) => c.type === "Whatsapp"));
  const waHref = waEntry?.value ?? "https://wa.me/919876543210";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      <a
        href={waHref}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-cardHover transition-transform hover:scale-105"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={26} fill="white" />
      </a>
    </div>
  );
}
