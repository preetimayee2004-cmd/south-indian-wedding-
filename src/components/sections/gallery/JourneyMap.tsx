import { forwardRef, useCallback, useLayoutEffect, useRef, useState } from "react";
import type { GalleryImage } from "@/config/types";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const SHAPES = [
  { frame: "rounded-t-[999px]", aspect: "4 / 5" }, // arch
  { frame: "rounded-[999px]", aspect: "4 / 5" }, // oval
  { frame: "rounded-[6px]", aspect: "1 / 1" }, // square tile
] as const;

const LABELS: Record<NonNullable<GalleryImage["category"]>, string> = {
  couple: "The couple",
  "pre-wedding": "Pre-wedding",
  family: "Family",
  traditional: "Traditions",
};

interface Props {
  images: GalleryImage[];
  onOpen: (index: number) => void;
  /** Draw the path with scroll (off for reduced motion). */
  animate: boolean;
}

/**
 * Photos as stops on a journey: they zig-zag down the page and a dotted kolam
 * path winds through their centres (measured after layout, so it adapts to any
 * width and any number of photos). Frame shapes rotate arch / oval / tile.
 * Animated by the parent via `.journey-draw` (mask, pathLength=1) and `.stop-*`.
 */
export const JourneyMap = forwardRef<HTMLOListElement, Props>(function JourneyMap({ images, onOpen, animate }, ref) {
  const box = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<{ w: number; h: number; d: string } | null>(null);

  const measure = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const base = el.getBoundingClientRect();
    const pts = [...el.querySelectorAll<HTMLElement>(".stop-frame")].map((f) => {
      const r = f.getBoundingClientRect();
      return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
    });
    if (pts.length < 2) return setGeo(null);
    let d = `M${pts[0].x},${pts[0].y - 40}`;
    let prev = { x: pts[0].x, y: pts[0].y - 40 };
    for (const p of pts) {
      const dy = (p.y - prev.y) * 0.55;
      d += ` C${prev.x},${prev.y + dy} ${p.x},${p.y - dy} ${p.x},${p.y}`;
      prev = p;
    }
    const last = pts[pts.length - 1];
    d += ` C${last.x},${last.y + 60} ${base.width / 2},${last.y + 80} ${base.width / 2},${last.y + 130}`;
    setGeo({ w: base.width, h: base.height, d });
    // Layout moved: let ScrollTrigger recompute start/end positions.
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [measure, images]);

  // The dotted path draws itself as you travel down the page.
  const hasPath = geo !== null;
  useLayoutEffect(() => {
    if (!animate || !hasPath || !box.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".journey-draw",
        { attr: { "stroke-dashoffset": 1 } },
        { attr: { "stroke-dashoffset": 0 }, ease: "none", scrollTrigger: { trigger: box.current, start: "top 70%", end: "bottom 85%", scrub: 0.5 } },
      );
      gsap.fromTo(".journey-end", { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" }, {
        autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(2)",
        scrollTrigger: { trigger: box.current, start: "bottom 88%", toggleActions: "play none none reverse" },
      });
    }, box);
    return () => ctx.revert();
  }, [animate, hasPath]);

  return (
    <div ref={box} className="relative mx-auto max-w-[30rem] pb-36 md:max-w-[46rem]">
      {geo && (
        <svg className="pointer-events-none absolute inset-0" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden fill="none">
          <defs>
            <mask id="journey-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={geo.w} height={geo.h}>
              <path className="journey-draw" d={geo.d} pathLength={1} stroke="#fff" strokeWidth="14" strokeDasharray="1 1" strokeDashoffset="0" />
            </mask>
          </defs>
          <g mask="url(#journey-mask)">
            {/* kolam dots, with a lighter ring every few dots */}
            <path d={geo.d} className="stroke-gold/70" strokeWidth="3.4" strokeLinecap="round" strokeDasharray="0 13" />
            <path d={geo.d} className="stroke-gold/35" strokeWidth="9" strokeLinecap="round" strokeDasharray="0 65" />
          </g>
          {/* journey's end: a small lotus */}
          <path
            className="journey-end stroke-accent"
            transform={`translate(${geo.w / 2 - 10} ${geo.h - 26})`}
            d="M10 0c4 4 6 7 6 10s-2 6-6 8c-4-2-6-5-6-8s2-6 6-10ZM10 18c-5 0-9-2-10-5M10 18c5 0 9-2 10-5"
            strokeWidth="1.2"
          />
        </svg>
      )}

      <ol ref={ref} className="relative flex flex-col gap-14 md:gap-6">
        {images.map((img, i) => {
          const shape = SHAPES[i % SHAPES.length];
          const right = i % 2 === 1;
          return (
            <li key={img.src + i} className={`stop w-[64%] md:w-[44%] ${right ? "self-end" : "self-start"}`}>
              <figure className={right ? "text-right" : "text-left"}>
                <button
                  type="button"
                  onClick={() => onOpen(i)}
                  aria-label={`Open photo: ${img.caption ?? img.alt}`}
                  className="group block w-full"
                >
                  <span className={`stop-frame block overflow-hidden border border-gold/50 bg-paper p-[4px] shadow-[0_10px_30px_rgb(42_36_33/0.10)] ${shape.frame}`}>
                    <span className={`stop-iris block overflow-hidden ${shape.frame}`} style={{ aspectRatio: shape.aspect }}>
                      <img
                        src={img.src}
                        alt={img.alt}
                        loading="lazy"
                        decoding="async"
                        className="stop-img h-full w-full object-cover transition-transform duration-700 ease-silk group-hover:scale-[1.04]"
                        draggable={false}
                      />
                    </span>
                  </span>
                </button>
                {(img.caption || img.category) && (
                  <figcaption className="stop-caption mt-3">
                    {img.category && (
                      <span className="block text-[0.65rem] uppercase tracking-[0.26em] text-ink-soft">
                        {String(i + 1).padStart(2, "0")} · {LABELS[img.category]}
                      </span>
                    )}
                    {img.caption && <span className="mt-1 block font-script text-[1.65rem] leading-tight text-accent">{img.caption}</span>}
                  </figcaption>
                )}
              </figure>
            </li>
          );
        })}
      </ol>
    </div>
  );
});
