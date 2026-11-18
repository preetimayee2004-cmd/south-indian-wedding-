import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

/*
 * Lenis smooth scrolling, driven by GSAP's ticker so every ScrollTrigger
 * (pins, scrubbed timelines) updates in the same frame as the scroll.
 * Off for prefers-reduced-motion: native scrolling, no smoothing.
 */
let lenis: Lenis | null = null;
const tick = (time: number) => lenis?.raf(time * 1000);

export function startSmoothScroll() {
  if (lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
}

export function stopSmoothScroll() {
  if (!lenis) return;
  gsap.ticker.remove(tick);
  lenis.destroy();
  lenis = null;
}

/** Pause/resume scrolling (e.g. while the intro overlay is up). */
export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

/** Smooth-scroll to an element or y position (falls back to native). */
export function scrollToTarget(target: string | number | HTMLElement) {
  if (lenis) return lenis.scrollTo(target as never, { duration: 1.6 });
  if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
  else (typeof target === "string" ? document.querySelector(target) : target)?.scrollIntoView({ behavior: "smooth" });
}
