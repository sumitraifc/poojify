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
      const raw = res?.data?.data ?? res?.data;
      const { content, customer_service, app_info } = raw;
      const cleanContent = (content ?? []).map((c) => ({ ...c, type: c.type?.trim() ?? "" }));
      set({ content: cleanContent, customerService: customer_service ?? [], appInfo: app_info ?? null, loaded: true });
    } catch {
      // silently fail — pages fall back to static content
    }
  },

  getContent: (type) => {
    const item = get().content.find((c) => c.type.trim() === type);
    return item?.content ?? null;
  },
}));
