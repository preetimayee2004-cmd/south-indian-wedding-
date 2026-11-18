import { gsap } from "./gsap";

/**
 * Sweet pink and red hearts that float up the page (RSVP accepted), or a
 * small puff of them (a wish sent). Hearts grow as they rise and fade out;
 * transforms and opacity only. Nothing happens with reduced motion.
 */
export function burstHearts(from?: Element | null, opts: { count?: number; puff?: boolean } = {}) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const phone = window.matchMedia("(pointer: coarse)").matches;
  const count = Math.round((opts.count ?? (opts.puff ? 10 : 34)) * (phone && !opts.puff ? 0.45 : 1));
  const r = from?.getBoundingClientRect();
  const ox = r ? r.left + r.width / 2 : window.innerWidth / 2;
  const oy = r ? r.top + r.height / 2 : window.innerHeight;
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:130;overflow:hidden";
  document.body.appendChild(layer);
  const colors = ["#e8577a", "#f48aa5", "#d93a4a", "#ff9fb5", "#c8243c"];
  let left = count;
  for (let i = 0; i < count; i++) {
    const h = document.createElement("span");
    const size = 12 + Math.random() * (opts.puff ? 10 : 18);
    h.innerHTML = `<svg viewBox="0 0 24 22" width="${size}" height="${size}"><path d="M12 21s-9-5.6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.4-9 12-9 12Z" fill="${colors[i % colors.length]}"/></svg>`;
    h.style.cssText = "position:absolute;left:0;top:0;will-change:transform,opacity";
    layer.appendChild(h);
    // a few pop out of the button, the rest rise from the bottom of the page
    const fromButton = opts.puff || i < count * 0.3;
    const x0 = fromButton ? ox + (Math.random() - 0.5) * 40 : Math.random() * window.innerWidth;
    const y0 = fromButton ? oy : window.innerHeight + 20;
    const rise = (opts.puff ? 0.25 : 0.7 + Math.random() * 0.4) * window.innerHeight;
    gsap.fromTo(
      h,
      { x: x0, y: y0, scale: 0.4, opacity: 0, rotate: (Math.random() - 0.5) * 30 },
      {
        x: x0 + (Math.random() - 0.5) * (opts.puff ? 120 : 160),
        y: y0 - rise,
        scale: 1 + Math.random() * 0.6,
        opacity: 1,
        rotate: (Math.random() - 0.5) * 60,
        duration: (opts.puff ? 1.2 : 2.4) + Math.random() * 1.2,
        delay: Math.random() * (opts.puff ? 0.2 : 0.9),
        ease: "power1.out",
        onComplete: () => {
          h.remove();
          if (--left === 0) layer.remove();
        },
      },
    );
    gsap.to(h, { opacity: 0, duration: 0.6, delay: (opts.puff ? 0.9 : 2) + Math.random() * 0.8 });
  }
}
