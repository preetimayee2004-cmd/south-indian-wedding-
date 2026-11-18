import { useLayoutEffect, useRef } from "react";
import type { FamilySide } from "@/config/types";
import { gsap } from "@/lib/gsap";
import { SCRUB } from "@/lib/smooth";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

type Key = "bride" | "groom";

/** A golden lotus plant (inline SVG) that grows out of the card's border. */
function Lotus({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 220" className={`h-full w-full ${flip ? "-scale-x-100" : ""}`} aria-hidden>
      <defs>
        <linearGradient id="lotus-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe6a3" />
          <stop offset="0.55" stopColor="#e2b453" />
          <stop offset="1" stopColor="#a7752b" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#lotus-gold)" strokeWidth="3" strokeLinecap="round">
        <path d="M60 220 C58 170 66 130 60 92" />
        <path d="M60 180 C40 168 26 150 22 128" />
        <path d="M61 150 C80 140 92 124 96 104" />
      </g>
      <g fill="url(#lotus-gold)">
        <path d="M22 128c-14-6-20-20-16-34 12 4 20 16 16 34Z" />
        <path d="M96 104c14-4 22-16 20-30-12 2-22 14-20 30Z" />
        {/* the flower */}
        <path d="M60 92c-10-12-12-30 0-50 12 20 10 38 0 50Z" />
        <path d="M58 92c-16-4-28-18-30-36 18 2 30 16 30 36Z" />
        <path d="M62 92c16-4 28-18 30-36-18 2-30 16-30 36Z" />
        <path d="M57 94c-18 2-34-6-42-20 18-4 34 4 42 20Z" opacity=".85" />
        <path d="M63 94c18 2 34-6 42-20-18-4-34 4-42 20Z" opacity=".85" />
      </g>
    </svg>
  );
}

const ROLE: Record<Key, string> = { bride: "the Bride", groom: "the Groom" };

/** One family: its title and each member with their relation to the bride or groom. */
function Side({ side, k }: { side: FamilySide; k: Key }) {
  return (
    <div data-reveal className="text-center">
      <h3 className="text-[0.74rem] font-bold uppercase tracking-[0.32em] text-maroon">{side.title}</h3>
      <ul className="mt-4 space-y-3">
        {side.members.map((m, i) => (
          <li key={m.name}>
            {i > 0 && (
              <span aria-hidden className="mb-2 block font-script text-[1.4rem] leading-none text-gold">
                &amp;
              </span>
            )}
            <p className="font-script text-[clamp(1.7rem,7vw,2.3rem)] leading-tight text-accent">{m.name}</p>
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-ink-soft">
              {m.relation} of {ROLE[k]}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Meet the Bride & Groom Family (as in the reference): the page scrolls
 * normally. The title, the "two families, one bond" line and each family
 * fade up as they come into view, and golden lotus plants grow out of the
 * card's borders with the scroll, then sway gently.
 */
export function FamiliesScene() {
  const { family, couple } = useWedding();
  const reduced = usePrefersReducedMotion();
  const order: Key[] = couple.order === "bride-first" ? ["bride", "groom"] : ["groom", "bride"];
  const sides = order.filter((k) => family?.[k]);
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) =>
        gsap.from(el, { opacity: 0, y: 26, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
      );
      // lotus plants: grow from the border as their foot rises from the screen bottom to a quarter from the top
      gsap.utils.toArray<HTMLElement>("[data-lotus]").forEach((el) =>
        gsap.fromTo(
          el.firstElementChild,
          { yPercent: 94, scale: 0.92 },
          { yPercent: 0, scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "bottom bottom", end: "bottom 25%", scrub: SCRUB } },
        ),
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  if (!sides.length) return null;

  return (
    <section ref={root} id="family" aria-labelledby="family-heading" className="cobalt relative px-[14px] py-16">
      <div className="parchment frieze-border relative mx-auto max-w-[30rem] rounded-[6px] px-5 pb-12 pt-10">
        {/* lotus plants growing out of the lower corners */}
        {[false, true].map((flip) => (
          <div
            key={String(flip)}
            data-lotus
            aria-hidden
            className={`pointer-events-none absolute bottom-0 h-40 w-20 overflow-hidden ${flip ? "-right-1" : "-left-1"}`}
          >
            <div className="h-full w-full origin-bottom">
              <div className="h-full w-full origin-bottom motion-safe:animate-[sway_6s_ease-in-out_infinite]">
                <Lotus flip={flip} />
              </div>
            </div>
          </div>
        ))}

        <div className="relative text-center">
          <p data-reveal className="text-[0.82rem] tracking-[0.3em] text-maroon">
            ॥ परिवार से मिलिए ॥
          </p>
          <h2 id="family-heading" data-reveal className="mt-3 leading-none">
            <span className="block font-script text-[clamp(1.8rem,8vw,2.5rem)] text-accent">Meet the</span>
            <span className="mt-1 block text-[clamp(1.4rem,6.5vw,2rem)] font-bold uppercase tracking-[0.14em] text-maroon">
              Bride &amp; Groom
            </span>
            <span className="mt-1 block text-[0.8rem] font-bold uppercase tracking-[0.5em] text-ink">Family</span>
          </h2>
          <div data-reveal className="mt-5">
            <p className="text-[0.95rem] tracking-[0.12em] text-maroon">दो परिवार · एक बंधन</p>
            <p className="mt-1 font-script text-[1.6rem] leading-none text-accent">Two families, one bond</p>
            <p className="mt-2 text-[0.9rem] italic text-ink">Blessed by our elders, united by love</p>
          </div>
          <span aria-hidden className="mx-auto mt-7 block h-px w-24 bg-gold/70" />

          <div className="relative mt-7 space-y-9">
            {sides.map((k, i) => (
              <div key={k}>
                {i > 0 && <span aria-hidden className="mx-auto mb-9 block h-px w-24 bg-gold/70" />}
                <Side side={family![k] as FamilySide} k={k} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
