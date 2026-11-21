import { gsap } from "./gsap";

/**
 * Sweet pink and red hearts that float up the page (RSVP accepted), or a
 * small puff of them (a wish sent). Hearts grow as they rise and fade out;
 * transforms and opacity only. Nothing happens with reduced motion.
 */
export function burstHearts(from?: Element | null, opts: { count?: number; puff?: boolean } = {}) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const count = opts.count ?? (opts.puff ? 16 : 60);
  const r = from?.getBoundingClientRect();
  const ox = r ? r.left + r.width / 2 : window.innerWidth / 2;
  const oy = r ? r.top + r.height / 2 : window.innerHeight * 0.75;
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:130;overflow:hidden";
  document.body.appendChild(layer);
  const colors = ["#ff2d55", "#ff6b8b", "#ffd700", "#ff4081", "#ff9a3c", "#f06292", "#ffb300", "#e91e63"];
  let left = count;
  for (let i = 0; i < count; i++) {
    const h = document.createElement("span");
    const size = 14 + Math.random() * (opts.puff ? 12 : 24);
    const col = colors[i % colors.length];
    h.innerHTML = `<svg viewBox="0 0 24 22" width="${size}" height="${size}" style="filter: drop-shadow(0 2px 6px ${col}88);"><path d="M12 21s-9-5.6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.4-9 12-9 12Z" fill="${col}"/></svg>`;
    h.style.cssText = "position:absolute;left:0;top:0;will-change:transform,opacity";
    layer.appendChild(h);
    // scatter from button or bottom
    const fromButton = opts.puff || i < count * 0.45;
    const x0 = fromButton ? ox + (Math.random() - 0.5) * 80 : Math.random() * window.innerWidth;
    const y0 = fromButton ? oy + (Math.random() - 0.5) * 40 : window.innerHeight + 20;
    const rise = (opts.puff ? 0.35 : 0.75 + Math.random() * 0.45) * window.innerHeight;
    gsap.fromTo(
      h,
      { x: x0, y: y0, scale: 0.3, opacity: 0, rotate: (Math.random() - 0.5) * 40 },
      {
        x: x0 + (Math.random() - 0.5) * (opts.puff ? 140 : 220),
        y: y0 - rise,
        scale: 1 + Math.random() * 0.8,
        opacity: 1,
        rotate: (Math.random() - 0.5) * 80,
        duration: (opts.puff ? 1.4 : 2.5) + Math.random() * 1.4,
        delay: Math.random() * (opts.puff ? 0.2 : 0.6),
        ease: "power1.out",
        onComplete: () => {
          h.remove();
          if (--left === 0) layer.remove();
        },
      },
    );
    gsap.to(h, { opacity: 0, duration: 0.7, delay: (opts.puff ? 1.0 : 2.0) + Math.random() * 0.9 });
  }
}
