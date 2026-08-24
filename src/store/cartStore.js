import { create } from "zustand";

export const useCartStore = create(() => ({
  // Cart state is managed via React Query ["cart-list"] cache.
  // These helpers read from the query cache via queryClient passed in.
  clearCart: () => {}, // called on logout — query cache is cleared by authStore
}));
