import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { KB_BAND, KB_BAND_DOTS, KB_CAP, KB_CAP_DOTS, KB_END, KB_END_DOTS, KB_HEADS, KB_UNIT, KB_UNIT_DOTS } from "./kolamBorderData";

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
/** A stable pseudo-random 0–1 per index, so the twinkles don't change on every render. */
const r01 = (i: number, k = 1) => {
  const x = Math.sin(i * 12.9898 * k + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** One piece of white kolam art, with its gold twin laid exactly over it (shown when lit). */
function Art({ name, className = "", style }: { name: string; className?: string; style?: CSSProperties }) {
  return (
    <span className={`kb-art ${className}`} style={style}>
      <img src={`/media/${name}.webp`} alt="" draggable={false} />
      <img src={`/media/${name}-gold.webp`} alt="" draggable={false} className="kb-gold" />
    </span>
  );
}

function Twinkles({ dots, w, h, seed }: { dots: readonly (readonly [number, number])[]; w: number; h: number; seed: number }) {
  return (
    <>
      {dots.map(([x, y], i) => (
        <span
          key={i}
          className="kb-twinkle"
          style={{ left: pct(x, w), top: pct(y, h), animationDelay: `${(-r01(i, seed) * 6).toFixed(2)}s`, animationDuration: `${(3 + r01(i, seed + 3) * 3).toFixed(2)}s` }}
        />
      ))}
    </>
  );
}

/** The bird band: two pairs of kolam birds facing a centre diamond, teardrops hanging below. The birds nod now and then. */
export function KolamBand({ className = "" }: { className?: string }) {
  return (
    <span className={`kb-band ${className}`} style={{ aspectRatio: `${KB_BAND.w} / ${KB_BAND.h}` }}>
      <Art name="kb-band" className="kb-fill" />
      {KB_HEADS.map((hd, k) => (
        <span
          key={k}
          className="kb-head"
          style={{ left: pct(hd.x - hd.r, KB_BAND.w), top: pct(hd.y - hd.r, KB_BAND.h), width: pct(hd.r * 2, KB_BAND.w), height: pct(hd.r * 2, KB_BAND.h), animationDelay: `${k * 1.3 + (k % 2) * 0.4}s` }}
        >
          <Art name={`kb-head-${k}`} className="kb-fill" />
        </span>
      ))}
      <Twinkles dots={KB_BAND_DOTS} w={KB_BAND.w} h={KB_BAND.h} seed={1} />
    </span>
  );
}

/** A vertical chain kolam: a looped square, then as many more as fit the height, ending in a cross and a teardrop. */
function KolamChain({ height, width, side }: { height: number; width: number; side: "l" | "r" }) {
  const k = width / KB_UNIT.w;
  const capH = KB_CAP.h * k, unitH = KB_UNIT.h * k, endH = KB_END.h * k;
  const n = Math.max(1, Math.floor((height - capH - endH) / unitH));
  return (
    <span className={`kb-chain kb-chain--${side}`} style={{ width }}>
      <span className="kb-link" style={{ height: capH }}>
        <Art name="kb-cap" className="kb-fill" />
        <Twinkles dots={KB_CAP_DOTS} w={KB_CAP.w} h={KB_CAP.h} seed={2} />
      </span>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="kb-link" style={{ height: unitH }}>
          <Art name="kb-unit" className="kb-fill" />
          <Twinkles dots={KB_UNIT_DOTS} w={KB_UNIT.w} h={KB_UNIT.h} seed={3 + i} />
        </span>
      ))}
      <span className="kb-link" style={{ height: endH }}>
        <Art name="kb-end" className="kb-fill" />
        <Twinkles dots={KB_END_DOTS} w={KB_END.w} h={KB_END.h} seed={9} />
      </span>
    </span>
  );
}

/**
 * The RSVP's white kolam frame (from the reference border): a bird band at the top and the
 * bottom, a chain down each side. It draws itself in once it comes into view (top, then both
 * sides together, then bottom — 1.8 s), then calls `onDrawn`. A soft light travels once
 * around it every 6 s, the birds nod now and then, the dots twinkle. `lit` turns it gold,
 * from the centre outwards.
 */
