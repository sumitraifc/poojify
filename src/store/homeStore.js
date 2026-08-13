import { create } from "zustand";

export const useHomeStore = create((set) => ({
  sections: [],
  setSections: (sections) => set({ sections }),
}));
