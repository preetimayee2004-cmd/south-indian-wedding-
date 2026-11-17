import { useGuest } from "@/context/GuestContext";
import { useIsDesktop, useIsTablet, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const SWATCHES = ["accent", "ink", "ink-soft", "ivory", "paper", "gold", "teal", "maroon", "leaf", "line"] as const;
const BG: Record<(typeof SWATCHES)[number], string> = {
  accent: "bg-accent", ink: "bg-ink", "ink-soft": "bg-ink-soft", ivory: "bg-ivory", paper: "bg-paper",
  gold: "bg-gold", teal: "bg-teal", maroon: "bg-maroon", leaf: "bg-leaf", line: "bg-line",
};

/** Dev-only Phase 1 review panel. Shown with ?tokens in the URL; never in production builds. */
export function DevTokens() {
  const { guestName, isPersonalized } = useGuest();
  const tablet = useIsTablet();
  const desktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();
  if (!new URLSearchParams(window.location.search).has("tokens")) return null;

  return (
    <aside className="border-b border-line bg-paper py-10">
      <div className="mx-auto w-full max-w-content px-gutter">
        <p className="eyebrow">Phase 1 · design tokens</p>
        <h1 className="script-heading mt-2 text-script-lg">Meenakshi &amp; Karthik</h1>
        <p className="mt-3 max-w-prose">
          Body text in EB Garamond. Headings and names in Great Vibes, always in the accent colour.
          <em> Italic for quiet emphasis.</em>
        </p>
        <ul className="mt-6 grid grid-cols-5 gap-3 md:grid-cols-10">
          {SWATCHES.map((s) => (
            <li key={s} className="text-center text-xs text-ink-soft">
              <span className={`mb-1 block aspect-square rounded-full border border-line ${BG[s]}`} />
              {s}
            </li>
          ))}
        </ul>
        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-ink-soft">Guest</dt>
          <dd>{guestName} {isPersonalized ? "(from URL)" : "(fallback)"}</dd>
          <dt className="text-ink-soft">Layout</dt>
          <dd>{desktop ? "desktop ≥1024" : tablet ? "tablet ≥768" : "mobile <768"}</dd>
          <dt className="text-ink-soft">Reduced motion</dt>
          <dd>{reduced ? "on" : "off"}</dd>
        </dl>
      </div>
    </aside>
  );
}
