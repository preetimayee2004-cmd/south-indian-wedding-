import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Lightbox } from "@/components/sections/gallery/Lightbox";
import { gsap } from "@/lib/gsap";

type Photo = { src: string; caption: string; alt: string };

function useStory() {
  const { gallery } = useWedding();
  const photos: Photo[] = (gallery?.photos ?? []).slice(0, 6).map((p) => ({
    src: p.src,
    caption: p.caption ?? "",
    alt: p.alt || p.caption || "A photo from our story",
  }));
  return {
    heading: gallery?.heading ?? "Moments to Cherish",
    subtitle: gallery?.subtitle ?? "Little memories, one beautiful story",
    ending: gallery?.ending ?? "and so it begins...",
    photos,
  };
}

/**
 * 6 photo spots in a loose cinematic composition:
 * 3 in the upper area, 3 in the lower area, avoiding a rigid grid.
 * Varied natural rotations and subtle gold accents on selective photos.
 */
const SPOTS = [
  // Upper area (3 photos)
  { rot: -3.5, accent: "corner-tl" as const },
  { rot: 2.8, accent: null },
  { rot: -2.0, accent: "lotus-top" as const },
  // Lower area (3 photos)
  { rot: 3.2, accent: null },
  { rot: -3.0, accent: null },
  { rot: 2.2, accent: "corner-br" as const },
] as const;

/** Subtle antique gold corner filigree for photo 0 and photo 5 */
function CornerFiligree({ position = "top-left" }: { position?: "top-left" | "bottom-right" }) {
  const isBR = position === "bottom-right";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 28 28"
      className={`pointer-events-none absolute z-10 h-6 w-6 sm:h-7 sm:w-7 ${
        isBR ? "-bottom-1.5 -right-1.5 rotate-180" : "-top-1.5 -left-1.5"
      }`}
    >
      <defs>
        <linearGradient id={`filigree-${position}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fae5a2" />
          <stop offset="50%" stopColor="#c9954f" />
          <stop offset="100%" stopColor="#8a6420" />
        </linearGradient>
      </defs>
      <path
        d="M2 2h14c-2 2-4.5 3-7 3 0 2.5-1 5-3 7V2Z"
        fill={`url(#filigree-${position})`}
        stroke="#7a5217"
        strokeWidth="0.5"
      />
      <circle cx="6.5" cy="6.5" r="1.8" fill="#fff6d6" stroke="#7a5217" strokeWidth="0.5" />
      <path d="M2 2l7 7" stroke="#7a5217" strokeWidth="0.6" strokeLinecap="round" />
    </svg>
  );
}

/** Tiny refined antique gold lotus accent on photo 2 */
function GoldLotusPin() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 28 18"
      className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 z-10 h-4 w-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
    >
      <defs>
        <linearGradient id="gm-lotus-pin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3d1" />
          <stop offset="50%" stopColor="#d4a94a" />
          <stop offset="100%" stopColor="#7a5217" />
        </linearGradient>
      </defs>
      <path d="M14 1 C11.5 5.5, 11.5 10, 14 15 C16.5 10, 16.5 5.5, 14 1 Z" fill="url(#gm-lotus-pin)" />
      <path d="M13 7 C8.5 6, 4.5 9, 5.5 13.5 C9 14.5, 12 11.5, 13 9.5 Z" fill="url(#gm-lotus-pin)" opacity="0.9" />
      <path d="M15 7 C19.5 6, 23.5 9, 22.5 13.5 C19 14.5, 16 11.5, 15 9.5 Z" fill="url(#gm-lotus-pin)" opacity="0.9" />
      <circle cx="14" cy="13" r="1.3" fill="#fff6d6" />
    </svg>
  );
}

interface GalleryContentProps {
  story: ReturnType<typeof useStory>;
  onOpen: (i: number) => void;
  isAnimated?: boolean;
}

