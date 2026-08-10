import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { formatINR, discountPercent } from "../../utils/format";
import { cn } from "../../utils/cn";

export default function ProductCard({ product, index = 0 }) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);
  const off = discountPercent(product.mrp, product.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index, 6) * 0.05, duration: 0.4 }}
      className="card group relative flex flex-col"
    >
      {off > 0 && <span className="absolute left-3 top-3 z-10 badge bg-primary-500 text-white">{off}% OFF</span>}

      <button
        onClick={() => toggle(product)}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-card"
        aria-label="Toggle wishlist"
      >
        <Heart size={15} className={cn(wishlisted ? "fill-danger text-danger" : "text-ink-500")} />
      </button>

      <Link to={`/shop/product/${product.id}`} className="block overflow-hidden rounded-lg">
        <img
          src={product.image}
          alt={product.name}
          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-44"
          loading="lazy"
        />
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <Link to={`/shop/product/${product.id}`} className="line-clamp-2 text-sm font-semibold text-ink-900 hover:text-primary-600">
          {product.name}
        </Link>

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-base font-bold text-primary-600">{formatINR(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-ink-500 line-through">{formatINR(product.mrp)}</span>
          )}
        </div>

        <button
          onClick={() => addItem(product, 1)}
          className="btn-outline btn-sm mt-3 w-full"
        >
          <ShoppingCart size={14} /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
