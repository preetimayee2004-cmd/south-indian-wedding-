import { useLayoutEffect, useRef, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Lightbox } from "@/components/sections/gallery/Lightbox";
import { gsap } from "@/lib/gsap";

/**
 * "Moments to Cherish" — the woven tapestry from the reference picture (gallery-tapestry.webp,
 * 1672×941): the temple roof and pillars around a cream silk wall with a maroon sari drape, six
 * carved gold frames, jasmine and fine gold threads. The six openings are cut out of the
 * picture and the couple's own photographs sit behind them.
 *
 * The entrance (once, as it comes into view): a thin gold thread runs across the middle, the
 * tapestry weaves open from it (up and down, while a second thread drops through the centre),
 * then the thread travels from frame to frame — each photograph appearing as it arrives — and
 * finally settles into a fine gold border around the whole piece. Hover lifts a photograph
 * inside its frame; a tap opens the full-screen viewer. On phones the tapestry is wider than the
 * screen and can be swiped across, starting in the middle. Reduced motion: shown complete.
 */

const ART = "/media/gallery-tapestry.webp";
const ART_W = 1672;
const ART_H = 941;
/** The frame openings in the picture (px): the big centre one first, then top-left, top-right,
 *  bottom-left, bottom-centre and bottom-right (photos 1–6 in that order). */
const FRAMES = [
  { x0: 702, x1: 978, top: 255, bottom: 592 },
  { x0: 310, x1: 530, top: 200, bottom: 462 },
  { x0: 1152, x1: 1380, top: 225, bottom: 495 },
  { x0: 308, x1: 548, top: 512, bottom: 758 },
  { x0: 725, x1: 955, top: 638, bottom: 818 },
  { x0: 1072, x1: 1292, top: 548, bottom: 798 },
];
/** The order the thread visits them: top-left, bottom-left, bottom-centre, centre, top-right, bottom-right. */
const ROUTE = [1, 3, 4, 0, 2, 5];
const centre = (i: number) => [(FRAMES[i].x0 + FRAMES[i].x1) / 2, (FRAMES[i].top + FRAMES[i].bottom) / 2] as const;
/** One gentle curve per hop, from the left edge through each frame to the right edge. */
const HOPS = (() => {
  const pts: (readonly [number, number])[] = [[0, 470], ...ROUTE.map(centre), [ART_W, 470]];
  return pts.slice(1).map((b, k) => {
    const a = pts[k];
    const mx = (a[0] + b[0]) / 2;
    const bow = k % 2 ? -60 : 60;
    return `M${a[0]} ${a[1]}C${mx} ${a[1] + bow} ${mx} ${b[1] - bow} ${b[0]} ${b[1]}`;
  });
})();

type Photo = { src: string; caption: string; alt: string; focus?: string };

function useGallery() {
  const { gallery } = useWedding();
  const photos: Photo[] = (gallery?.photos ?? []).map((p) => ({
    src: p.src,
    caption: p.caption ?? "",
    alt: p.alt || p.caption || "A photo of the couple",
    focus: p.focus,
  }));
  return { heading: gallery?.heading ?? "Moments to Cherish", subtitle: gallery?.subtitle ?? "", photos };
}

