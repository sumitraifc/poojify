import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SectionHeader from "../../components/common/SectionHeader";
import { formatINR } from "../../utils/format";

const listClass = "flex gap-4 overflow-x-auto pb-2 scrollbar-hide";
const gridClass = "grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4";

export default function ComboOffers({ data }) {
  const items = data?.items || [];
  const title = data?.title || "Combo Offers";
  const viewType = data?.view_type || "grid";

  if (!items.length) return null;

  return (
    <section className="section-y pt-0">
      <div className="section">
        <SectionHeader title={title} viewAllLink="/combo-offers" />
        <div className={viewType === "grid" ? gridClass : listClass}>
          {items.map((combo, i) => (
            <motion.div
              key={combo.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`card relative overflow-hidden ${
                viewType === "list" ? "w-48 shrink-0" : "w-auto"
              }`}
            >
              {combo.discount_percentage > 0 && (
                <span className="absolute left-3 top-3 z-10 badge bg-primary-500 text-white">
                  {combo.discount_percentage}% OFF
                </span>
              )}
              <img src={combo.image} alt={combo.name} className="h-auto w-full rounded-lg object-contain" loading="lazy" />
              <h3 className="mt-3 text-sm font-semibold line-clamp-2">{combo.name}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-bold text-primary-600">{formatINR(combo.discount_price ?? combo.price)}</span>
                {combo.price && combo.discount_price && (
                  <span className="text-xs text-ink-500 line-through">{formatINR(combo.price)}</span>
                )}
              </div>
              <Link to={`/combo-offers/${combo.id}`} className="btn-outline btn-sm mt-3 w-full">
                View Details
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
