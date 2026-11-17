import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { GalleryImage } from "@/config/types";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Container } from "@/components/layout/Container";
import { JourneyMap } from "./gallery/JourneyMap";
import { Lightbox } from "./gallery/Lightbox";
import { artProps } from "@/lib/art";

type Category = NonNullable<GalleryImage["category"]>;
const FILTER_LABELS: Record<Category, string> = {
  couple: "Couple",
  "pre-wedding": "Pre-wedding",
  family: "Family",
  traditional: "Traditions",
};
const TITLE = "Our Journey";

/**
 * Section 04 — Gallery as a journey map.
 * Banner: the temple dancers, easing back as you arrive; the title rises
 *   letter by letter from behind a baseline.
 * Map: photos zig-zag down a dotted kolam path that draws with scroll; each
 *   photo opens like an iris. Filter chips appear when photos have more than
 *   one category. Tap any photo for the lightbox.
 */
export function Gallery() {
  const { gallery, media } = useWedding();
  const reduced = usePrefersReducedMotion();
  const [filter, setFilter] = useState<Category | "all">("all");
  const [open, setOpen] = useState<number | null>(null);

  const categories = useMemo(
    () => [...new Set(gallery.map((g) => g.category).filter(Boolean))] as Category[],
    [gallery],
  );
  const images = useMemo(() => (filter === "all" ? gallery : gallery.filter((g) => g.category === filter)), [gallery, filter]);

  const banner = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const list = useRef<HTMLOListElement>(null);

  // Banner + title (once).
  useLayoutEffect(() => {
    if (reduced || !title.current || !banner.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        art.current,
        { scale: 1.22, yPercent: -6 },
        { scale: 1, yPercent: 4, ease: "none", scrollTrigger: { trigger: banner.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
      gsap.from(title.current!.querySelectorAll(".ch"), {
        yPercent: 110,
        rotate: 6,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.045,
        scrollTrigger: { trigger: title.current, start: "top 88%", once: true },
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  // Photo reveals — re-run when the filter changes the set of photos.
  useLayoutEffect(() => {
    if (reduced || !list.current) return;
    const ctx = gsap.context(() => {
      const stops = gsap.utils.toArray<HTMLElement>(".stop", list.current);
      stops.forEach((stop) => {
        const iris = stop.querySelector(".stop-iris");
        const img = stop.querySelector(".stop-img");
        const cap = stop.querySelector(".stop-caption");
        gsap
          .timeline({ scrollTrigger: { trigger: stop, start: "top 85%", once: true } })
          .fromTo(iris, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 1.1, ease: "power3.out" })
          .fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.4, ease: "power2.out" }, 0)
          .fromTo(cap, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.45);
      });
    }, list);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reduced, images]);

  if (gallery.length === 0) return null;

  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="relative isolate">
      {/* ── Banner ── */}
      <div ref={banner} className="relative overflow-hidden" style={{ height: "min(78svh, 720px)" }}>
        <div ref={art} className="absolute inset-0">
          <img {...artProps(media.gallery)} alt="" aria-hidden loading="lazy" className="absolute inset-0 hidden h-full w-full scale-110 object-cover blur-2xl md:block" />
          <img
            {...artProps(media.gallery)}
            alt="Dancers in silk performing before a carved gopuram"
            loading="lazy"
            decoding="async"
            className="relative mx-auto h-full w-full object-cover object-[50%_62%] md:w-auto md:object-contain"
            draggable={false}
          />
        </div>
        {/* Fade into the ivory page */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-b from-transparent via-ivory/80 to-ivory" />
        <div className="absolute inset-x-0 bottom-6 text-center">
          <p className="eyebrow">Moments</p>
          <h2 ref={title} id="gallery-heading" aria-label={TITLE} className="script-heading mt-1 text-script-lg">
            {TITLE.split(" ").map((word, w) => (
              <span key={w} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden>
                {[...word].map((c, i) => (
                  <span key={i} className="ch inline-block">
                    {c}
                  </span>
                ))}
                {w < TITLE.split(" ").length - 1 && <span className="inline-block w-[0.28em]" />}
              </span>
            ))}
          </h2>
        </div>
      </div>

      {/* ── Journey ── */}
      <div className="pb-section pt-10">
        <Container>
          {categories.length > 1 && (
            <div role="group" aria-label="Filter photos" className="-mx-gutter mb-12 flex gap-2 overflow-x-auto px-gutter pb-1 [scrollbar-width:none] md:justify-center">
              {(["all", ...categories] as const).map((c) => {
                const active = filter === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(c)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-[0.72rem] uppercase tracking-[0.2em] transition-colors duration-300 ${
                      active ? "border-accent bg-accent text-paper" : "border-line bg-paper/60 text-ink-soft hover:border-gold"
                    }`}
                  >
                    {c === "all" ? "All" : FILTER_LABELS[c]}
                  </button>
                );
              })}
            </div>
          )}

          <JourneyMap ref={list} images={images} onOpen={setOpen} animate={!reduced} />
        </Container>
      </div>

      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}
