import { Link } from "react-router-dom";
import { Heart, Plus, Minus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWishlistStore } from "../../store/wishlistStore";
import { updateCart } from "../../api/cartApi";
import { formatINR, discountPercent } from "../../utils/format";
import { cn } from "../../utils/cn";
import { useAuthStore } from "../../store/authStore";

export default function ProductCard({ product, index = 0 }) {
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);
  const off = discountPercent(product.mrp, product.price);
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Read qty from cached cart-list API data
  const cartData = queryClient.getQueryData(["cart-list"]);
  const cartItems = Array.isArray(cartData?.data) ? cartData.data : Array.isArray(cartData) ? cartData : [];
  const cartItem = cartItems.find((i) => i.item_id === product.id);
  const qty = Number(cartItem?.quantity ?? 0);

  const { mutate: cartAction } = useMutation({
    mutationFn: ({ action }) => updateCart(product.id, product.type ?? "product", action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart-list"] }),
  });

  function handleCartAction(action) {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent("poojify:require-login"));
      return;
    }
    cartAction({ action });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index, 6) * 0.05, duration: 0.4 }}
      className="group relative flex flex-col rounded-3xl bg-cream-50 p-2 sm:p-2.5 shadow-card transition-shadow hover:shadow-cardHover"
    >
      {/* Image */}
      <div className="relative rounded-2xl overflow-hidden">
        <Link to={`/shop/product/${product.id}`} className="block">
          <img
            src={product.image}
            alt={product.name}
            className="h-[9rem] w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-44"
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
      </div>

      {/* Info + stepper row */}
      <div className="mt-2 min-w-0 px-1.5 pb-1 sm:mt-3">
        <div className="flex items-start justify-between gap-1 sm:gap-2">
          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-1">
              <span className="text-sm font-bold text-success sm:text-base">{formatINR(product.price)}</span>
              {product.mrp > product.price && (
                <span className="text-[10px] text-ink-500/60 line-through sm:text-xs">{formatINR(product.mrp)}</span>
              )}
            </div>
            {off > 0 && (
              <span className="text-[10px] font-semibold text-primary-600 sm:text-xs">{off}% OFF</span>
            )}
          </div>

          {/* Cart stepper */}
          <div className="shrink-0">
            <AnimatePresence mode="wait" initial={false}>
              {qty === 0 ? (
                <motion.button
                  key="add"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => handleCartAction(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary-200 bg-white text-primary-600 shadow-cardHover transition hover:bg-primary-50"
                  aria-label="Add to cart"
                >
                  <Plus size={18} />
                </motion.button>
              ) : (
                <motion.div
                  key="stepper"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 rounded-xl border border-primary-200 bg-white px-2 py-1.5 shadow-cardHover"
                >
                  <button onClick={() => handleCartAction(-1)} aria-label="Decrease" className="text-danger">
                    {qty === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                  </button>
                  <span className="min-w-[1ch] text-center text-sm font-bold">{qty}</span>
                  <button onClick={() => handleCartAction(1)} aria-label="Increase" className="text-primary-600">
                    <Plus size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <Link
          to={`/shop/product/${product.id}`}
          className="mt-0.5 block overflow-hidden text-[10px] font-semibold uppercase tracking-wide text-ink-900 hover:text-primary-600 sm:mt-1 sm:text-xs w-full px-1.5"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {product.name}
        </Link>
      </div>
    </motion.div>
  );
}
