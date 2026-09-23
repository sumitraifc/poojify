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

      validateToken: async () => {
        const { token, logout } = useAuthStore.getState();
        if (!token) return;
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "https://root.poojify.in/api"}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.status === 403 || data?.status === 403) logout();
        } catch {}
      },
    }),
    { name: "poojify-auth" }
  )
);
