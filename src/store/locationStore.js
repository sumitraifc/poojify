import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useLocationStore = create(
  persist(
    (set, get) => ({
      latitude: null,
      longitude: null,
      address: null, // human-readable label, e.g. "Indiranagar, Lucknow, UP"
      captured: false, // becomes true after we've asked once (granted or denied)

      setCoords: (lat, lng) => set({ latitude: lat, longitude: lng }),
      setAddress: (address) => set({ address }),

      /** Ask the browser for location once. Safe to call on every app load —
       * it no-ops if we've already asked (captured === true), so the user
       * is only ever prompted the very first time they open the app. */
      captureOnce: () => {
        if (get().captured || typeof navigator === "undefined" || !navigator.geolocation) return;
        set({ captured: true }); // mark immediately so we never re-prompt, even if denied
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            set({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          },
          () => {
            // Permission denied or unavailable — captured stays true, we just won't have coords
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      },
    }),
    { name: "poojify-location" }
  )
);
