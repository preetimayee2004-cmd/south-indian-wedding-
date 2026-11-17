import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useWedding } from "./WeddingContext";

interface GuestState {
  /** Always safe to render: the sanitised guest name, or the fallback. */
  guestName: string;
  /** True when the name came from the URL rather than the fallback. */
  isPersonalized: boolean;
  /** Lets RSVP correct a misspelt name for the rest of the visit. */
  setGuestName: (name: string) => void;
}

const GuestContext = createContext<GuestState | null>(null);

const MAX_LEN = 40;

/** Strip anything that isn't a plausible name character; cap the length. */
export function sanitizeName(raw: string | null | undefined): string {
  if (!raw) return "";
  const cleaned = raw
    .replace(/<[^>]*>?/g, "") // drop tags and their names entirely
    .replace(/[+_]/g, " ")
    .replace(/[^\p{L}\p{M}\s.'&-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_LEN)
    .trim();
  // Title-case only names typed entirely in lower case ("priya raman"),
  // so we never break names like "McDonald" or "D'Souza".
  return cleaned === cleaned.toLowerCase()
    ? cleaned.replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase())
    : cleaned;
}

function readGuestFromUrl(params: string[]): string {
  if (typeof window === "undefined") return "";
  const search = new URLSearchParams(window.location.search);
  for (const key of params) {
    const value = sanitizeName(search.get(key));
    if (value) return value;
  }
  return "";
}

export function GuestProvider({ children }: { children: ReactNode }) {
  const { personalization } = useWedding();
  const [fromUrl] = useState(() => readGuestFromUrl(personalization.queryParams));
  const [override, setOverride] = useState("");

  const value = useMemo<GuestState>(() => {
    const name = override || fromUrl;
    return {
      guestName: name || personalization.fallbackName,
      isPersonalized: Boolean(name),
      setGuestName: (n) => setOverride(sanitizeName(n)),
    };
  }, [fromUrl, override, personalization.fallbackName]);

  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>;
}

export function useGuest(): GuestState {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error("useGuest must be used inside <GuestProvider>");
  return ctx;
}
