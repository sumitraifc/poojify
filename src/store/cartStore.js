import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { id, name, image, price, mrp, qty, deliveryEstimate }

      addItem: (product, qty = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, qty: i.qty + qty } : i
            ),
          });
        } else {
          set({ items: [...items, { ...product, qty }] });
        }
        toast.success(`${product.name} added to cart`);
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
        toast("Item removed from cart", { icon: "🗑️" });
      },

      updateQty: (id, qty) => {
        if (qty < 1) return;
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, qty } : i)),
        });
      },

      clearCart: () => set({ items: [] }),

      // Derived helpers
      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      mrpTotal: () => get().items.reduce((sum, i) => sum + (i.mrp || i.price) * i.qty, 0),
      discount: () => get().mrpTotal() - get().subtotal(),
      grandTotal: (deliveryCharge = 0) => get().subtotal() + deliveryCharge,
    }),
    { name: "poojify-cart" }
  )
);
