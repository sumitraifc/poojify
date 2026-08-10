import { useEffect, useState } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// Handy presets matching common breakpoints used across the app
export const useIsMobile = () => useMediaQuery("(max-width: 639px)");
export const useIsTablet = () => useMediaQuery("(max-width: 1023px)");