export function KolamFrame({ lit = false, onDrawn }: { lit?: boolean; onDrawn?: () => void }) {
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0, chainW: 60, bandH: 0 });
  const drawnCb = useRef(onDrawn);
  drawnCb.current = onDrawn;

  // measure: the chains fill the height between the bands
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      const phone = window.innerWidth < 700;
      const chainW = phone ? 30 : 56;
      const band = el.querySelector<HTMLElement>(".kb-band");
      const bandH = band?.offsetHeight ?? 0;
      setSize((s) => (s.w === w && s.h === h && s.chainW === chainW && s.bandH === bandH ? s : { w, h, chainW, bandH }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // the entrance draw, then the travelling light
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !size.h) return;
    if (reduced) {
      drawnCb.current?.();
      return;
    }
    const ctx = gsap.context(() => {
      const top = el.querySelector(".kb-top");
      const bottom = el.querySelector(".kb-bottom");
      const chains = el.querySelectorAll(".kb-chain");
      gsap.set(top, { clipPath: "inset(0% 50% 0% 50%)" });
      gsap.set(bottom, { clipPath: "inset(0% 50% 0% 50%)" });
      gsap.set(chains, { clipPath: "inset(0% 0% 100% 0%)" });
      const tl = gsap.timeline({ paused: true, onComplete: () => drawnCb.current?.() });
      tl.to(top, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power1.inOut" })
        .to(chains, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power1.inOut" })
        .to(bottom, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power1.inOut" });
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 70%", once: true, onEnter: () => void tl.play() } });

      // a soft light travels once around the frame every 6 s
      const glow = el.querySelector<HTMLElement>(".kb-glow");
      if (glow) {
        const { w, h, bandH, chainW } = size;
        const inset = chainW / 2;
        const path = [
          { x: w / 2, y: bandH * 0.45 },
          { x: w - inset, y: bandH * 0.45 },
          { x: w - inset, y: h - bandH * 0.55 },
          { x: inset, y: h - bandH * 0.55 },
          { x: inset, y: bandH * 0.45 },
          { x: w / 2, y: bandH * 0.45 },
        ];
        gsap.set(glow, { x: path[0].x, y: path[0].y, autoAlpha: 0 });
        const loop = gsap.timeline({ repeat: -1, repeatDelay: 2.4, delay: 2.4 });
        loop.to(glow, { autoAlpha: 1, duration: 0.3 });
        path.slice(1).forEach((p, i) => {
          const prev = path[i];
          const len = Math.hypot(p.x - prev.x, p.y - prev.y);
          loop.to(glow, { x: p.x, y: p.y, duration: Math.max(0.15, len / ((w + h) * 2)) * 3.3, ease: "none" });
        });
        loop.to(glow, { autoAlpha: 0, duration: 0.3 });
      }
    }, el);
    return () => ctx.revert();
  }, [reduced, size]);

  const sideH = Math.max(0, size.h - size.bandH * 2 - 24);
  return (
    <div ref={root} className={`kb-frame ${lit ? "is-lit" : ""}`} aria-hidden>
      <KolamBand className="kb-top" />
      {sideH > 0 && (
        <>
          <span className="kb-side kb-side--l" style={{ top: size.bandH + 12, height: sideH }}>
            <KolamChain height={sideH} width={size.chainW} side="l" />
          </span>
          <span className="kb-side kb-side--r" style={{ top: size.bandH + 12, height: sideH }}>
            <KolamChain height={sideH} width={size.chainW} side="r" />
          </span>
        </>
      )}
      <KolamBand className="kb-bottom" />
      <span className="kb-glow" />
    </div>
  );
}

/* ─────────────────────────── falling jasmine ─────────────────────────── */

const FLOWER_SIZES = [9, 13, 18];
const FLOWER_SPEEDS = [16, 12, 9];

/**
 * White jasmine flowers (five petals, a pale yellow centre) and a few single petals, falling
 * slowly behind the content with a gentle sway and turn. `density` 1 = 14 on phones, 24 on
 * desktop. `burst` adds a dense shower that keeps coming for about four seconds. With `fromTop`
 * the light fall begins at the top (instead of already mid-air), and `slow` makes it slower.
 */
export function JasmineFall({ density = 1, burst = false, fromTop = false, slow = false }: { density?: number; burst?: boolean; fromTop?: boolean; slow?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [count] = useState(() => Math.round((typeof window !== "undefined" && window.innerWidth < 700 ? 14 : 24) * density));
  if (reduced) return null;
  const items = (n: number, seed: number, fast = false) =>
    Array.from({ length: n }, (_, i) => {
      const tier = i % 3;
      const size = FLOWER_SIZES[tier] * (0.85 + r01(i, seed) * 0.3);
      const dur = (fast ? 3 : FLOWER_SPEEDS[tier] * (slow ? 1.5 : 1)) * (0.85 + r01(i, seed + 1) * 0.3);
      const petal = i % 5 === 4;
      const delay = fast ? r01(i, seed + 3) * 4 : fromTop ? 0.8 + r01(i, seed + 3) * dur : -r01(i, seed + 3) * dur;
      return (
        <span
          key={`${seed}-${i}`}
          className={`jf ${tier === 0 ? "jf--far" : ""} ${fast ? "jf--burst" : ""}`}
          style={{
            left: `${(r01(i, seed + 2) * 100).toFixed(2)}%`,
            animationDuration: `${dur.toFixed(2)}s`,
            animationDelay: `${delay.toFixed(2)}s`,
          }}
        >
          <span
            className={`jf-sway ${petal ? "jf-petal" : "jf-flower"}`}
            style={{ width: size, height: size, animationDuration: `${(3 + r01(i, seed + 4) * 3).toFixed(2)}s`, animationDelay: `${(-r01(i, seed + 5) * 4).toFixed(2)}s` }}
          />
        </span>
      );
    });
  return (
    <div className="jf-layer" aria-hidden>
      {items(count, 11)}
      {burst && items(Math.round(count * 3), 41, true)}
    </div>
  );
}
