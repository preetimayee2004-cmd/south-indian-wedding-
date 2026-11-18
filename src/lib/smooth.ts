import { ScrollTrigger } from "./gsap";

/*
 * Scrolling feel (matches the reference invitation):
 *  - the page always scrolls natively — no smooth-scroll library — so it
 *    never lags or "floats" behind the finger;
 *  - phones/touch: scene layers follow the scroll in the same frame (no easing);
 *  - mouse/trackpad: layers ease in with a very short, light smoothing.
 */
const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

/** ScrollTrigger scrub for every scene: instant on touch screens, ~0.25 s on desktop. */
export const SCRUB: boolean | number = touch ? true : 0.25;

/** Pause/resume page scrolling (e.g. while the intro overlay is up). */
export function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

/**
 * Scroll to an element or y position with a gentle ease-in-out, driven by
 * requestAnimationFrame. Any touch, wheel, key or click stops it at once, so
 * the guest stays in control. `speed` = px per second (sets the duration).
 */
export function scrollToTarget(target: string | number | HTMLElement, opts: { speed?: number; min?: number; max?: number } = {}) {
  const { speed = 900, min = 600, max = 2400 } = opts;
  const resolve = () => {
    if (typeof target === "number") return target;
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    return el ? el.getBoundingClientRect().top + window.scrollY : window.scrollY;
  };
  const from = window.scrollY;
  const dist = Math.abs(resolve() - from);
  if (dist < 2) return () => {};
  const dur = Math.min(max, Math.max(min, (dist / speed) * 1000));
  const t0 = performance.now();
  let raf = 0;
  let stopped = false;
  const EV = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
  const cancel = () => {
    stopped = true;
    cancelAnimationFrame(raf);
    EV.forEach((e) => window.removeEventListener(e, cancel));
  };
  EV.forEach((e) => window.addEventListener(e, cancel, { passive: true }));
  const step = (now: number) => {
    if (stopped) return;
    const k = Math.min(1, (now - t0) / dur);
    window.scrollTo(0, from + (resolve() - from) * easeInOut(k)); // re-read: layout may still be settling
    if (k < 1) raf = requestAnimationFrame(step);
    else cancel();
  };
  raf = requestAnimationFrame(step);
  return cancel;
}

/**
 * After the opening hands over: wait 3 s, then glide slowly down through the
 * hero to the invitation (`selector`). Stops the moment the guest touches,
 * scrolls, clicks or presses a key — and never runs if they already have.
 */
export function autoScrollAfterIntro(selector: string, delay = 3000) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  let cancelRun = () => {};
  let interacted = false;
  const EV = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
  const mark = () => (interacted = true);
  EV.forEach((e) => window.addEventListener(e, mark, { passive: true, once: true }));
  const timer = window.setTimeout(() => {
    EV.forEach((e) => window.removeEventListener(e, mark));
    if (interacted || window.scrollY > 40) return;
    ScrollTrigger.refresh();
    cancelRun = scrollToTarget(selector, { speed: 110, min: 6000, max: 16000 });
  }, delay);
  return () => {
    window.clearTimeout(timer);
    EV.forEach((e) => window.removeEventListener(e, mark));
    cancelRun();
  };
}
