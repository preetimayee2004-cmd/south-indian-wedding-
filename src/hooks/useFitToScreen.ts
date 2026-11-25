import { useLayoutEffect, type RefObject } from "react";

/**
 * Keeps a section exactly one screen tall (like the pinned gallery): when its content is taller
 * than the room inside the section, the content is scaled down (from its centre) until it fits.
 * Re-fits whenever the section or the content changes size.
 */
export function useFitToScreen(outer: RefObject<HTMLElement | null>, inner: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i || typeof ResizeObserver === "undefined") return;
    const fit = () => {
      const cs = getComputedStyle(o);
      const room = o.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const natural = i.offsetHeight; // the layout height: not affected by the scale itself
      const s = natural > room && room > 0 ? room / natural : 1;
      i.style.scale = s < 1 ? s.toFixed(4) : "";
      i.style.setProperty("--fit", s.toFixed(4)); // lets full-width rows inside stay full width
    };
    fit();
    const ro = new ResizeObserver(fit);
    // border-box: a change in padding alone (the kolam bands) also re-fits
    ro.observe(o, { box: "border-box" });
    ro.observe(i, { box: "border-box" });
    return () => ro.disconnect();
  }, [outer, inner]);
}
