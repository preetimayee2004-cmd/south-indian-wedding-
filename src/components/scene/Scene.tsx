import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type Enter = "flow" | "cover" | "lift";

/**
 * How the section after this one arrives (read from its SectionBoundary):
 * "cover" rises over this pinned scene, so this scene holds one extra screen
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
  /** Decoration that leads in (hangs above the scene's top edge), e.g. a scalloped parchment hem. */
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
  children: ReactNode;
}

/**
 * A full-screen (100svh) scene, pinned while its timeline scrubs (scrub: 1).
 * Pin length = the timeline's length (+1 screen when the next section
 * covers it). Layers inside mark themselves with data-layer so they get
 * will-change only while the scene is live.
 */
export function Scene({ id, labelledBy, label, className = "", style, edgeTop, edgeBottom, build, deps = [], tail, children }: SceneProps) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      build(tl, el);
      const hold = tail ?? (nextEnter(el) === "cover" ? 1 : 0);
      if (hold) tl.to({}, { duration: hold });
      const len = Math.max(tl.duration(), 0.01);
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${Math.round(len * window.innerHeight)}`,
        pin: true,
        scrub: 1,
        animation: tl,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
      // will-change only around the time the scene is on screen
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: () => `+=${Math.round((len + 2) * window.innerHeight)}`,
        toggleClass: { targets: el, className: "is-live" },
      });
    }, el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return (
    <section ref={root} id={id} aria-labelledby={labelledBy} aria-label={label} className={`scene relative h-[100svh] ${className}`} style={style}>
      {edgeTop}
      <div className="absolute inset-0 overflow-hidden">{children}</div>
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
