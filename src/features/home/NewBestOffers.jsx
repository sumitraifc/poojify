import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import SectionHeader from "../../components/common/SectionHeader";

const listClass = "flex gap-4 overflow-x-auto pb-2 scrollbar-hide";
const gridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2";

export default function NewBestOffers({ data }) {
  const items = data?.items || [];
  const title = data?.title || "Best Offers";
  const viewType = data?.view_type || "grid";

  if (!items.length) return null;

  return (
    <section className="section-y pt-0">
      <div className="section">
        <SectionHeader title={title} viewAllLink="/combo-offers" viewAllLabel="See All" />
        <div className={viewType === "grid" ? gridClass : listClass}>
          {items.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`relative overflow-hidden rounded-2xl ${
                viewType === "list" ? "w-72 shrink-0" : "w-auto"
              }`}
            >
              <img src={b.image} alt={b.name} className="h-40 w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
                <Flame size={12} /> Best Offer
              </span>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-xl font-bold line-clamp-1">{b.name}</p>
              </div>
              <Link to={b.link || `/shop?category=${b.category_id}`} className="absolute inset-0" aria-label={b.name} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
