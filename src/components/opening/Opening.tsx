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
 * The first thing a guest sees (as in the reference): "Welcome to <city>" on
 * the hero's cobalt sky and the sealed envelope, addressed to the guest. Tap →
 * the wax seal cracks into two pieces, the flap swings open, the card rises
 * slowly out (a blue card with the couple's names), then grows to fill the
 * screen and becomes the hero's sky. Reduced motion → a simple fade.
 */
export function Opening({ onReveal, onDone }: OpeningProps) {
  const { couple, wedding, opening, loveStory } = useWedding();
  const city = loveStory?.livesOn.city ?? wedding.city.split(",")[0];
  const { guestName } = useGuest();
  const { start: startMusic, playSfx } = useAudio();
  const reduced = usePrefersReducedMotion();
  const [busy, setBusy] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const env = useRef<HTMLDivElement>(null);
  const flapWrap = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const sealL = useRef<HTMLSpanElement>(null);
  const sealR = useRef<HTMLSpanElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const finished = useRef(false);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // No page scrolling while the overlay is up.
  useEffect(() => {
    lockScroll(true);
    return () => {
      lockScroll(false);
      tl.current?.kill();
    };
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
    // the seal cracks into two pieces and the flap opens; then the
    // hero itself — temple, names and sky — grows smoothly out of the card to fill the screen,
    // and the page carries on from there as normal
    const hero = () => document.querySelector<HTMLElement>("#invitation-hero .sticky");
    const heroSec = () => hero()?.closest<HTMLElement>(".sec") ?? null;
    const grow = () => {
      onReveal(); // scrolls to the top and starts the hero's text entrance
      const el = hero();
      const sec = heroSec();
      if (!el || !sec) return;
      // it starts exactly where the blue card stands, half out of the envelope, and grows from there
      const r = card.current!.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      sec.style.zIndex = "200"; // above this overlay while it grows
      gsap.to(env.current, { autoAlpha: 0, duration: 0.5, ease: "power1.out" });
      gsap.fromTo(
        el,
        { x: r.left, y: r.top, scaleX: r.width / vw, scaleY: r.height / vh, transformOrigin: "0 0", borderRadius: 10, autoAlpha: 1 },
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          borderRadius: 0,
          autoAlpha: 1,
          duration: 1.6,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(el, { clearProps: "transform,transformOrigin,borderRadius,opacity,visibility" });
            sec.style.zIndex = "";
            gsap.set(root.current, { autoAlpha: 0 });
            finish();
          },
        },
      );
    };
    tl.current = gsap
      .timeline()
      .to(hint.current, { autoAlpha: 0, duration: 0.2 })
      .to(sealL.current, { x: -26, y: 34, rotate: -28, autoAlpha: 0, duration: 0.55, ease: "power2.in" }, 0.05)
      .to(sealR.current, { x: 26, y: 38, rotate: 30, autoAlpha: 0, duration: 0.55, ease: "power2.in" }, 0.05)
      .to(flap.current, { rotateX: 180, duration: 0.7, ease: "power2.inOut" }, 0.25)
      .set([flapWrap.current, flap.current], { zIndex: 1 }, 0.6)
      .to(".open-fade", { autoAlpha: 0, duration: 0.4 }, 0.6)
      // the blue card slides slowly up out of the envelope…
      .set(card.current, { autoAlpha: 1 }, 0.7)
      .to(card.current, { yPercent: -62, duration: 1.5, ease: "power2.out" }, 0.75)
      // …and grows into the hero
      .add(grow, 2.35);
  }, [busy, reduced, startMusic, playSfx, onReveal, finish]);

  const initials = `${couple.bride.name[0]}&${couple.groom.name[0]}`;

  return (
    <div
      ref={root}
      className="cobalt fixed inset-0 z-[100] flex touch-none select-none flex-col items-center justify-center overflow-hidden px-gutter"
      role="dialog"
      aria-modal="true"
      aria-label="Wedding invitation"
    >
      {wedding.invocation && <p className="open-fade text-[0.8rem] tracking-[0.3em] text-[#f3cf73]">{wedding.invocation}</p>}
      <p className="open-fade mt-2 font-script text-[clamp(2.2rem,10vw,3.2rem)] leading-none text-[#fbf2dc]">Welcome to {city}</p>

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
          {/* the blue card inside, with the couple's names: it slides up out of the envelope and grows into the hero */}
          <div ref={card} className="open-card invisible absolute inset-x-4 bottom-3 top-[6%] z-10">
            <span className="open-card-names">
              {couple.bride.name}
              <span className="open-card-amp">&amp;</span>
              {couple.groom.name}
            </span>
          </div>
          {/* front pocket */}
          <div
            className="pointer-events-none absolute inset-0 z-20 rounded-md"
            style={{
              background:
                "linear-gradient(to top right, #ecdcb8 49.6%, transparent 50%) left bottom / 51% 100% no-repeat, linear-gradient(to top left, #ecdcb8 49.6%, transparent 50%) right bottom / 51% 100% no-repeat, linear-gradient(to top, #f0e2c2 0 46%, transparent 46%)",
            }}
          />
          {/* addressed to the guest */}
          <p className="pointer-events-none absolute inset-x-0 bottom-[9%] z-[22] text-center font-script text-[clamp(1.5rem,6.5vw,2rem)] leading-none text-maroon">
            Dear {guestName}
          </p>
          {/* flap, hinged at the top edge, with the wax seal */}
          <div ref={flapWrap} className="absolute inset-0 z-[25] [transform-style:preserve-3d]">
            <div
              ref={flap}
              className="absolute inset-x-0 top-0 h-[58%] origin-top"
              style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "linear-gradient(to bottom, #e3cf9f, #d6bd88)" }}
            />
            {/* the wax seal, as two pieces that crack apart */}
            {[
              { ref: sealL, clip: "polygon(0 0, 54% 0, 47% 38%, 55% 60%, 46% 100%, 0 100%)" },
              { ref: sealR, clip: "polygon(54% 0, 100% 0, 100% 100%, 46% 100%, 55% 60%, 47% 38%)" },
            ].map(({ ref, clip }, i) => (
              <span key={i} ref={ref} className="absolute left-1/2 top-[58%] -ml-8 -mt-8 block h-16 w-16">
                <span
                  className="grid h-full w-full place-items-center bg-[#9e2f28] font-script text-[1.45rem] text-[#fbe9c8] shadow-[inset_0_-3px_6px_rgb(0_0_0/0.25),inset_0_2px_3px_rgb(255_255_255/0.2)]"
                  style={{ borderRadius: "48% 52% 50% 50% / 52% 48% 52% 48%", clipPath: clip }}
                >
                  {initials}
                </span>
              </span>
            ))}
          </div>
        </div>
      </button>

      <p ref={hint} className="open-fade mt-7 text-[0.74rem] font-bold uppercase tracking-[0.3em] text-[#fbf2dc]">
        {opening.tapLabel}
      </p>

    </div>
  );
}
