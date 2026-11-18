import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useWedding } from "@/context/WeddingContext";
import { useGuest } from "@/context/GuestContext";
import { useAudio } from "@/context/AudioContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { lockScroll } from "@/lib/smooth";

interface OpeningProps {
  /** Called once the page underneath should become visible/interactive. */
  onReveal: () => void;
  /** Called when the overlay has fully faded and can unmount. */
  onDone: () => void;
  /** Kept for the laptop layout; the envelope is the same everywhere. */
  desktop?: boolean;
}

const POCKET = "h-[13.5rem] md:h-[15rem]";

/**
 * The first thing a guest sees: a full-screen parchment overlay with the
 * sealed envelope. Tap → the kumkum wax seal lifts, the flap swings open,
 * the envelope grows towards you and fades, revealing the hero underneath.
 * Skip is always there. Reduced motion → a simple fade.
 */
export function Opening({ onReveal, onDone }: OpeningProps) {
  const { couple, wedding, opening } = useWedding();
  const { guestName } = useGuest();
  const { start: startMusic, playSfx } = useAudio();
  const reduced = usePrefersReducedMotion();
  const [busy, setBusy] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const env = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLSpanElement>(null);
  const letter = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const finished = useRef(false);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // No page scrolling while the overlay is up.
  useEffect(() => {
    lockScroll(true);
    return () => lockScroll(false);
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  }, [onDone]);

  // Entrance: the envelope drifts down and settles; the hint breathes.
  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(env.current, { y: -50, rotate: -4, autoAlpha: 0, duration: 1.1, ease: "power3.out", delay: 0.15 });
      gsap.from(".open-fade", { autoAlpha: 0, y: 10, duration: 0.8, stagger: 0.12, delay: 0.5 });
      gsap.to(hint.current, { opacity: 0.55, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.4 });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const begin = useCallback(() => {
    if (busy || finished.current) return;
    setBusy(true);
    startMusic();
    playSfx("door");
    if (reduced) {
      onReveal();
      gsap.to(root.current, { autoAlpha: 0, duration: 0.5, onComplete: finish });
      return;
    }
    gsap.killTweensOf(hint.current);
    tl.current = gsap
      .timeline({ onComplete: finish })
      .to(hint.current, { autoAlpha: 0, duration: 0.2 })
      .to(seal.current, { scale: 1.35, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0)
      .to(flap.current, { rotateX: 180, duration: 0.7, ease: "power2.inOut" }, 0.2)
      .set(flap.current, { zIndex: 1 })
      .to(letter.current, { yPercent: -42, duration: 0.6, ease: "power2.out" }, 0.75)
      .add(() => onReveal(), 1.05)
      .to(env.current, { scale: 1.6, autoAlpha: 0, duration: 0.9, ease: "power2.in" }, 1.1)
      .to(".open-fade", { autoAlpha: 0, duration: 0.4 }, 1.1)
      .to(root.current, { backgroundColor: "rgb(243 229 196 / 0)", duration: 0.8, ease: "power1.inOut" }, 1.3)
      .to(root.current, { autoAlpha: 0, duration: 0.3 }, ">-0.1");
  }, [busy, reduced, startMusic, playSfx, onReveal, finish]);

  const skip = useCallback(() => {
    if (finished.current) return;
    startMusic();
    tl.current?.kill();
    onReveal();
    gsap.to(root.current, { autoAlpha: 0, duration: 0.45, ease: "power1.out", onComplete: finish });
  }, [startMusic, onReveal, finish]);

  const initials = `${couple.bride.name[0]}&${couple.groom.name[0]}`;

  return (
    <div
      ref={root}
      className="parchment fixed inset-0 z-[100] flex touch-none select-none flex-col items-center justify-center overflow-hidden px-gutter"
      role="dialog"
      aria-modal="true"
      aria-label="Wedding invitation"
    >
      {wedding.blessing && <p className="open-fade text-[0.8rem] tracking-[0.32em] text-ink">{wedding.blessing}</p>}
      <p className="open-fade mt-2 font-script text-[clamp(2rem,9vw,2.8rem)] leading-none text-accent">Dear {guestName},</p>

      <button
        type="button"
        onClick={begin}
        disabled={busy}
        aria-label={`${opening.tapLabel} — open the invitation`}
        className="relative mt-8 block w-full max-w-[21rem] cursor-pointer outline-none [perspective:1200px] focus-visible:ring-2 focus-visible:ring-accent md:max-w-[24rem]"
      >
        <div ref={env} className={`relative w-full ${POCKET}`}>
          {/* back of the envelope */}
          <div className="absolute inset-0 rounded-md border border-[#cfb383] bg-[#e6d3a7] shadow-[0_18px_40px_rgb(74_40_20/0.28)]" />
          {/* the letter peeking out */}
          <div className="absolute inset-x-3 bottom-3 top-0 z-10 overflow-hidden">
            <div ref={letter} className="absolute inset-x-0 top-[44%] h-full rounded-sm border border-gold/40 bg-[#fbf2dc] pt-5 text-center">
              <p className="font-script text-[1.7rem] leading-none text-accent">
                {couple.bride.name} &amp; {couple.groom.name}
              </p>
            </div>
          </div>
          {/* front pocket */}
          <div
            className="pointer-events-none absolute inset-0 z-20 rounded-md"
            style={{
              background:
                "linear-gradient(to top right, #ecdcb8 49.6%, transparent 50%) left bottom / 51% 100% no-repeat, linear-gradient(to top left, #ecdcb8 49.6%, transparent 50%) right bottom / 51% 100% no-repeat, linear-gradient(to top, #f0e2c2 0 46%, transparent 46%)",
            }}
          />
          {/* flap, hinged at the top edge, with the wax seal */}
          <div className="absolute inset-0 z-[25] [transform-style:preserve-3d]">
            <div
              ref={flap}
              className="absolute inset-x-0 top-0 h-[58%] origin-top"
              style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "linear-gradient(to bottom, #e3cf9f, #d6bd88)" }}
            />
            <span
              ref={seal}
              className="absolute left-1/2 top-[58%] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#9e2f28] font-script text-[1.45rem] text-[#fbe9c8] shadow-[0_4px_10px_rgb(122_46_42/0.5),inset_0_-3px_6px_rgb(0_0_0/0.25),inset_0_2px_3px_rgb(255_255_255/0.2)]"
              style={{ borderRadius: "48% 52% 50% 50% / 52% 48% 52% 48%" }}
            >
              {initials}
            </span>
          </div>
        </div>
      </button>

      <p ref={hint} className="open-fade mt-7 text-[0.74rem] font-bold uppercase tracking-[0.3em] text-ink">
        {opening.tapLabel}
      </p>

      <button
        type="button"
        onClick={skip}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 rounded-full border border-ink/25 bg-[#fbf2dc] px-4 py-2 text-eyebrow uppercase text-ink transition-colors hover:text-accent"
      >
        Skip
      </button>
    </div>
  );
}
