import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
// Mobile address-bar show/hide resizes the viewport; don't re-layout on that.
ScrollTrigger.config({ ignoreMobileResize: true });

let timer = 0;
/** Re-measure every pin and trigger once things settle (debounced). */
export function refreshSoon(delay = 200) {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => ScrollTrigger.refresh(), delay);
}

/*
 * Content that changes height after load (wishes arriving, a filter, web fonts,
 * images) moves everything below it. Re-measure once things settle, but only
 * when the page height really changed (avoids refresh loops). Also on a real
 * resize / rotation (width change), and every time an image finishes loading.
 */
if (typeof window !== "undefined") {
  let lastHeight = 0;
  let lastWidth = window.innerWidth;
  const onHeight = () => {
    const h = document.documentElement.scrollHeight;
    if (Math.abs(h - lastHeight) > 2) {
      lastHeight = h;
      refreshSoon(250);
    }
  };
  new ResizeObserver(onHeight).observe(document.body);
  document.fonts?.ready.then(() => refreshSoon());
  window.addEventListener("load", () => refreshSoon(50));
  window.addEventListener("resize", () => {
    if (window.innerWidth !== lastWidth) {
      lastWidth = window.innerWidth;
      refreshSoon(150);
    }
  });
  window.addEventListener("orientationchange", () => refreshSoon(300));
  // any <img> finishing later (lazy art, guest photos)
  document.addEventListener("load", (e) => e.target instanceof HTMLImageElement && refreshSoon(300), true);
}

export { gsap, ScrollTrigger, MotionPathPlugin };
