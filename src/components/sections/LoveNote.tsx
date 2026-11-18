import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { useGuest } from "@/context/GuestContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Container } from "@/components/layout/Container";

/**
 * Section 11 — A note of love. The sealed envelope now opens the whole
 * invitation (see Opening); here the couple's letter is simply laid out on
 * the parchment and fades up as it arrives.
 */
export function LoveNote() {
  const { loveNote, couple } = useWedding();
  const { guestName, isPersonalized } = useGuest();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".note-in", {
        autoAlpha: 0,
        y: reduced ? 0 : 18,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  if (!loveNote) return null;

  const greeting = isPersonalized ? `Dear ${guestName},` : "Dear friend,";
  const signature = loveNote.signature ?? `${couple.bride.name} & ${couple.groom.name}`;

  return (
    <section ref={root} id="loveNote" aria-labelledby="note-heading" className="relative isolate py-section">
      <Container>
        <div className="text-center">
          <p className="note-in eyebrow !text-ink">Before you go</p>
          <h2 id="note-heading" className="note-in script-heading mt-2 text-script-lg">
            A Note of Love
          </h2>
        </div>
        <div className="note-in mx-auto mt-8 max-w-[21rem] rounded-sm border border-gold/50 bg-[#fbf2dc] px-6 pb-7 pt-7 text-center shadow-[0_10px_30px_rgb(74_40_20/0.14)]">
          <p className="font-script text-[1.9rem] leading-none text-accent">{greeting}</p>
          <p className="mx-auto mt-4 max-w-[17rem] text-[1.08rem] italic leading-relaxed text-ink [text-wrap:pretty]">{loveNote.text}</p>
          <p className="mt-5 text-[0.62rem] uppercase tracking-[0.26em] text-ink">With all our love</p>
          <p className="mt-1 font-script text-[2.2rem] leading-none text-accent">{signature}</p>
        </div>
      </Container>
    </section>
  );
}