function GalleryContent({ story, onOpen, isAnimated = false }: GalleryContentProps) {
  const { photos, heading, subtitle, ending } = story;

  return (
    <div className="relative mx-auto w-full max-w-7xl">
      {/* Top Scallop Border */}
      <div aria-hidden="true" className="edge edge-scallop-top edge-temple" />

      {/* Title Plaque: Cream plaque with antique gold border */}
      <header className="gm-plaque-wrapper mb-8 flex flex-col items-center justify-center text-center sm:mb-10 md:mb-14">
        <div className="gm-plaque">
          <h2 id="gallery-heading">{heading}</h2>
        </div>
        {subtitle && (
          <p className="gm-subtitle mt-2.5 text-[0.74rem] uppercase tracking-[0.24em] font-semibold sm:text-[0.82rem]">
            {subtitle}
          </p>
        )}
      </header>

      {/* Floating Canvas / Stage */}
      <div className="gm-stage">
        {/* Extremely subtle, organic gold dotted connecting trail */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 700"
          className="gm-trail-svg pointer-events-none absolute inset-0 hidden h-full w-full md:block"
        >
          <path
            className="gm-trail-path"
            d="M 150 160 C 270 230, 370 225, 490 220 C 610 215, 710 135, 820 150 C 920 230, 920 390, 830 490 C 740 575, 630 555, 510 550 C 390 545, 270 515, 180 510"
            fill="none"
            stroke="#e2b84f"
            strokeOpacity="0.32"
            strokeWidth="1.6"
            strokeDasharray="4 8"
            strokeLinecap="round"
          />
        </svg>

        {/* 6 Wedding Photographs */}
        {photos.map((p, i) => {
          const s = SPOTS[i % SPOTS.length];
          return (
            <button
              key={p.src}
              type="button"
              onClick={() => onOpen(i)}
              data-index={i}
              data-rot={s.rot}
              className={`gm-photo gm-spot-${i} ${!isAnimated ? `gm-floating-${i}` : ""}`}
              style={{ "--rot": `${s.rot}deg` } as CSSProperties}
              aria-label={`Open photo: ${p.caption}`}
            >
              <span className="gm-polaroid">
                <span className="gm-pic">
                  <img
                    src={p.src}
                    alt={p.alt}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="block h-full w-full object-cover"
                  />
                </span>
                <span className="gm-caption" aria-hidden="true">
                  {p.caption}
                </span>
              </span>

              {/* Minimal selective gold accents */}
              {s.accent === "corner-tl" && <CornerFiligree position="top-left" />}
              {s.accent === "corner-br" && <CornerFiligree position="bottom-right" />}
              {s.accent === "lotus-top" && <GoldLotusPin />}
            </button>
          );
        })}
      </div>

      {/* Ending Note */}
      {ending && (
        <footer className="gm-ending relative z-10 mt-10 text-center sm:mt-12 md:mt-16">
          <p className="font-script text-[clamp(1.5rem,3vw,2.1rem)] text-[#d4af37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {ending}
          </p>
        </footer>
      )}
    </div>
  );
}

/**
 * Our Love Story — Floating Memories Gallery
 * 6 polaroids floating across the deep maroon temple-art canvas,
 * cinematic entrance animation on entering the gallery, subtle floating effect,
 * and warm golden hover lift.
 */
export function LoveStoryScene() {
  const story = useStory();
  const [open, setOpen] = useState<number | null>(null);
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      // 1. Plaque entrance
      gsap.from(".gm-plaque-wrapper", {
        opacity: 0,
        y: -22,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: {
          trigger: root.current,
          start: "top 78%",
          once: true,
        },
      });

      // 2. Dotted trail entrance
      gsap.from(".gm-trail-path", {
        opacity: 0,
        duration: 1.4,
        ease: "power1.out",
        scrollTrigger: {
          trigger: root.current,
          start: "top 75%",
          once: true,
        },
      });

      // 3. Cinematic one-by-one photo entrance: fade-in, upward glide, settling rotation
      const photoEls = gsap.utils.toArray<HTMLElement>(".gm-photo");
      photoEls.forEach((el, i) => {
        const targetRot = parseFloat(el.dataset.rot || "0");
        gsap.fromTo(
          el,
          {
            opacity: 0,
            y: 40,
            scale: 0.93,
            rotation: targetRot * 1.5 + (i % 2 === 0 ? -4 : 4),
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation: targetRot,
            duration: 1.05,
            delay: 0.15 + i * 0.14,
            ease: "power2.out",
            scrollTrigger: {
              trigger: root.current,
              start: "top 75%",
              once: true,
            },
            onComplete: () => {
              el.classList.add(`gm-floating-${i}`);
            },
          }
        );
      });

      // 4. Ending tag entrance
      gsap.from(".gm-ending", {
        opacity: 0,
        y: 16,
        duration: 0.8,
        delay: 0.2 + photoEls.length * 0.14,
        ease: "power2.out",
        scrollTrigger: {
          trigger: root.current,
          start: "top 75%",
          once: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  if (!story.photos.length) return null;

  return (
    <section
      ref={root}
      id="gallery"
      aria-labelledby="gallery-heading"
      className="gb-wall relative overflow-hidden px-4 py-16 sm:px-6 md:px-10 md:py-20 lg:px-14"
    >
      <GalleryContent story={story} onOpen={setOpen} isAnimated={!reduced} />
      {open !== null && (
        <Lightbox
          images={story.photos.map((p) => ({ src: p.src, alt: p.alt, caption: p.caption }))}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

/**
 * Reduced motion fallback: static presentation with no scroll triggers or float animations.
 */
export function LoveStoryStill() {
  const story = useStory();
  const [open, setOpen] = useState<number | null>(null);

  if (!story.photos.length) return null;

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="gb-wall relative overflow-hidden px-4 py-16 sm:px-6 md:px-10 md:py-20 lg:px-14"
    >
      <GalleryContent story={story} onOpen={setOpen} isAnimated={false} />
      {open !== null && (
        <Lightbox
          images={story.photos.map((p) => ({ src: p.src, alt: p.alt, caption: p.caption }))}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
