import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { categories } from "../../data/products";

export default function CategoryGrid() {
  const { t } = useTranslation();
  return (
    <section className="section-y pt-0">
      <div className="section">
        <h2 className="mb-6 text-center text-xl font-bold sm:text-2xl">{t("home.topCategories")}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={`/shop?category=${cat.id}`}
                className="flex w-24 shrink-0 flex-col items-center gap-2 sm:w-auto"
              >
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-ink-500/10 bg-white shadow-card transition-transform hover:scale-105">
                  <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <span className="text-center text-xs font-medium text-ink-700">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
