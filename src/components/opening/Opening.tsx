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
  /** Kept for laptop layout. */
  desktop?: boolean;
}

const POCKET = "h-[14rem] sm:h-[15.5rem]";

/** Synthesizes the sacred resonant chime of a South Indian temple bronze bell */
function playTempleBellChime() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    if (ctx.state === "suspended") void ctx.resume();

    // Harmonics of a bronze temple bell (Ghanta)
    const bellFrequencies = [520, 1040, 1560, 2080, 2600, 3120];
    const bellGains = [0.45, 0.35, 0.22, 0.15, 0.09, 0.05];
    const t0 = ctx.currentTime;

    bellFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, t0);

      // Strike attack
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(bellGains[idx] * 0.45, t0 + 0.02);
      // Exponential resonant decay
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 3.2);
    });
  } catch {
    // Audio context not available or blocked
  }
}

/** Flickering Brass Diya beside the envelope */
function EnvelopeDiya({ side }: { side: "left" | "right" }) {
  return (
    <div className={`envelope-diya envelope-diya-${side}`} aria-hidden="true">
      <div className="env-diya-flame-wrap">
        <span className="env-diya-flame" />
        <span className="env-diya-glow" />
      </div>
      <svg viewBox="0 0 36 20" className="env-diya-bowl">
        <path d="M4 8 Q 18 19 32 8 Q 30 14 18 16 Q 6 14 4 8 Z" fill="#d4a753" stroke="#8a6420" strokeWidth="0.8" />
        <ellipse cx="18" cy="8" rx="14" ry="4" fill="#a67c2e" stroke="#8a6420" strokeWidth="0.8" />
        <ellipse cx="18" cy="7.5" rx="12" ry="3" fill="#664614" />
      </svg>
    </div>
  );
}

