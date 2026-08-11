import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const slides = [
  "/assets/hero/hero-1.webp",
  // "/assets/hero/hero-2.jpg",
  // "/assets/hero/hero-3.jpg",
];

export default function HeroSection() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-y">
      <div className="section grid gap-6 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="badge mb-4">
            <ShieldCheck size={13} className="mr-1" /> Verified Purohit Service
          </span>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {t("home.heroTitle1")} <span className="text-primary-500">{t("home.heroTitle2")}</span>
          </h1>
          <p className="mt-3 max-w-md text-ink-500">{t("home.heroSubtitle")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/purohit-booking" className="btn-primary btn-lg">Book a Purohit Ji</Link>
            <Link to="/shop" className="btn-outline btn-lg">{t("common.shopNow")}</Link>
          </div>
        </motion.div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-maroon-700 sm:aspect-video">
          <AnimatePresence mode="wait">
            <motion.img
              key={index}
              src={slides[index]}
              alt="Pooja essentials"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="h-full w-full object-cover"
            />
          </AnimatePresence>

          {/* <div className="absolute left-4 top-4 rounded-lg bg-black/50 px-3 py-2 text-white backdrop-blur">
            <p className="text-xs">Special Offer</p>
            <p className="text-sm font-bold">
              Up to <span className="text-primary-300">15% OFF</span> on Combo Puja
            </p>
          </div> */}

          <button
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 hover:bg-white"
            aria-label="Previous slide"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 hover:bg-white"
            aria-label="Next slide"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-primary-400" : "w-1.5 bg-white/60"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
