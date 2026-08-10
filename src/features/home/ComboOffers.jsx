import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SectionHeader from "../../components/common/SectionHeader";
import { comboOffers } from "../../data/products";
import { formatINR } from "../../utils/format";

export default function ComboOffers() {
  const { t } = useTranslation();
  return (
    <section className="section-y pt-0">
      <div className="section">
        <SectionHeader title={t("home.comboOffers")} viewAllLink="/combo-offers" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {comboOffers.map((combo, i) => (
            <motion.div
              key={combo.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="card relative overflow-hidden"
            >
              <span className="absolute left-3 top-3 z-10 badge bg-primary-500 text-white">{combo.off}% OFF</span>
              <img src={combo.image} alt={combo.name} className="h-32 w-full rounded-lg object-cover" loading="lazy" />
              <h3 className="mt-3 text-sm font-semibold">{combo.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-ink-500">{combo.desc}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-bold text-primary-600">{formatINR(combo.price)}</span>
                <span className="text-xs text-ink-500 line-through">{formatINR(combo.mrp)}</span>
              </div>
              <Link to={`/combo-offers/${combo.id}`} className="btn-outline btn-sm mt-3 w-full">
                {t("common.viewDetails")}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
