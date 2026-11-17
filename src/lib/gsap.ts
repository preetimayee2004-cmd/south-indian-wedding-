import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
// Mobile address-bar show/hide resizes the viewport; don't re-layout on that.
ScrollTrigger.config({ ignoreMobileResize: true });

/*
 * Content that changes height after load (wishes arriving, a filter, web fonts)
 * moves everything below it. Re-measure scroll positions once things settle,
 * but only when the page height really changed (avoids refresh loops).
 */
if (typeof window !== "undefined") {
  let lastHeight = 0;
  let timer = 0;
  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastHeight) > 2) {
        lastHeight = h;
        ScrollTrigger.refresh();
      }
    }, 250);
  };
  new ResizeObserver(schedule).observe(document.body);
  document.fonts?.ready.then(schedule);
}

export { gsap, ScrollTrigger };
