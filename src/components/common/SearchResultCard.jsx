import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { motion } from "framer-motion";
import { formatINR, discountPercent } from "../../utils/format";

export default function SearchResultCard({ product, index = 0 }) {
  const price = Number(product.discount_price ?? product.price ?? 0);
  const mrp = Number(product.price ?? 0);
  const off = product.discount_percentage ?? discountPercent(mrp, price);
  const link = product.type === "combo" ? `/combo-offers/${product.id}` : `/shop/product/${product.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index, 8) * 0.04 }}
      className="overflow-hidden rounded-2xl bg-cream-50 shadow-card"
    >
      <div className="relative">
        <span className="absolute left-3 top-3 z-10 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
          Products
        </span>
        <img src={product.image} alt={product.name} className="h-40 w-full object-cover" loading="lazy" />
      </div>
      <div className="p-4">
        <p className="mb-2 line-clamp-2 font-semibold text-ink-900">{product.name}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary-600">{formatINR(price)}</span>
          {mrp > price && (
            <span className="text-sm text-ink-500 line-through">{formatINR(mrp)}</span>
          )}
        </div>
        {off > 0 && <p className="mt-1 text-sm font-semibold text-success">You save {off}%</p>}
        <Link
          to={link}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Eye size={15} /> View
        </Link>
      </div>
    </motion.div>
  );
}
