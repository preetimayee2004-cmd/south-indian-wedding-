import { useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import type { GalleryImage } from "@/config/types";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Lightbox } from "@/components/sections/gallery/Lightbox";
import { artProps } from "@/lib/art";

type Category = NonNullable<GalleryImage["category"]>;
const FILTER_LABELS: Record<Category, string> = {
  couple: "Couple",
  "pre-wedding": "Pre-wedding",
  family: "Family",
  traditional: "Traditions",
};

// where each polaroid flies in from (cycled) and its resting tilt
const FROM = [
  { x: -120, y: 10 },
  { x: 120, y: -10 },
  { x: -30, y: 90 },
  { x: 40, y: -80 },
  { x: 110, y: 60 },
  { x: -110, y: -50 },
];
const tilt = (i: number) => ((i * 7919) % 13) - 6; // stable "random" −6…6°

/**
 * Scene 7 — Our Journey. Polaroids on the cobalt sky, each flying in from a
 * different side with a small tilt, staggered with the scroll. Two columns
 * drift up at slightly different speeds. Tap a photo for the lightbox.
 */
export function JourneyScene() {
  const { gallery } = useWedding();
  const [filter, setFilter] = useState<Category | "all">("all");
  const [open, setOpen] = useState<number | null>(null);
  const categories = useMemo(() => [...new Set(gallery.map((g) => g.category).filter(Boolean))] as Category[], [gallery]);
  const images = useMemo(() => (filter === "all" ? gallery : gallery.filter((g) => g.category === filter)), [gallery, filter]);
  const cols = [images.filter((_, i) => i % 2 === 0), images.filter((_, i) => i % 2 === 1)];

  const head = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const colEls = useRef<(HTMLElement | null)[]>([]);

  if (gallery.length === 0) return null;

  const build: Build = (tl) => {
    tl.from(head.current!.children, { autoAlpha: 0, y: 20, duration: 0.3, stagger: 0.08, ease: "power2.out" }, 0);
    const shots = gsap.utils.toArray<HTMLElement>("[data-shot]", win.current!);
    // fly in, in reading order, each from its own side
    shots
      .sort((a, b) => Number(a.dataset.i) - Number(b.dataset.i))
      .forEach((el, k) => {
        const i = Number(el.dataset.i);
        const f = FROM[i % FROM.length];
        tl.fromTo(
          el,
          { xPercent: f.x, yPercent: f.y, rotate: tilt(i) * 3, autoAlpha: 0 },
          { xPercent: 0, yPercent: 0, rotate: tilt(i), autoAlpha: 1, duration: 0.5, ease: "power2.out" },
          0.25 + k * 0.22,
        );
      });
    // columns drift up at different speeds (further if they don't fit)
    const over = (el: HTMLElement | null) => () => -Math.max(0, (el?.offsetHeight ?? 0) - (win.current?.clientHeight ?? 0)) - window.innerHeight * 0.06;
    const span = Math.max(1, 0.25 + shots.length * 0.22 + 0.4);
    tl.to(colEls.current[0], { y: over(colEls.current[0]), duration: span }, 0.2).to(
      colEls.current[1],
      { y: () => over(colEls.current[1])() * 1.18 - window.innerHeight * 0.03, duration: span },
      0.2,
    );
  };

  return (
    <Scene
      id="gallery"
      labelledBy="gallery-heading"
      className="cobalt"
      build={build}
      deps={[images]}
      edgeTop={<div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#004DB7" }} />}
    >
      <div className="flex h-full flex-col px-gutter pt-[max(1.5rem,5svh)]">
        <div ref={head} className="text-center">
          <p className="text-eyebrow uppercase text-[#fbf2dc]">Moments</p>
          <h2 id="gallery-heading" className="mt-1 font-script font-normal text-[#f3cf73] text-[clamp(2.6rem,11vw,4rem)] leading-none">
            Our Journey
          </h2>
          {categories.length > 1 && (
            <div role="group" aria-label="Filter photos" className="-mx-gutter mt-4 flex gap-2 overflow-x-auto px-gutter pb-1 [scrollbar-width:none]">
              {(["all", ...categories] as const).map((c) => {
                const active = filter === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(c)}
                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[0.66rem] uppercase tracking-[0.18em] transition-colors duration-300 ${
                      active ? "border-accent bg-accent text-paper" : "border-gold/60 bg-paper/70 text-ink"
                    }`}
                  >
                    {c === "all" ? "All" : FILTER_LABELS[c]}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div ref={win} className="relative mt-5 flex-1 overflow-hidden">
          <div className="grid grid-cols-2 gap-3">
            {cols.map((col, c) => (
              <ul key={c} ref={(el) => void (colEls.current[c] = el)} data-layer className={`flex flex-col gap-5 ${c === 1 ? "pt-14" : ""}`}>
                {col.map((g) => {
                  const i = images.indexOf(g);
                  return (
                    <li key={`${g.src}-${i}`} data-shot data-i={i} data-layer>
                      <button
                        type="button"
                        onClick={() => setOpen(i)}
                        className="block w-full bg-[#fbf3df] p-2 pb-1 text-left shadow-[0_10px_24px_rgb(74_40_20/0.22)] ring-1 ring-[#e0cc9f]"
                        aria-label={`Open photo: ${g.caption ?? g.alt}`}
                      >
                        <span className="block aspect-[4/5] overflow-hidden bg-[#e9dcc0]">
                          <img {...artProps(g.src, "45vw")} alt={g.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" draggable={false} />
                        </span>
                        {g.caption && <span className="mt-1 block text-center font-script text-[1.3rem] leading-[1.05] text-maroon">{g.caption}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </div>
      </div>
      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </Scene>
  );
}
