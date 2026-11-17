import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Breakpoints mirror tailwind.config.ts `screens`. */
export const BP = {
  tablet: "(min-width: 768px)",
  desktop: "(min-width: 1024px)",
} as const;

export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const useIsTablet = () => useMediaQuery(BP.tablet);
export const useIsDesktop = () => useMediaQuery(BP.desktop);
