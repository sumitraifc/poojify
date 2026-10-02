import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroSection({ data }) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  // data is array from API: [{ slides: [{ image, category_id }] }]
  const slides = data?.[0]?.slides?.map((s) => s.image) || [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section className="section-y">
      <div className="section">
        <div className="relative w-full overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait">
            <motion.img
              key={index}
              src={slides[index]}
              alt="Pooja essentials"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full h-auto block cursor-pointer"
              onClick={() => navigate("/shop")}
            />
          </AnimatePresence>

          {slides.length > 1 && (
            <>
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}