export function TempleWindowGallery() {
  const g = useGallery();
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const root = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const shown = g.photos.slice(0, FRAMES.length);

  // phones: start in the middle of the tapestry
  useLayoutEffect(() => {
    const s = scroller.current;
    if (!s) return;
    const mid = () => {
      s.scrollLeft = (s.scrollWidth - s.clientWidth) / 2;
    };
    mid();
    window.addEventListener("resize", mid);
    return () => window.removeEventListener("resize", mid);
  }, []);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const photos = q(".tg-photo");
      const hops = q(".tg-hop");
      gsap.set(q(".tg-art"), { clipPath: "inset(50% 0% 50% 0%)" });
      gsap.set(photos, { clipPath: "inset(50% 50% 50% 50%)", filter: "blur(8px)" });
      gsap.set([...q(".tg-weft"), ...q(".tg-warp"), ...hops, ...q(".tg-border")], { strokeDasharray: 1, strokeDashoffset: 1, autoAlpha: 1 });

      const tl = gsap.timeline({ paused: true });
      // 1. a thin gold thread runs across the middle
      tl.to(q(".tg-weft"), { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" });
      // 2. the tapestry weaves open from it, while a second thread drops through the centre
      tl.to(q(".tg-warp"), { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, 0.75);
      tl.to(q(".tg-art"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power2.inOut" }, 0.8);
      tl.to([...q(".tg-weft"), ...q(".tg-warp")], { autoAlpha: 0, duration: 0.6 }, 2);
      // 3. the thread travels frame to frame; each photograph appears as it arrives
      let t = 2.1;
      hops.forEach((h, k) => {
        tl.to(h, { strokeDashoffset: 0, duration: 0.42, ease: "power1.inOut" }, t);
        t += 0.42;
        const frame = ROUTE[k];
        if (frame !== undefined && photos[frame])
          tl.to(photos[frame], { clipPath: "inset(0% 0% 0% 0%)", filter: "blur(0px)", duration: 0.8, ease: "power2.out" }, t - 0.05);
      });
      // 4. the thread settles into a fine gold border around the whole piece
      tl.to(hops, { autoAlpha: 0, duration: 0.8 }, t + 0.3);
      tl.to(q(".tg-border"), { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, t + 0.1);

      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 65%", once: true, onEnter: () => void tl.play() } });
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  if (!shown.length) return null;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <section ref={root} id="gallery" aria-labelledby="gallery-heading" className="tg-section relative">
      <div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#f7ecd3" }} />
      <h2 id="gallery-heading" className="sr-only">
        {g.heading}
        {g.subtitle ? ` — ${g.subtitle}` : ""}
      </h2>
      <div ref={scroller} className="tg-scroller">
        <div className="tg-wall" style={{ aspectRatio: `${ART_W} / ${ART_H}` }}>
          {/* the couple's photographs, behind the carved openings */}
          {shown.map((p, i) => {
            const f = FRAMES[i];
            return (
              <button
                key={p.src}
                type="button"
                className="tg-photo"
                onClick={() => setOpen(i)}
                aria-label={`Open photo: ${p.caption || p.alt}`}
                style={{ left: pct(f.x0 - 4, ART_W), width: pct(f.x1 - f.x0 + 8, ART_W), top: pct(f.top - 4, ART_H), height: pct(f.bottom - f.top + 8, ART_H) }}
              >
                <img src={p.src} alt={p.alt} loading="lazy" decoding="async" draggable={false} style={{ objectPosition: p.focus ?? "50% 30%" }} />
              </button>
            );
          })}
          {/* the tapestry, with the frames cut out */}
          <img src={ART} alt="" aria-hidden decoding="async" className="tg-art" draggable={false} />
          {/* the gold threads of the entrance, and the border they settle into */}
          <svg aria-hidden className="tg-threads" viewBox={`0 0 ${ART_W} ${ART_H}`} preserveAspectRatio="none">
            <defs>
              <filter id="tg-glow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="2.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#tg-glow)" fill="none" stroke="#f0cf7a" strokeLinecap="round">
              <path className="tg-weft" pathLength={1} d={`M0 ${ART_H / 2}H${ART_W}`} strokeWidth="2" opacity="0" />
              <path className="tg-warp" pathLength={1} d={`M${ART_W / 2} 0V${ART_H}`} strokeWidth="2" opacity="0" />
              {HOPS.map((d, k) => (
                <path key={k} className="tg-hop" pathLength={1} d={d} strokeWidth="2.4" opacity="0" />
              ))}
            </g>
            <rect className="tg-border" pathLength={1} x="10" y="10" width={ART_W - 20} height={ART_H - 20} rx="6" fill="none" stroke="#d9b25f" strokeWidth="2.5" />
          </svg>
          {/* snap points for swiping on phones: left, middle and right columns */}
          {[420, 836, 1236].map((x) => (
            <span key={x} aria-hidden className="tg-snap" style={{ left: pct(x, ART_W) }} />
          ))}
        </div>
      </div>

      {open !== null && (
        <Lightbox
          images={g.photos.map((p) => ({ src: p.src, alt: p.alt, caption: p.caption }))}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
