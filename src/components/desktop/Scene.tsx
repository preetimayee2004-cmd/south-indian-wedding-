import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import type { DesktopArt } from "@/config/types";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

interface SceneProps {
  id?: string;
  labelledBy?: string;
  /** Full-bleed artwork. Omit for a plain parchment scene. */
  art?: DesktopArt;
  /** Dissolve into the scene above instead of meeting it at a hard edge. */
  overlap?: boolean;
  /** Soft wash over the art so text/cards read cleanly. */
  veil?: "none" | "light" | "center" | "soft";
  className?: string;
  children: ReactNode;
}

const OVERLAP = "18vh";

/**
 * One full-screen scene of the desktop journey. Every scene behaves the same:
 * the art fills the screen and drifts slowly (camera parallax), the scene
 * dissolves over the previous one, and its [data-reveal] content rises in.
 * Consistency is the point — the journey should feel like one continuous film.
 */
export function Scene({ id, labelledBy, art, overlap = true, veil = "none", className = "", children }: SceneProps) {
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      if (img.current) {
        // Frame the chosen part of the art, then drift ±6% of the screen.
        const travel = () => Math.max(0, img.current!.offsetHeight - el.offsetHeight);
        const base = () => -travel() * (art?.focus ?? 0.5);
        const drift = () => Math.min(window.innerHeight * 0.06, travel() / 2);
        if (reduced) gsap.set(img.current, { y: base });
        else
          gsap.fromTo(
            img.current,
            { y: () => Math.min(0, base() + drift()) },
            {
              y: () => Math.max(-travel(), base() - drift()),
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
            },
          );
      }
      if (!reduced) {
        const items = el.querySelectorAll("[data-reveal]");
        if (items.length)
          gsap.from(items, {
            autoAlpha: 0,
            y: 34,
            duration: 1.1,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: el, start: "top 62%", once: true },
          });
      }
    }, el);
    return () => ctx.revert();
  }, [reduced, art?.focus]);

  return (
    <section
      ref={root}
      id={id}
      aria-labelledby={labelledBy}
      className={`relative isolate min-h-[100svh] ${className}`}
      style={
        overlap
          ? {
              marginTop: `-${OVERLAP}`,
              maskImage: `linear-gradient(to bottom, transparent 0, #000 ${OVERLAP})`,
              WebkitMaskImage: `linear-gradient(to bottom, transparent 0, #000 ${OVERLAP})`,
            }
          : undefined
      }
    >
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden bg-ivory">
        {art ? (
          <img
            ref={img}
            src={art.src}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute left-0 top-0 w-full object-cover"
            style={{ aspectRatio: String(art.ratio), minHeight: "112%" }}
            draggable={false}
          />
        ) : (
          // Plain parchment: warm paper with a faint dotted kolam grid.
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, rgb(255 252 244 / 0.9), transparent 70%), radial-gradient(rgb(184 138 62 / 0.12) 1.2px, transparent 1.3px) 0 0 / 28px 28px, linear-gradient(#f7f2eb, #f1e7d6)",
            }}
          />
        )}
        {veil === "light" && <div className="absolute inset-0 bg-ivory/45" />}
        {veil === "soft" && (
          <div className="absolute inset-0" style={{ background: "linear-gradient(rgb(var(--c-ivory) / 0.35), rgb(var(--c-ivory) / 0.35)), radial-gradient(ellipse 70% 75% at 50% 50%, rgb(var(--c-ivory) / 0.75), transparent 80%)" }} />
        )}
        {veil === "center" && (
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 60% at 50% 50%, rgb(var(--c-ivory) / 0.85), transparent 75%)" }} />
        )}
      </div>

      <div className="relative flex min-h-[100svh] items-center justify-center px-[6vw] py-[14vh]">{children}</div>
    </section>
  );
}

/** The one frame used across the journey: parchment with a double gold hairline. */
export function SceneCard({ children, className = "", wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
  return (
    <div
      data-reveal
      className={`relative mx-auto w-full rounded-[30px] border border-gold/50 bg-paper/95 p-[6px] shadow-[0_40px_90px_-35px_rgb(42_36_33/0.5)] ${
        wide ? "max-w-[64rem]" : "max-w-[46rem]"
      } ${className}`}
    >
      <div className="rounded-[24px] border border-gold/30 px-[clamp(2rem,4vw,4rem)] py-[clamp(2rem,5vh,3.5rem)]">{children}</div>
    </div>
  );
}
