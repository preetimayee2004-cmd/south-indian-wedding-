import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { RsvpPanel, useRsvpUsable } from "./rsvp/RsvpPanel";
import { artProps } from "@/lib/art";

const IMG_RATIO = "768 / 1376";

/**
 * Section 07 — RSVP (phones/tablets), inside the stone arch (its title is
 * printed in the art). The brass lamps flicker softly; the shared RsvpPanel
 * lives in the arch's clear centre.
 */
export function Rsvp() {
  const { media } = useWedding();
  const reduced = usePrefersReducedMotion();
  const usable = useRsvpUsable();
  const arch = media.rsvpArch;

  const wrap = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const lamps = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reduced || !usable || !wrap.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: wrap.current, start: "top 55%", once: true } });
      tl.from(lamps.current!.children, { autoAlpha: 0, scale: 0.2, duration: 0.6, stagger: 0.12, ease: "power2.out" }).from(
        box.current,
        { autoAlpha: 0, scale: 0.94, filter: "blur(4px)", duration: 0.9, ease: "power2.out" },
        0.2,
      );
    });
    return () => ctx.revert();
  }, [reduced, usable]);

  if (!usable && !import.meta.env.DEV) return null;

  return (
    <section id="rsvp" aria-label="RSVP" className="relative isolate">
      <h2 className="sr-only">RSVP</h2>
      <div ref={wrap} className="relative overflow-hidden bg-[#f3ece0]" style={{ height: "max(100svh, 760px)" }}>
        <img {...artProps(media.rsvp)} alt="" aria-hidden loading="lazy" className="absolute inset-0 hidden h-full w-full scale-110 object-cover blur-2xl md:block" />
        <div className="absolute left-1/2 top-0 h-full -translate-x-1/2" style={{ aspectRatio: IMG_RATIO }}>
          <img
            {...artProps(media.rsvp)}
            alt="A carved stone arch hung with flower garlands, brass lamps and a flower rangoli, titled RSVP, Venue and Muhurtham"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <div ref={lamps} aria-hidden>
            {media.rsvpLamps.map(([x, y], i) => (
              <span
                key={i}
                className="pointer-events-none absolute h-16 w-16 rounded-full mix-blend-screen motion-safe:animate-[flicker_2.6s_ease-in-out_infinite]"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                  animationDelay: `${i * 0.37}s`,
                  background: "radial-gradient(circle, rgb(255 214 120 / 0.85) 0%, rgb(255 170 60 / 0.35) 35%, transparent 70%)",
                }}
              />
            ))}
          </div>
          <div
            ref={box}
            className="absolute flex flex-col items-center justify-center"
            style={{ top: `${arch.top}%`, left: `${arch.left}%`, width: `${arch.width}%`, height: `${arch.height}%` }}
          >
            <RsvpPanel />
          </div>
        </div>
      </div>
    </section>
  );
}
