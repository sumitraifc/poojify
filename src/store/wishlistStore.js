import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { toggleWishlistApi } from "../api/wishlistApi";
import { useAuthStore } from "./authStore";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) => set({ items }),

      toggle: async (product, type = "product") => {
        const exists = get().items.find((i) => i.id === product.id);
        const isAuth = useAuthStore.getState().isAuthenticated;

        // optimistic update
        if (exists) {
          set({ items: get().items.filter((i) => i.id !== product.id) });
          toast("Removed from wishlist", { icon: "💔" });
        } else {
          set({ items: [...get().items, product] });
          toast.success("Added to wishlist");
        }

        // sync with API if logged in
        if (isAuth) {
          try {
            await toggleWishlistApi(product.id, type, exists ? 0 : 1);
          } catch {
            // revert on failure
            if (exists) {
              set({ items: [...get().items, product] });
            } else {
              set({ items: get().items.filter((i) => i.id !== product.id) });
            }
            toast.error("Failed to update wishlist");
          }
        }
      },

      isWishlisted: (id) => !!get().items.find((i) => i.id === id),
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
    }),
    { name: "poojify-wishlist" }
  )
);
