/**
 * Keeps one-line text (names in script, the guest's greeting…) inside its box,
 * whatever names or details are put in the config: any element marked
 * `data-fit` gets its font size reduced just enough to fit the width of its
 * parent — or of the nearest ancestor matching `data-fit="<selector>"` —
 * instead of being cut off. Nothing changes when the text already fits.
 * Re-checked on load, when the web fonts arrive, on resize and when the page's
 * content changes. Widths are layout widths (offsetWidth/clientWidth), so an
 * animation that is scaling something at that moment never misleads it.
 */
const MIN_SCALE = 0.45;

function fitOne(el: HTMLElement) {
  el.style.fontSize = "";
  const container = (el.dataset.fit ? el.parentElement?.closest<HTMLElement>(el.dataset.fit) : el.parentElement) ?? el.parentElement;
  if (!container) return;
  const cs = getComputedStyle(container);
  const avail = container.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const need = Math.max(el.scrollWidth, el.offsetWidth);
  if (avail <= 0 || need <= avail + 1) return;
  const base = parseFloat(getComputedStyle(el).fontSize);
  let size = base;
  // a few passes: script swashes and percentage paddings don't always scale exactly
  for (let pass = 0; pass < 3; pass++) {
    const now = Math.max(el.scrollWidth, el.offsetWidth);
    if (now <= avail + 1) break;
    size = Math.max(base * MIN_SCALE, size * (avail / now) * 0.98);
    el.style.fontSize = `${size.toFixed(2)}px`;
    if (size <= base * MIN_SCALE) break;
  }
}

export function fitAll(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-fit]").forEach(fitOne);
}

/** Starts watching the page; returns a function that stops it. */
export function watchFit(): () => void {
  let t = 0;
  const soon = () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => fitAll(), 120);
  };
  soon();
  document.fonts?.ready.then(soon).catch(() => undefined);
  window.addEventListener("resize", soon);
  const mo = new MutationObserver((list) => {
    // only real content changes (not our own font sizes, and not the ticking countdown)
    const real = list.some((m) => {
      const node = m.target instanceof Element ? m.target : m.target.parentElement;
      return (m.type === "childList" || m.type === "characterData") && !node?.closest('[role="timer"]');
    });
    if (real) soon();
  });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  return () => {
    window.clearTimeout(t);
    window.removeEventListener("resize", soon);
    mo.disconnect();
  };
}
