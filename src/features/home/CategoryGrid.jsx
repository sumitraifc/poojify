import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SectionHeader from "../../components/common/SectionHeader";

// list = hamesha horizontal scroll (mobile + desktop)
// grid = hamesha grid layout
const listClass = "flex gap-4 overflow-x-auto pb-2 scrollbar-hide";
const gridClass = "grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8";

export default function CategoryGrid({ data }) {
  const items = data?.items || [];
  const title = data?.title || "Categories";
  const viewType = data?.view_type || "list";

  if (!items.length) return null;

  return (
    <section className="section-y">
      <div className="section">
        <SectionHeader title={title} viewAllLink="/shop" />
        <div className={viewType === "grid" ? gridClass : listClass}>
          {items.map((cat, i) => (
            <CategoryItem key={cat.id} cat={cat} i={i} viewType={viewType} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryItem({ cat, i, viewType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.04 }}
    >
      <Link
        to={`/shop?category=${cat.id}`}
        className={`flex flex-col items-center gap-2 ${
          viewType === "list" ? "w-20 shrink-0 sm:w-auto" : "w-auto"
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-ink-500/10 bg-white shadow-card transition-transform hover:scale-105 sm:h-20 sm:w-20">
          <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <span className="text-center text-[10px] font-medium text-ink-700 sm:text-xs">{cat.name}</span>
      </Link>
    </motion.div>
  );
}
