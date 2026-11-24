import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useWedding } from "@/context/WeddingContext";
import { useGuest } from "@/context/GuestContext";
import { useAudio } from "@/context/AudioContext";
import { SoundIcon } from "@/components/layout/MusicToggle";
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

/* the envelope's drawing space: 336 × 216 (it keeps this shape at every size) */
const W = 336;
const H = 216;
const FLAP_H = 124; // the flap's tip, measured from the top
const MEET = 118; // where the two side flaps meet

/* a few gold stars twinkling in the sky around the envelope: [left %, top %, size px, delay s] */
const STARS: [number, number, number, number][] = [
  [9, 24, 10, 0],
  [86, 21, 12, 1.1],
  [16, 70, 9, 2.2],
  [80, 74, 11, 0.6],
  [6, 46, 7, 1.7],
  [93, 50, 8, 2.8],
  [30, 88, 8, 1.4],
  [68, 90, 9, 0.3],
  [50, 16, 7, 2.4],
];

/* gold sparks that burst out of the seal when it cracks: [angle deg, distance px] */
const SPARKS = Array.from({ length: 14 }, (_, i) => [i * (360 / 14) + (i % 2 ? 9 : 0), i % 3 === 0 ? 92 : i % 3 === 1 ? 70 : 54] as const);

