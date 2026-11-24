import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { useGuest } from "@/context/GuestContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { GoldCorners, GoldDivider } from "@/components/ui/GoldDivider";

/**
 * Section 11 — A note of love. On the same maroon silk as the thank-you:
 * the couple's letter on ivory paper inside a gold double rule with filigree
 * corners, sealed at the foot with a maroon wax seal. It fades up as it arrives.
 */
export function LoveNote() {
  const { loveNote, couple } = useWedding();
  const { guestName } = useGuest();
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

  const greeting = `Dear ${guestName},`;
  const signature = loveNote.signature ?? `${couple.bride.name} & ${couple.groom.name}`;
  const initials = `${couple.bride.name[0]}&${couple.groom.name[0]}`;

  return (
    <section ref={root} id="loveNote" aria-labelledby="note-heading" className="pm-silk relative isolate overflow-hidden">
      <div className="relative mx-auto max-w-[30rem] px-gutter pb-20 pt-16 text-center">
        <p className="note-in pm-eyebrow">प्रेम पत्र</p>
        <h2 id="note-heading" className="note-in pm-caps-title mt-2">
          A Note from our Hearts
        </h2>
        <GoldDivider className="note-in mt-3" />

        <div className="note-in ln-letter relative mx-auto mt-9 max-w-[22rem]">
          <GoldCorners className="ln-corner" />
          <p className="font-script text-[2rem] leading-none text-[#8a1b2c]">{greeting}</p>
          <p className="mx-auto mt-4 max-w-[17rem] text-[1.08rem] italic leading-relaxed text-[#3d1c14] [text-wrap:pretty]">{loveNote.text}</p>
          <p className="mt-5 text-[0.95rem] italic text-[#5c3a2b]">With all our love,</p>
          <p className="mt-1 font-script text-[2.3rem] leading-none text-[#8a1b2c]">{signature}</p>
          {/* the wax seal at the foot of the letter */}
          <span aria-hidden className="ln-seal">
            {initials}
          </span>
        </div>
      </div>
    </section>
  );
}
