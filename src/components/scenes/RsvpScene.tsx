import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { RsvpPanel, useRsvpUsable } from "@/components/sections/rsvp/RsvpPanel";

/**
 * RSVP — a parchment card on the one sky. Nothing is pinned or boxed in: the
 * card grows to fit all of its content (the R·S·V·P line, the heading, the
 * buttons and the line under them) at any width. It rises in once, and the
 * main button pulses once, when it comes into view.
 */
export function RsvpScene() {
  const usable = useRsvpUsable();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reduced || !root.current || !card.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card.current, start: "top 85%", once: true } });
      tl.from(card.current, { autoAlpha: 0, y: 40, scale: 0.97, duration: 0.8, ease: "power2.out" });
      const cta = card.current!.querySelector<HTMLElement>("a.bg-accent, button.bg-accent, button[type=submit]");
      if (cta) tl.to(cta, { scale: 1.06, duration: 0.18, ease: "power1.out", yoyo: true, repeat: 1 }, ">-0.1");
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  if (!usable && !import.meta.env.DEV) return null;

  return (
    <section ref={root} id="rsvp" aria-label="RSVP" className="cobalt relative px-4 py-[max(3rem,8svh)]">
      <h2 className="sr-only">RSVP</h2>
      <div ref={card} className="parchment frieze-border mx-auto w-full max-w-[30rem] rounded-[6px] px-5 py-8 text-ink sm:px-8">
        <RsvpPanel />
      </div>
    </section>
  );
}
