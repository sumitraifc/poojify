import { create } from "zustand";

export const useHomeStore = create((set) => ({
  sections: [],
  categories: [],
  setSections: (sections) => set({ sections }),
  setCategories: (categories) => set({ categories }),
}));
