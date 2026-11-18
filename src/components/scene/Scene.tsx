import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SCRUB } from "@/lib/smooth";

export type Enter = "flow" | "cover" | "lift";

/**
 * How the section after this one arrives (read from its SectionBoundary):
 * "cover" rises over this stuck scene, so this scene holds one extra screen
 * at the end while it is being covered.
 */
function nextEnter(el: HTMLElement): Enter {
  let next = el.closest(".sec")?.nextElementSibling as HTMLElement | null;
  while (next && next.classList.contains("sec") && !next.querySelector("section")) next = next.nextElementSibling as HTMLElement | null;
  return (next?.dataset.enter as Enter) ?? "flow";
}

export type Build = (tl: gsap.core.Timeline, el: HTMLElement) => void;

interface SceneProps {
  id?: string;
  labelledBy?: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
  /** Decoration that leads in (hangs above the scene's top edge), e.g. a soft fade into the sky. */
  edgeTop?: ReactNode;
  /** Decoration that trails (hangs below the bottom edge) — shown when this scene lifts away. */
  edgeBottom?: ReactNode;
  /**
   * Builds the one scrubbed timeline. Time is measured in screens of scroll:
   * a tween of duration 1 plays over 100svh of scrolling.
   */
  build: Build;
  /** Rebuild when these change (e.g. a gallery filter). */
  deps?: unknown[];
  /** Screens held at the end while the next section covers this one (default: read from the next section). */
  tail?: number;
  /** Scroll smoothing in seconds (default: lib/smooth SCRUB). */
  scrub?: number | boolean;
  children: ReactNode;
}

/** Re-render when the screen width really changes (rotation, window resize) — not on phone address-bar height changes. */
function useWidth() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    let t = 0;
    const on = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setW((prev) => (window.innerWidth !== prev ? window.innerWidth : prev)), 150);
    };
    window.addEventListener("resize", on);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", on);
    };
  }, []);
  return w;
}

/**
 * A full-screen scene on a CSS sticky "track": the section is as tall as the
 * scene's scroll length, and its 100svh stage sticks to the top while the
 * page scrolls natively through it. The one timeline is scrubbed by that
 * scroll — in the same frame on touch screens, lightly smoothed with a mouse
 * (lib/smooth SCRUB). Length = the timeline's length (+1 screen when the next
 * section covers it). Layers inside mark themselves with data-layer so they
 * get will-change only while the scene is on screen.
 */
export function Scene({ id, labelledBy, label, className = "", style, edgeTop, edgeBottom, build, deps = [], tail, scrub = SCRUB, children }: SceneProps) {
  const root = useRef<HTMLElement>(null);
  const width = useWidth();

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      build(tl, el);
      const hold = tail ?? (nextEnter(el) === "cover" ? 1 : 0);
      if (hold) tl.to({}, { duration: hold });
      const len = Math.max(tl.duration(), 0.01);
      el.style.height = `${((1 + len) * 100).toFixed(2)}svh`; // the track: one screen + the scene's scroll length
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub,
        animation: tl,
        invalidateOnRefresh: true,
      });
      // will-change only around the time the scene is on screen
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        toggleClass: { targets: el, className: "is-live" },
      });
    }, el);
    return () => {
      ctx.revert();
      el.style.height = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, width]);

  return (
    <section ref={root} id={id} aria-labelledby={labelledBy} aria-label={label} className="scene relative h-[100svh]">
      {edgeTop}
      <div className={`sticky top-0 h-[100svh] overflow-hidden ${className}`} style={style}>
        {children}
      </div>
      {edgeBottom}
    </section>
  );
}

/**
 * Moves a tall column up through its window so everything is seen while the
 * scene is pinned. Returns the distance in screens (0 if it already fits).
 */
export function overflowScreens(content: HTMLElement, box: HTMLElement) {
  return Math.max(0, content.scrollHeight - box.clientHeight) / window.innerHeight;
}
