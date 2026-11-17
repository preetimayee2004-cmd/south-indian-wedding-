import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Lightbox } from "@/components/sections/gallery/Lightbox";
import { Scene } from "../Scene";

const MAX = 9;
const TILT = [-4, 3, -2, 4, -3, 2, -5, 3, -2];

/**
 * Desktop scene — moments. Photos start as a loose pile in the middle of the
 * page and deal themselves out into a scattered spread of polaroids, each with
 * its caption written underneath. Click any photo for the full-screen viewer.
 */
export function GalleryScene() {
  const { gallery } = useWedding();
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const grid = useRef<HTMLUListElement>(null);
  const shown = gallery.slice(0, MAX);
  const cols = shown.length <= 4 ? 2 : shown.length <= 6 ? 3 : 3;

  useLayoutEffect(() => {
    if (reduced || !grid.current) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".polaroid", grid.current);
      const box = grid.current!.getBoundingClientRect();
      // Start every photo stacked at the centre of the spread, then deal them out.
      gsap.from(cards, {
        x: (i: number) => box.left + box.width / 2 - (cards[i].getBoundingClientRect().left + cards[i].offsetWidth / 2),
        y: (i: number) => box.top + box.height / 2 - (cards[i].getBoundingClientRect().top + cards[i].offsetHeight / 2),
        rotate: (i: number) => (i % 2 ? 14 : -12),
        scale: 0.8,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: grid.current, start: "top 70%", once: true },
      });
    }, grid);
    return () => ctx.revert();
  }, [reduced, shown.length]);

  if (!gallery.length) return null;

  return (
    <Scene id="gallery" labelledBy="gallery-heading">
      <div className="w-full max-w-[64rem]">
        <div className="text-center">
          <p data-reveal className="eyebrow">Moments</p>
          <h2 id="gallery-heading" data-reveal className="script-heading mt-2 text-[clamp(3rem,4.4vw,4.4rem)] leading-none">
            Our Journey
          </h2>
        </div>

        <ul ref={grid} className="mx-auto mt-12 grid gap-x-10 gap-y-12" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: cols === 2 ? "38rem" : "60rem" }}>
          {shown.map((g, i) => (
            <li key={g.src + i} className="polaroid" style={{ rotate: `${TILT[i % TILT.length]}deg` }}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Open photo: ${g.caption ?? g.alt}`}
                className="group block w-full bg-paper p-3 pb-4 shadow-[0_18px_40px_-18px_rgb(42_36_33/0.45)] transition-[transform,box-shadow] duration-500 ease-silk hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[0_26px_50px_-18px_rgb(42_36_33/0.5)]"
              >
                <span className="block aspect-[4/3] overflow-hidden bg-[#efe4cf]">
                  <img src={g.src} alt={g.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" draggable={false} />
                </span>
                <span className="mt-3 block truncate font-script text-[1.7rem] leading-none text-accent">{g.caption ?? " "}</span>
              </button>
            </li>
          ))}
        </ul>

        {gallery.length > MAX && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setOpen(MAX)}
              className="rounded-full border border-ink/20 px-6 py-3 text-[0.72rem] uppercase tracking-[0.22em] text-ink-soft hover:border-accent hover:text-accent"
            >
              View all {gallery.length} photos
            </button>
          </div>
        )}
      </div>
      {open !== null && <Lightbox images={gallery} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </Scene>
  );
}