/** Shared gold gradients and the silk + liner fills, used by every part of the envelope. */
function EnvelopeDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <linearGradient id="op-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.28" stopColor="#e7bf5c" />
          <stop offset="0.55" stopColor="#a9762a" />
          <stop offset="0.78" stopColor="#f3d27a" />
          <stop offset="1" stopColor="#b8862f" />
        </linearGradient>
        <linearGradient id="op-silk-l" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#6e0f1f" />
          <stop offset="0.55" stopColor="#8d1a2c" />
          <stop offset="1" stopColor="#5c0b19" />
        </linearGradient>
        <linearGradient id="op-silk-r" x1="1" y1="0" x2="0" y2="0.6">
          <stop offset="0" stopColor="#6a0e1d" />
          <stop offset="0.55" stopColor="#861829" />
          <stop offset="1" stopColor="#560a17" />
        </linearGradient>
        <linearGradient id="op-silk-b" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#9a2033" />
          <stop offset="0.45" stopColor="#7c1425" />
          <stop offset="0.7" stopColor="#931d30" />
          <stop offset="1" stopColor="#600c1b" />
        </linearGradient>
        <linearGradient id="op-silk-f" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#a4243a" />
          <stop offset="0.5" stopColor="#821628" />
          <stop offset="1" stopColor="#6a0f1f" />
        </linearGradient>
        {/* the paper lining inside the envelope: ivory with a gold kolam lattice */}
        <pattern id="op-liner" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#f6e6bd" />
          <path d="M8 0 16 8 8 16 0 8Z" fill="none" stroke="#c99a45" strokeWidth="0.7" strokeOpacity="0.75" />
          <circle cx="8" cy="8" r="1.6" fill="#b5852f" />
          <circle cx="0" cy="0" r="1" fill="#c99a45" />
          <circle cx="16" cy="16" r="1" fill="#c99a45" />
        </pattern>
        {/* a fine woven sheen on the silk */}
        <pattern id="op-weave" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <path d="M0 0V5" stroke="#fff" strokeOpacity="0.05" strokeWidth="1.2" />
        </pattern>
        {/* the temple (gopuram) border woven along the bottom */}
        <pattern id="op-temple" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 11 6 3 12 11Z" fill="url(#op-gold)" />
          <circle cx="6" cy="8.4" r="1.3" fill="#5a0a17" />
        </pattern>
        <radialGradient id="op-seal" cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#fff6cf" />
          <stop offset="0.35" stopColor="#efc865" />
          <stop offset="0.75" stopColor="#b6842f" />
          <stop offset="1" stopColor="#8a5d1c" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** A scalloped gold-foil seal with the couple's initials. */
function Seal({ initials }: { initials: string }) {
  // 18 soft scallops around the edge
  const n = 18;
  const p = (r: number, t: number) => `${(50 + r * Math.cos(t)).toFixed(2)} ${(50 + r * Math.sin(t)).toFixed(2)}`;
  const ring = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const a2 = ((i + 0.5) / n) * Math.PI * 2;
    const a3 = ((i + 1) / n) * Math.PI * 2;
    return `${i === 0 ? `M${p(46, a)} ` : ""}Q${p(53, a2)} ${p(46, a3)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="block h-full w-full" aria-hidden>
      <circle cx="50" cy="53" r="47" fill="#2a0208" fillOpacity="0.35" />
      <path d={`${ring} Z`} fill="url(#op-seal)" stroke="#7a5216" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="37" fill="none" stroke="#8a5d1c" strokeWidth="1.2" strokeOpacity="0.8" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#fff2c4" strokeWidth="0.8" strokeOpacity="0.7" strokeDasharray="0.1 3.2" strokeLinecap="round" />
      <text x="50" y="61" textAnchor="middle" fontFamily="Great Vibes, cursive" fontSize="25" fill="#6a0f1f">
        {initials}
      </text>
    </svg>
  );
}

/**
 * The first thing a guest sees: "Welcome to <city>"
 * on the hero's cobalt sky and a maroon Kanjeevaram-silk envelope with gold zari
 * edges and a gold-foil seal, addressed to the guest. Tap → gold sparks burst,
 * the seal cracks into two, the flap swings open on its gold-lined back, the card
 * rises slowly out (a blue card with the couple's names), then grows to fill the
 * screen and becomes the hero's sky. Reduced motion → a simple fade.
 */
export function Opening({ onReveal, onDone }: OpeningProps) {
  const { couple, wedding, opening, loveStory } = useWedding();
  const city = loveStory?.livesOn.city ?? wedding.city.split(",")[0];
  const { guestName } = useGuest();
  const { start: startMusic, toggle: toggleSound, playSfx, hasSound, hasMusic, muted, playing } = useAudio();
  const soundOn = hasMusic ? playing : !muted;
  const reduced = usePrefersReducedMotion();
  const [busy, setBusy] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const env = useRef<HTMLDivElement>(null);
  const flapWrap = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const sealL = useRef<HTMLSpanElement>(null);
  const sealR = useRef<HTMLSpanElement>(null);
  const sparks = useRef<(HTMLSpanElement | null)[]>([]);
  const card = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const ctrls = useRef<HTMLDivElement>(null);
  const finished = useRef(false);
  const revealed = useRef(false);
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
      gsap.to(hint.current, { opacity: 0.6, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.4 });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const reveal = useCallback(() => {
    if (revealed.current) return;
    revealed.current = true;
    onReveal();
  }, [onReveal]);

  const begin = useCallback(() => {
    if (busy || finished.current) return;
    setBusy(true);
    startMusic();
    if (reduced) {
      playSfx("bell", { volume: 0.7 });
      reveal();
      gsap.to(root.current, { autoAlpha: 0, duration: 0.5, onComplete: finish });
      return;
    }
    // the seal cracks with a little burst of gold sparkle
    playSfx("seal");
    playSfx("shimmer", { delay: 0.03, volume: 0.8 });
    gsap.killTweensOf(hint.current);
    // the seal cracks into two pieces and the flap opens; then the
    // hero itself — temple, names and sky — grows smoothly out of the card to fill the screen,
    // and the page carries on from there as normal
    const hero = () => document.querySelector<HTMLElement>("#invitation-hero .sticky");
    const heroSec = () => hero()?.closest<HTMLElement>(".sec") ?? null;
    const grow = () => {
      reveal(); // scrolls to the top and starts the hero's text entrance
      const el = hero();
      const sec = heroSec();
      if (!el || !sec) return;
      // it starts exactly where the blue card stands, half out of the envelope, and grows from there
      const r = card.current!.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      sec.style.zIndex = "200"; // above this overlay while it grows
      gsap.to([env.current, ".op-shadow", ctrls.current], { autoAlpha: 0, duration: 0.5, ease: "power1.out" });
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
    const sp = sparks.current.filter(Boolean) as HTMLSpanElement[];
    tl.current = gsap
      .timeline()
      .to(hint.current, { autoAlpha: 0, duration: 0.2 })
      // a burst of gold sparks from the seal
      .fromTo(
        sp,
        { x: 0, y: 0, scale: 0.2, autoAlpha: 1 },
        {
          x: (i) => Math.cos((SPARKS[i][0] * Math.PI) / 180) * SPARKS[i][1],
          y: (i) => Math.sin((SPARKS[i][0] * Math.PI) / 180) * SPARKS[i][1],
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
        },
        0,
      )
      .to(sp, { autoAlpha: 0, scale: 0.4, duration: 0.45, ease: "power1.in" }, 0.45)
      .to(sealL.current, { x: -30, y: 40, rotate: -32, autoAlpha: 0, duration: 0.6, ease: "power2.in" }, 0.08)
      .to(sealR.current, { x: 30, y: 44, rotate: 34, autoAlpha: 0, duration: 0.6, ease: "power2.in" }, 0.08)
      .to(flap.current, { rotateX: 180, duration: 0.75, ease: "power2.inOut" }, 0.28)
      .set([flapWrap.current, flap.current], { zIndex: 1 }, 0.66)
      .to(".open-fade", { autoAlpha: 0, duration: 0.4 }, 0.6)
      // the blue card slides slowly up out of the envelope…
      .set(card.current, { autoAlpha: 1 }, 0.72)
      .to(card.current, { yPercent: -62, duration: 1.5, ease: "power2.out" }, 0.78)
      // …and grows into the hero
      .add(grow, 2.4)
      // sounds, each on its moment: the flap lifts, the card slides out, rises into the sky, a temple bell welcomes
      .call(() => playSfx("rustle"), undefined, 0.24)
      .call(() => playSfx("slide", { volume: 0.85 }), undefined, 0.8)
      .call(() => playSfx("rise", { volume: 0.9 }), undefined, 2.3)
      .call(() => playSfx("bell", { volume: 0.75 }), undefined, 3.75);
  }, [busy, reduced, startMusic, playSfx, reveal, finish]);

  /** Skip the envelope: straight to the invitation (music still starts, unless sound is off). */
  const skip = useCallback(() => {
    if (finished.current) return;
    startMusic();
    setBusy(true);
    tl.current?.kill();
    const el = document.querySelector<HTMLElement>("#invitation-hero .sticky");
    const sec = el?.closest<HTMLElement>(".sec");
    if (el) {
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform,transformOrigin,borderRadius,opacity,visibility" });
    }
    if (sec) sec.style.zIndex = "";
    reveal();
    gsap.to(root.current, { autoAlpha: 0, duration: 0.45, ease: "power1.out", onComplete: finish });
  }, [startMusic, reveal, finish]);

  const initials = `${couple.bride.name[0]}&${couple.groom.name[0]}`;

  return (
    <div
      ref={root}
      className="op-screen cobalt fixed inset-0 z-[100] flex touch-none select-none flex-col items-center justify-center overflow-hidden px-gutter"
      role="dialog"
      aria-modal="true"
      aria-label="Wedding invitation"
    >
      <EnvelopeDefs />
      {/* soft vignette and a warm glow behind the envelope */}
      <div aria-hidden className="op-vignette" />
      {/* gold stars twinkling in the sky */}
      {STARS.map(([l, t, s, d], i) => (
        <span key={i} aria-hidden className="op-star" style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, animationDelay: `${d}s` }} />
      ))}

      {/* top right: sound on/off and skip */}
      <div ref={ctrls} className="op-ctrls">
        {hasSound && (
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Turn sound off" : "Play music"}
            title={soundOn ? "Sound off" : "Play music"}
            className="op-ctrl op-ctrl--sound"
          >
            <SoundIcon on={soundOn} />
          </button>
        )}
        <button type="button" onClick={skip} className="op-ctrl op-ctrl--skip" aria-label="Skip the envelope and open the invitation">
          Skip
          <svg viewBox="0 0 16 16" aria-hidden className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3.5 7.5 8 3 12.5M8.5 3.5 13 8l-4.5 4.5" />
          </svg>
        </button>
      </div>

      {wedding.invocation && <p className="open-fade relative text-[0.8rem] tracking-[0.3em] text-[#f3cf73]">{wedding.invocation}</p>}
      <p className="open-fade relative mt-2 font-script text-[clamp(2.3rem,10.5vw,3.3rem)] leading-none text-[#fbf2dc]">Welcome to {city}</p>
      <svg aria-hidden viewBox="0 0 220 18" className="open-fade relative mt-2 h-[14px] w-[190px]">
        <path d="M2 9H88M132 9H218" stroke="#e2b553" strokeWidth="1.2" />
        <circle cx="94" cy="9" r="1.8" fill="#f3cf73" />
        <circle cx="126" cy="9" r="1.8" fill="#f3cf73" />
        <path d="M110 1.5 116 9 110 16.5 104 9Z" fill="url(#op-gold)" />
      </svg>

      <button
        type="button"
        onClick={begin}
        disabled={busy}
        aria-label={`${opening.tapLabel} — open the invitation`}
        className="relative mt-7 block w-full max-w-[21rem] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#f3cf73] md:max-w-[24rem]"
      >
        <div className={busy ? "" : "op-float"}>
          <div ref={env} className="op-env relative aspect-[14/9] w-full [perspective:1100px]">
            {/* back of the envelope: maroon silk, lined inside with ivory and gold */}
            <div className="op-back absolute inset-0">
              <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-[3.5%] h-[93%] w-[93%]" preserveAspectRatio="none" aria-hidden>
                <rect width={W} height={H} rx="6" fill="url(#op-liner)" />
                <rect x="1" y="1" width={W - 2} height={H - 2} rx="6" fill="none" stroke="url(#op-gold)" strokeWidth="2" />
              </svg>
            </div>

            {/* the blue card inside, with the couple's names: it slides up out of the envelope and grows into the hero */}
            <div ref={card} className="open-card invisible absolute inset-x-[6%] bottom-[5%] top-[7%] z-10">
              <span className="open-card-names">
                {couple.bride.name}
                <span className="open-card-amp">&amp;</span>
                {couple.groom.name}
              </span>
            </div>

            {/* front pocket: two side flaps and the bottom flap, edged in gold zari, a temple border along the hem */}
            <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible" aria-hidden>
              <path d={`M0 0 L${W / 2 + 2} ${MEET} L0 ${H} Z`} fill="url(#op-silk-l)" />
              <path d={`M${W} 0 L${W / 2 - 2} ${MEET} L${W} ${H} Z`} fill="url(#op-silk-r)" />
              <path d={`M0 0 L${W / 2} ${MEET} L${W} 0`} fill="none" stroke="url(#op-gold)" strokeWidth="1.4" strokeOpacity="0.9" />
              <path d={`M0 ${H} L${W / 2} ${MEET - 8} L${W} ${H} Z`} fill="url(#op-silk-b)" />
              <path d={`M0 ${H} L${W / 2} ${MEET - 8} L${W} ${H} Z`} fill="url(#op-weave)" />
              <path d={`M0 0 L${W / 2 + 2} ${MEET} L0 ${H} Z M${W} 0 L${W / 2 - 2} ${MEET} L${W} ${H} Z`} fill="url(#op-weave)" />
              {/* gold zari: a bold line, a fine line and a row of beads along the bottom flap */}
              <path d={`M0 ${H} L${W / 2} ${MEET - 8} L${W} ${H}`} fill="none" stroke="url(#op-gold)" strokeWidth="2.4" />
              <path d={`M18 ${H} L${W / 2} ${MEET + 2} L${W - 18} ${H}`} fill="none" stroke="#e9c46a" strokeWidth="0.8" strokeOpacity="0.85" />
              <path d={`M34 ${H} L${W / 2} ${MEET + 11} L${W - 34} ${H}`} fill="none" stroke="#f3d27a" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="0 7" />
              {/* the temple border woven along the hem */}
              <rect x="0" y={H - 20} width={W} height="20" fill="#4d0815" />
              <rect x="0" y={H - 18} width={W} height="12" fill="url(#op-temple)" />
              <path d={`M0 ${H - 20.5} H${W} M0 ${H - 4.5} H${W}`} stroke="#e2b553" strokeWidth="1.6" />
              {/* outer gold edge (sides and hem; the top edge is the flap's) */}
              <path d={`M0.8 0 V${H - 10} Q0.8 ${H - 0.8} 10 ${H - 0.8} H${W - 10} Q${W - 0.8} ${H - 0.8} ${W - 0.8} ${H - 10} V0`} fill="none" stroke="#e2b553" strokeWidth="1.6" />
            </svg>
            {/* gold filigree in the two lower corners */}
            <img src="/media/gold-corner.webp" alt="" aria-hidden className="op-corner op-corner--l" draggable={false} />
            <img src="/media/gold-corner.webp" alt="" aria-hidden className="op-corner op-corner--r" draggable={false} />
            {/* addressed to the guest */}
            <p className="op-dear pointer-events-none absolute inset-x-0 bottom-[14%] z-[22] text-center font-script leading-none">Dear {guestName}</p>

            {/* the flap, hinged at the top edge: maroon silk in front, the gold-lined paper behind */}
            <div ref={flapWrap} className="absolute inset-0 z-[25] [transform-style:preserve-3d]">
              <div ref={flap} className="op-flap absolute inset-x-0 top-0 origin-top" style={{ height: `${(FLAP_H / H) * 100}%` }}>
                <svg viewBox={`0 0 ${W} ${FLAP_H}`} preserveAspectRatio="none" className="op-face absolute inset-0 h-full w-full overflow-visible" aria-hidden>
                  <path d={`M0 0 H${W} L${W / 2} ${FLAP_H} Z`} fill="url(#op-silk-f)" />
                  <path d={`M0 0 H${W} L${W / 2} ${FLAP_H} Z`} fill="url(#op-weave)" />
                  <path d={`M0 0 L${W / 2} ${FLAP_H} L${W} 0`} fill="none" stroke="url(#op-gold)" strokeWidth="2.4" />
                  <path d={`M0 0.8 H${W}`} stroke="#e2b553" strokeWidth="1.6" />
                  <path d={`M20 0 L${W / 2} ${FLAP_H - 13} L${W - 20} 0`} fill="none" stroke="#e9c46a" strokeWidth="0.8" strokeOpacity="0.85" />
                  <path d={`M38 0 L${W / 2} ${FLAP_H - 25} L${W - 38} 0`} fill="none" stroke="#f3d27a" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="0 7" />
                </svg>
                <svg viewBox={`0 0 ${W} ${FLAP_H}`} preserveAspectRatio="none" className="op-face op-face--back absolute inset-0 h-full w-full" aria-hidden>
                  <path d={`M0 ${FLAP_H} H${W} L${W / 2} 0 Z`} fill="url(#op-liner)" />
                  <path d={`M0 ${FLAP_H} L${W / 2} 0 L${W} ${FLAP_H}`} fill="none" stroke="url(#op-gold)" strokeWidth="2.4" />
                </svg>
              </div>
              {/* a soft gold pulse inviting the tap */}
              {!busy && <span aria-hidden className="op-pulse" />}
              {/* the seal, as two pieces that crack apart */}
              {[
                { ref: sealL, clip: "polygon(0 0, 54% 0, 47% 38%, 55% 60%, 46% 100%, 0 100%)" },
                { ref: sealR, clip: "polygon(54% 0, 100% 0, 100% 100%, 46% 100%, 55% 60%, 47% 38%)" },
              ].map(({ ref, clip }, i) => (
                <span key={i} ref={ref} className="op-seal" style={{ clipPath: clip }}>
                  <Seal initials={initials} />
                </span>
              ))}
              {/* the sparks (hidden until the tap) */}
              {SPARKS.map((_, i) => (
                <span key={i} ref={(el) => void (sparks.current[i] = el)} aria-hidden className="op-spark invisible" />
              ))}
            </div>
          </div>
        </div>
        {/* the envelope's soft shadow on the "ground" */}
        <span aria-hidden className="op-shadow" />
      </button>

      <p ref={hint} className="open-fade op-hint relative mt-8">
        {opening.tapLabel}
      </p>
    </div>
  );
}
