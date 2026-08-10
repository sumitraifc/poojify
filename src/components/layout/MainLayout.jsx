import { Outlet } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      <a
        href="https://wa.me/919876543210"
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
