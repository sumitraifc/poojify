import { create } from "zustand";
import { persist } from "zustand/middleware";

function applyThemeClass(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light", // "light" | "dark"

      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        applyThemeClass(next);
        set({ theme: next });
      },

      setTheme: (theme) => {
        applyThemeClass(theme);
        set({ theme });
      },
    }),
    {
      name: "poojify-theme",
      onRehydrateStorage: () => (state) => {
        // Apply the persisted theme to <html> as soon as it's loaded from storage
        if (state) applyThemeClass(state.theme);
      },
    }
  )
);
