import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCartStore } from "./cartStore";
import { useWishlistStore } from "./wishlistStore";
import { QueryClient } from "@tanstack/react-query";

let _queryClient = null;
export function setQueryClientRef(qc) { _queryClient = qc; }

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        useCartStore.getState().clearCart();
        useWishlistStore.getState().clearWishlist();
        _queryClient?.clear();
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (partial) =>
        set((state) => ({ user: { ...state.user, ...partial } })),
    }),
    { name: "poojify-auth" }
  )
);
