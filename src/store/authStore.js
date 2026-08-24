import { create } from "zustand";
import { persist } from "zustand/middleware";

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
        _queryClient?.removeQueries({ queryKey: ["cart-list"] });
        _queryClient?.clear();
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (partial) =>
        set((state) => ({ user: { ...state.user, ...partial } })),
    }),
    { name: "poojify-auth" }
  )
);
