import { useLayoutEffect, useRef } from "react";
import { useSfxOnView } from "@/hooks/useSfxOnView";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { useGuest } from "@/context/GuestContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { GoldCorners, GoldDivider } from "@/components/ui/GoldDivider";
import { HangingDeepam, TempleDress } from "@/components/ui/TempleDress";

/**
 * A note of love, on the same dressed temple damask as the Venue (gold frame, filigree corners,
 * marigold strings): the couple's letter on ivory paper inside a gold double rule with filigree
 * corners, two small deepams hanging above it, a warm glow behind it, and a maroon wax seal at
 * its foot. It fades up as it arrives.
 */
export function LoveNote() {
  const { loveNote, couple } = useWedding();
  const { guestName } = useGuest();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  // the letter unfolds
  useSfxOnView(root, [["unfold", { volume: 0.9 }]], { rootMargin: "0px 0px -25% 0px" });

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
    <section ref={root} id="loveNote" aria-labelledby="note-heading" className="td-host td-bg relative isolate overflow-hidden">
      <TempleDress strands />
      <div className="relative z-10 mx-auto max-w-[30rem] px-gutter pb-20 pt-[clamp(4.5rem,9vw,6.5rem)] text-center">
        <p className="note-in pm-eyebrow">A letter for you</p>
        <h2 id="note-heading" className="note-in pm-caps-title mt-2">
          A Note from our Hearts
        </h2>
        <GoldDivider className="note-in mt-3" />
        <p className="note-in td-sub">Written with love, sealed with blessings.</p>

        <div className="note-in ln-wrap relative mx-auto mt-[clamp(5rem,9vw,6.5rem)] max-w-[22rem]">
          {/* a warm glow behind the letter, and two small deepams hanging above it */}
          <span aria-hidden className="ln-glow" />
          <HangingDeepam className="fw-deepam ln-deepam ln-deepam--l" />
          <HangingDeepam className="fw-deepam ln-deepam ln-deepam--r" />
          <div className="ln-letter relative">
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
      </div>
    </section>
  );
}
