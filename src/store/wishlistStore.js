import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const exists = get().items.find((i) => i.id === product.id);
        if (exists) {
          set({ items: get().items.filter((i) => i.id !== product.id) });
          toast("Removed from wishlist", { icon: "💔" });
        } else {
          set({ items: [...get().items, product] });
          toast.success("Added to wishlist");
        }
      },

      isWishlisted: (id) => !!get().items.find((i) => i.id === id),
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
    }),
    { name: "poojify-wishlist" }
  )
);
