import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";

const banners = [
  {
    id: "o1",
    title: "Best Offers!",
    subtitle: "upto 50% off on every best deals",
    tag: "Up to 50% OFF",
    image: "/assets/hero/hero-1.jpg",
    link: "/combo-offers",
  },
  {
    id: "o2",
    title: "Best Offers",
    subtitle: "upto 50% off on combo deals",
    tag: "Best Quality · Best Prices",
    image: "/assets/hero/hero-2.jpg",
    link: "/combo-offers",
  },
];

export default function NewBestOffers() {
  return (
    <section className="section-y pt-0">
      <div className="section">
        <SectionHeader title="New Best Offers" viewAllLink="/combo-offers" viewAllLabel="See All" />
        <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible">
          {banners.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative w-80 shrink-0 overflow-hidden rounded-2xl sm:w-auto"
            >
              <img src={b.image} alt={b.title} className="h-40 w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
                <Flame size={12} /> Best Offer
              </span>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-2xl font-bold">{b.title}</p>
                <p className="text-sm">{b.subtitle}</p>
              </div>
              <Link to={b.link} className="absolute inset-0" aria-label={b.title} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
