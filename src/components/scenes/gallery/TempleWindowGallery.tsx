import { useLayoutEffect, useRef, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Lightbox } from "@/components/sections/gallery/Lightbox";
import { gsap } from "@/lib/gsap";

/**
 * "Moments to Cherish" — the temple wall from the reference picture (gallery-temple.webp, 1672×941):
 * the tiled roof with its deity niches and the "Moments to Cherish" plaque, the carved pillars,
 * jasmine swags, hanging lamps and three carved windows on the marble floor. The windows'
 * openings are cut out of the picture, and the couple's own photographs sit behind them, so they
 * look set into the carvings. As it comes into view the wall appears, then the photographs rise
 * into the windows (the centre one first). Hover lifts a photograph inside its frame; a tap opens
 * the full-screen viewer (all the photos, arrows / swipe / Esc). On phones the wall is wider than
 * the screen and can be swiped across, starting on the centre window.
 */

const ART = "/media/gallery-temple.webp";
const ART_W = 1672;
const ART_H = 941;
/** The window openings in the picture (px): centre first, then left and right. */
const WINDOWS = [
  { x0: 700, x1: 969, top: 318, bottom: 722 },
  { x0: 290, x1: 519, top: 393, bottom: 710 },
  { x0: 1160, x1: 1385, top: 392, bottom: 710 },
];

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
  const shown = g.photos.slice(0, 3);

  // phones: start on the centre window
  useLayoutEffect(() => {
    const s = scroller.current;
    if (!s) return;
    const centre = () => {
      s.scrollLeft = (s.scrollWidth - s.clientWidth) / 2;
    };
    centre();
    window.addEventListener("resize", centre);
    return () => window.removeEventListener("resize", centre);
  }, []);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      gsap.set(q(".tg-art"), { autoAlpha: 0, scale: 1.02 });
      gsap.set(q(".tg-photo"), { clipPath: "inset(100% 0% 0% 0%)" });
      const tl = gsap.timeline({ paused: true });
      tl.to(q(".tg-art"), { autoAlpha: 1, scale: 1, duration: 1.1, ease: "power2.out" });
      tl.to(q(".tg-photo"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power2.inOut", stagger: 0.3 }, 0.7);
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 70%", once: true, onEnter: () => void tl.play() } });
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  if (!shown.length) return null;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <section ref={root} id="gallery" aria-labelledby="gallery-heading" className="tg-section relative">
      <div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#f6dcae" }} />
      <h2 id="gallery-heading" className="sr-only">
        {g.heading}
        {g.subtitle ? ` — ${g.subtitle}` : ""}
      </h2>
      <div ref={scroller} className="tg-scroller">
        <div className="tg-wall" style={{ aspectRatio: `${ART_W} / ${ART_H}` }}>
          {/* the couple's photographs, behind the carved openings */}
          {shown.map((p, i) => {
            const w = WINDOWS[i];
            return (
              <button
                key={p.src}
                type="button"
                className="tg-photo"
                onClick={() => setOpen(i)}
                aria-label={`Open photo: ${p.caption || p.alt}`}
                style={{ left: pct(w.x0 - 4, ART_W), width: pct(w.x1 - w.x0 + 8, ART_W), top: pct(w.top - 4, ART_H), height: pct(w.bottom - w.top + 8, ART_H) }}
              >
                <img src={p.src} alt={p.alt} loading="lazy" decoding="async" draggable={false} style={{ objectPosition: p.focus ?? "50% 30%" }} />
              </button>
            );
          })}
          {/* the temple wall, with the windows cut out */}
          <img src={ART} alt="" aria-hidden decoding="async" className="tg-art" draggable={false} />
          {/* snap points for swiping on phones: one on each window */}
          {WINDOWS.map((w, i) => (
            <span key={i} aria-hidden className="tg-snap" style={{ left: pct((w.x0 + w.x1) / 2, ART_W) }} />
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
