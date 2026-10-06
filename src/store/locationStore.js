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
        if ((get().captured && get().address) || typeof navigator === "undefined" || !navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            set({ latitude: lat, longitude: lng });
            try {
              const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`
              );
              const data = await res.json();
              if (data.results?.[0]) {
                const components = data.results[0].address_components;
                const get2 = (type) => components.find((c) => c.types.includes(type))?.long_name || "";
                const city = get2("locality") || get2("administrative_area_level_2");
                const state = get2("administrative_area_level_1");
                const address = city ? `${city}, ${state}` : data.results[0].formatted_address;
                set({ address, captured: true });
              }
            } catch {}
          },
          () => { set({ captured: true }); },
          { enableHighAccuracy: true, timeout: 80000 }
        );
      },
    }),
    { name: "poojify-location" }
  )
);
