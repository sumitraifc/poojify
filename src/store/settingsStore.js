import { create } from "zustand";
import { fetchSettings } from "../api/settingsApi";

export const useSettingsStore = create((set, get) => ({
  content: [],
  customerService: [],
  appInfo: null,
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    try {
      const res = await fetchSettings();
      const { content, customer_service, app_info } = res.data;
      set({ content, customerService: customer_service, appInfo: app_info, loaded: true });
    } catch {
      // silently fail — pages fall back to static content
    }
  },

  getContent: (type) => {
    const item = get().content.find((c) => c.type.trim() === type);
    return item?.content ?? null;
  },
}));
