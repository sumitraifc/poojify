import { Link } from "react-router-dom";
import { Heart, Plus, Minus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWishlistStore } from "../../store/wishlistStore";
import { updateCart } from "../../api/cartApi";
import { formatINR, discountPercent } from "../../utils/format";
import { cn } from "../../utils/cn";

/**
 * Mobile-app style product card: rounded floating image, heart button
 * overlapping the top-right corner, and a floating quantity control that
 * overlaps the bottom-right corner of the image.
 *
 * Before adding: shows a single "+" button.
 * After adding: morphs into a capsule — [trash] qty [+] — matching the
 * reference screenshot, so the same floating control both adds and
 * manages quantity instead of just being a static plus icon.
 */
export default function ProductCard({ product, index = 0 }) {
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);
  const off = discountPercent(product.mrp, product.price);
  const queryClient = useQueryClient();

  // Read qty from cached cart-list API data
  const cartData = queryClient.getQueryData(["cart-list"]);
  const cartItems = Array.isArray(cartData?.data) ? cartData.data : Array.isArray(cartData) ? cartData : [];
  const cartItem = cartItems.find((i) => i.item_id === product.id);
  const qty = Number(cartItem?.quantity ?? 0);

  const { mutate: cartAction } = useMutation({
    mutationFn: ({ action }) => updateCart(product.id, product.type ?? "product", action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart-list"] }),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index, 6) * 0.05, duration: 0.4 }}
      className="group relative mb-3 flex flex-col rounded-3xl bg-cream-50 p-2.5 shadow-card transition-shadow hover:shadow-cardHover"
    >
      <div className="relative overflow-hidden rounded-2xl">
        <Link to={`/shop/product/${product.id}`} className="block">
          <img
            src={product.image}
            alt={product.name}
            className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-44"
            loading="lazy"
          />
        </Link>

        <button
          onClick={() => toggle(product, product.type || "product")}
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-card backdrop-blur"
          aria-label="Toggle wishlist"
        >
          <Heart size={16} className={cn(wishlisted ? "fill-danger text-danger" : "text-ink-700")} />
        </button>

        {/* Floating add / quantity control — overlaps the bottom-right image corner */}
        <div className="absolute -bottom-3 right-3">
          <AnimatePresence mode="wait" initial={false}>
            {qty === 0 ? (
              <motion.button
                key="add"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => cartAction({ action: 1 })}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary-200 bg-white text-primary-600 shadow-cardHover transition hover:bg-primary-50"
                aria-label="Add to cart"
              >
                <Plus size={20} />
              </motion.button>
            ) : (
              <motion.div
                key="stepper"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5 rounded-2xl border border-primary-200 bg-white px-3 py-2.5 shadow-cardHover z-50"
              >
                <button
                  onClick={() => cartAction({ action: -1 })}
                  aria-label="Decrease quantity"
                  className="text-danger"
                >
                  {qty === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                </button>
                <span className="min-w-[1ch] text-center text-sm font-bold">{qty}</span>
                <button onClick={() => cartAction({ action: 1 })} aria-label="Increase quantity" className="text-primary-600">
                  <Plus size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 px-1.5 pb-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-bold text-success">{formatINR(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-sm text-ink-500/60 line-through">{formatINR(product.mrp)}</span>
          )}
        </div>

        {off > 0 && (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs font-semibold text-primary-600">{off}% OFF</span>
            <span className="h-0 flex-1 border-t border-dashed border-primary-300" />
          </div>
        )}

        <Link
          to={`/shop/product/${product.id}`}
          className="mt-1.5 block line-clamp-2 text-sm font-semibold uppercase tracking-wide text-ink-900 hover:text-primary-600"
        >
          {product.name}
        </Link>
      </div>
    </motion.div>
  );
}
