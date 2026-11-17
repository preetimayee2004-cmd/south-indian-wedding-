import { useLayoutEffect, type ReactNode } from "react";
import type { ThemeTokens } from "@/config/types";
import { useWedding } from "./WeddingContext";

function hexToTriplet(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

const COLOR_VARS: [keyof ThemeTokens, string][] = [
  ["accent", "--c-accent"],
  ["ink", "--c-ink"],
  ["inkSoft", "--c-ink-soft"],
  ["ivory", "--c-ivory"],
  ["paper", "--c-paper"],
  ["gold", "--c-gold"],
  ["teal", "--c-teal"],
  ["maroon", "--c-maroon"],
  ["leaf", "--c-leaf"],
  ["line", "--c-line"],
];

/** Pushes the wedding's theme tokens into CSS variables used by Tailwind. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, meta } = useWedding();

  useLayoutEffect(() => {
    const root = document.documentElement.style;
    for (const [key, cssVar] of COLOR_VARS) root.setProperty(cssVar, hexToTriplet(theme[key]));
    root.setProperty("--font-script", theme.fontScript);
    root.setProperty("--font-body", theme.fontBody);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.ivory);
    document.title = meta.title;
  }, [theme, meta.title]);

  return <>{children}</>;
}