/** Slow falling jasmine and marigold petals across the screen */
function FloatingPetals() {
  const petals = [
    { left: "10%", delay: "0s", duration: "10s", size: "15px", type: "jasmine" },
    { left: "25%", delay: "3s", duration: "12s", size: "18px", type: "marigold" },
    { left: "42%", delay: "1.5s", duration: "11s", size: "14px", type: "jasmine" },
    { left: "58%", delay: "5s", duration: "13s", size: "20px", type: "marigold" },
    { left: "75%", delay: "2s", duration: "10.5s", size: "16px", type: "jasmine" },
    { left: "88%", delay: "4s", duration: "12.5s", size: "19px", type: "marigold" },
  ];

  return (
    <div className="envelope-petals-wrap" aria-hidden="true">
      {petals.map((p, idx) => (
        <span
          key={idx}
          className={`fam-falling-petal ${p.type === "marigold" ? "petal-marigold" : "petal-jasmine"}`}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
}

export function Opening({ onReveal, onDone }: OpeningProps) {
  const { couple, loveStory } = useWedding();
  const city = loveStory?.livesOn.city ?? "Madurai";
  const { guestName } = useGuest();
  const { muted, toggle: toggleAudio, start: startMusic, playSfx } = useAudio();
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
  const doorL = useRef<HTMLDivElement>(null);
  const doorR = useRef<HTMLDivElement>(null);
  const finished = useRef(false);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Lock scroll while the overlay is mounted
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

  // Entrance animation
  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from(env.current, { y: -45, rotate: -3, autoAlpha: 0, duration: 1.15, ease: "power3.out", delay: 0.15 });
      gsap.from(".open-fade", { autoAlpha: 0, y: 12, duration: 0.85, stagger: 0.12, delay: 0.45 });
      gsap.to(hint.current, { opacity: 0.55, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.3 });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const begin = useCallback(() => {
    if (busy || finished.current) return;
    setBusy(true);

    // Audio chime & music start
    if (!muted) {
      playTempleBellChime();
    }
    startMusic();
    playSfx("door");

    if (reduced) {
      onReveal();
      gsap.to(root.current, { autoAlpha: 0, duration: 0.5, onComplete: finish });
      return;
    }

    gsap.killTweensOf(hint.current);

    const hero = () => document.querySelector<HTMLElement>("#invitation-hero .sticky");
    const heroSec = () => hero()?.closest<HTMLElement>(".sec") ?? null;

    const grow = () => {
      onReveal(); // scrolls to top and activates hero entrance
      const el = hero();
      const sec = heroSec();
      if (!el || !sec) return;

      const r = card.current!.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      sec.style.zIndex = "200";

      // Fade out the envelope shell
      gsap.to(env.current, { autoAlpha: 0, duration: 0.5, ease: "power1.out" });

      // Gopuram doors swing open outwards revealing the invitation
      gsap.to(doorL.current, { rotateY: -105, duration: 1.3, ease: "power2.inOut" });
      gsap.to(doorR.current, { rotateY: 105, duration: 1.3, ease: "power2.inOut" });

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
      // Seal cracks apart
      .to(sealL.current, { x: -30, y: 36, rotate: -28, autoAlpha: 0, duration: 0.55, ease: "power2.in" }, 0.05)
      .to(sealR.current, { x: 30, y: 40, rotate: 30, autoAlpha: 0, duration: 0.55, ease: "power2.in" }, 0.05)
      // Flap swings open
      .to(flap.current, { rotateX: 180, duration: 0.75, ease: "power2.inOut" }, 0.25)
      .set([flapWrap.current, flap.current], { zIndex: 1 }, 0.6)
      .to(".open-fade", { autoAlpha: 0, duration: 0.4 }, 0.6)
      // Golden card slides smoothly upward
      .set(card.current, { autoAlpha: 1 }, 0.7)
      .to(card.current, { yPercent: -62, duration: 1.5, ease: "power2.out" }, 0.75)
      // Gopuram doors swing open and card grows into hero
      .add(grow, 2.35);
  }, [busy, reduced, muted, startMusic, playSfx, onReveal, finish]);

  return (
    <div
      ref={root}
      className="envelope-screen fixed inset-0 z-[100] flex touch-none select-none flex-col items-center justify-center overflow-hidden px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Wedding invitation envelope"
    >
      {/* Background Gopuram Silhouette at dusk */}
      <div className="envelope-gopuram-bg" aria-hidden="true" />
      <div className="envelope-radial-glow" aria-hidden="true" />

      {/* Falling jasmine & marigold petals */}
      <FloatingPetals />

      {/* Mango-leaf Toran & Marigold Garland across top */}
      <div className="envelope-top-decor" aria-hidden="true">
        <img
          src="/media/toran.webp"
          alt=""
          className="envelope-toran-img"
          draggable={false}
        />
        <div className="envelope-toran-garland" />
      </div>

      {/* Audio Mute/Unmute Toggle Button */}
      <button
        type="button"
        onClick={toggleAudio}
        className="envelope-mute-btn"
        aria-label={muted ? "Unmute audio" : "Mute audio"}
      >
        {muted ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

      {/* Top Header Text */}
      <p
        className="open-fade text-[0.88rem] tracking-[0.22em] font-semibold text-[#f3cf73] text-center"
        style={{ fontFamily: "'Noto Serif Tamil', serif" }}
      >
        திருமண அழைப்பிதழ்
      </p>

      <h1 className="open-fade mt-1 text-center font-script text-[clamp(2.5rem,10.5vw,3.7rem)] leading-none text-[#ffe7a8] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
        Welcome to {city}
      </h1>

      <p
        className="open-fade mt-1 text-[0.92rem] tracking-[0.1em] font-medium text-[#ffd36b] text-center"
        style={{ fontFamily: "'Noto Serif Tamil', serif" }}
      >
        மதுரைக்கு வரவேற்கிறோம்
      </p>

      {/* Envelope Interactive Button */}
      <button
        type="button"
        onClick={begin}
        disabled={busy}
        aria-label="Tap to open the invitation"
        className="envelope-btn relative mt-7 block w-full max-w-[21.5rem] cursor-pointer outline-none [perspective:1200px] focus-visible:ring-2 focus-visible:ring-[#ffd36b] md:max-w-[24.5rem]"
      >
        {/* Flanking Flickering Diyas */}
        <EnvelopeDiya side="left" />
        <EnvelopeDiya side="right" />

        <div ref={env} className={`relative w-full ${POCKET}`}>
          {/* Back of the envelope: Deep maroon silk with gold zari border */}
          <div className="absolute inset-0 rounded-lg border-2 border-[#d4a753] bg-gradient-to-b from-[#4e0c18] via-[#3d0913] to-[#25040a] shadow-[0_24px_55px_rgba(0,0,0,0.8),0_0_24px_rgba(212,167,83,0.25)]" />

          {/* The Gold/Parchment Card inside with couple names (slides up out of envelope) */}
          <div ref={card} className="open-card invisible absolute inset-x-4 bottom-3 top-[6%] z-10">
            <span className="open-card-names">
              {couple.bride.name}
              <span className="open-card-amp">&amp;</span>
              {couple.groom.name}
            </span>
          </div>

          {/* Front pocket: Maroon silk with embossed gold kolam pattern and gold zari trim */}
          <div className="envelope-front-pocket pointer-events-none absolute inset-0 z-20 rounded-lg">
            {/* Subtle center gold kolam medallion watermark */}
            <div className="envelope-kolam-watermark" aria-hidden="true" />
          </div>

          {/* Personalized "Dear {name}" in gold foil script */}
          <p className="pointer-events-none absolute inset-x-0 bottom-[8.5%] z-[22] text-center font-script text-[clamp(1.7rem,6.8vw,2.3rem)] leading-none text-[#ffe399] drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] [text-shadow:0_0_12px_rgba(255,215,110,0.4)]">
            Dear {guestName}
          </p>

          {/* Flap hinged at the top edge with the wax seal */}
          <div ref={flapWrap} className="absolute inset-0 z-[25] [transform-style:preserve-3d]">
            <div
              ref={flap}
              className="envelope-flap absolute inset-x-0 top-0 h-[58%] origin-top"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                background: "linear-gradient(to bottom, #540c1a 0%, #3a0812 85%, #2a040b 100%)",
              }}
            >
              {/* Gold zari piping on the triangular flap */}
              <div className="envelope-flap-piping" />
            </div>

            {/* Wax Seal: Medallion with fitted "M & K" monogram and breathing glow */}
            {[
              { ref: sealL, clip: "polygon(0 0, 53% 0, 46% 38%, 54% 62%, 46% 100%, 0 100%)" },
              { ref: sealR, clip: "polygon(53% 0, 100% 0, 100% 100%, 46% 100%, 54% 62%, 46% 38%)" },
            ].map(({ ref, clip }, i) => (
              <span key={i} ref={ref} className="absolute left-1/2 top-[58%] -ml-9 -mt-9 block h-[4.5rem] w-[4.5rem]">
                <span
                  className="envelope-seal-half grid h-full w-full place-items-center"
                  style={{ clipPath: clip }}
                >
                  <span className="envelope-seal-inner">
                    <span className="envelope-monogram">M &amp; K</span>
                  </span>
                </span>
              </span>
            ))}
          </div>
        </div>
      </button>

      {/* "Tap to Open" breathing golden hint */}
      <p ref={hint} className="open-fade mt-7 text-[0.85rem] font-bold uppercase tracking-[0.35em] text-[#ffe08a] envelope-tap-hint">
        TAP TO OPEN
      </p>

      {/* Gopuram Doors that swing open during the transition into the main invitation */}
      <div className="envelope-doors-overlay pointer-events-none fixed inset-0 z-[150] [perspective:1400px]">
        <div
          ref={doorL}
          className="envelope-door envelope-door-left absolute inset-y-0 left-0 w-1/2 origin-left"
          style={{
            backgroundImage: "url('/media/temple-events-bg.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center left",
          }}
        >
          <div className="envelope-door-zari-l" />
        </div>
        <div
          ref={doorR}
          className="envelope-door envelope-door-right absolute inset-y-0 right-0 w-1/2 origin-right"
          style={{
            backgroundImage: "url('/media/temple-events-bg.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center right",
          }}
        >
          <div className="envelope-door-zari-r" />
        </div>
      </div>
    </div>
  );
}
