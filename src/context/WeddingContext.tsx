import { createContext, useContext, type ReactNode } from "react";
import type { WeddingConfig } from "@/config/types";

const WeddingContext = createContext<WeddingConfig | null>(null);

/** Provides the active wedding's config to every section. */
export function WeddingProvider({ config, children }: { config: WeddingConfig; children: ReactNode }) {
  return <WeddingContext.Provider value={config}>{children}</WeddingContext.Provider>;
}

export function useWedding(): WeddingConfig {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error("useWedding must be used inside <WeddingProvider>");
  return ctx;
}
