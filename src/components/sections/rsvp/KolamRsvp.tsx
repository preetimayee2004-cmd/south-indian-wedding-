import { useLayoutEffect, useRef, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { useGuest } from "@/context/GuestContext";
import { useAudio } from "@/context/AudioContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { gsap } from "@/lib/gsap";
import { backendReady } from "@/lib/supabase";
import { calendarUrl } from "@/lib/format";
import { saveLocalRsvp, submitRsvp } from "@/lib/rsvp";

/* ─────────────────────────────── the kolam ───────────────────────────────
 * A sikku-style kolam on a 13 × 13 dot grid (dots at whole units −6…6): its lines weave
 * between the dots in four parts. */

const N = 6;
const fmt = (v: number) => v.toFixed(2);

/** A diamond |x|+|y| = R that weaves between the dots, with a little loop at each tip. */
function weavingDiamond(R: number): string {
  const tips = [
    [R, 0],
    [0, R],
    [-R, 0],
    [0, -R],
  ];
  let d = "";
  for (let e = 0; e < 4; e++) {
    const [ax, ay] = tips[e];
    const [bx, by] = tips[(e + 1) % 4];
    const len = Math.hypot(bx - ax, by - ay);
    const nx = -(by - ay) / len;
    const ny = (bx - ax) / len;
    const steps = Math.max(8, Math.round(R * 10));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const w = 0.2 * Math.sin(Math.PI * 2 * R * t) * Math.sin(Math.PI * t);
      const x = ax + (bx - ax) * t + nx * w;
      const y = ay + (by - ay) * t + ny * w;
      d += `${d ? "L" : "M"}${fmt(x)} ${fmt(y)}`;
    }
    // the loop around the next tip, swinging outwards
    const ox = bx === 0 ? 0 : Math.sign(bx);
    const oy = by === 0 ? 0 : Math.sign(by);
    const cx = bx + ox * 0.5;
    const cy = by + oy * 0.5;
    for (let i = 1; i <= 16; i++) {
      const a = Math.atan2(-oy, -ox) + (i / 16) * Math.PI * 2;
      d += `L${fmt(cx + Math.cos(a) * 0.5)} ${fmt(cy + Math.sin(a) * 0.5)}`;
    }
  }
  return d + "Z";
}

function circle(cx: number, cy: number, r: number): string {
  return `M${fmt(cx + r)} ${fmt(cy)}A${r} ${r} 0 1 1 ${fmt(cx - r)} ${fmt(cy)}A${r} ${r} 0 1 1 ${fmt(cx + r)} ${fmt(cy)}Z`;
}

/** The border: a rounded square just outside the dots, with a loop at the middle of each side. */
function border(): string {
  const S = N + 0.55;
  const k = 1.2;
  let d = `M${-S + k} ${-S}`;
  const side = (x1: number, y1: number, x2: number, y2: number, lx: number, ly: number) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    d += `L${fmt(mx - (x2 - x1) * 0.04)} ${fmt(my - (y2 - y1) * 0.04)}`;
    d += `C${fmt(mx + lx * 1.4 - (x2 - x1) * 0.08)} ${fmt(my + ly * 1.4 - (y2 - y1) * 0.08)} ${fmt(mx + lx * 1.4 + (x2 - x1) * 0.08)} ${fmt(my + ly * 1.4 + (y2 - y1) * 0.08)} ${fmt(mx + (x2 - x1) * 0.04)} ${fmt(my + (y2 - y1) * 0.04)}`;
    d += `L${fmt(x2)} ${fmt(y2)}`;
  };
  side(-S + k, -S, S - k, -S, 0, 1);
  d += `Q${S} ${-S} ${S} ${-S + k}`;
  side(S, -S + k, S, S - k, -1, 0);
  d += `Q${S} ${S} ${S - k} ${S}`;
  side(S - k, S, -S + k, S, 0, -1);
  d += `Q${-S} ${S} ${-S} ${S - k}`;
  side(-S, S - k, -S, -S + k, 1, 0);
  d += `Q${-S} ${-S} ${-S + k} ${-S}Z`;
  return d;
}


/** Drawn from the outside in: the border (shown from the start), then the rings, then the heart. */
const KOLAM_PARTS: string[][] = [
  [border(), ...[-1, 1].flatMap((sx) => [-1, 1].map((sy) => circle(sx * N, sy * N, 0.5)))],
  [weavingDiamond(5.5), ...[-1, 1].flatMap((sx) => [-1, 1].map((sy) => circle(sx * (N - 1), sy * (N - 1), 0.42)))],
  [weavingDiamond(4.5), weavingDiamond(3.5)],
  [weavingDiamond(2.5), weavingDiamond(1.5)],
];

const DOTS: [number, number][] = [];
for (let x = -N; x <= N; x++) for (let y = -N; y <= N; y++) DOTS.push([x, y]);

/** The kolam, with a lotus and a deepam at its heart (they open and light on accepting). */
function Kolam({ partsRef }: { partsRef: React.MutableRefObject<(SVGGElement | null)[]> }) {
  return (
    <svg className="kr-kolam" viewBox="-7.6 -7.6 15.2 15.2" aria-hidden>
      <defs>
        <radialGradient id="kr-glow">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="kr-brass" x1="0" x2="1">
          <stop offset="0" stopColor="#7a5216" />
          <stop offset="0.35" stopColor="#f3d27a" />
          <stop offset="0.62" stopColor="#c8952f" />
          <stop offset="1" stopColor="#6e4a14" />
        </linearGradient>
      </defs>
      {DOTS.map(([x, y]) => (
        <circle key={`${x},${y}`} cx={x} cy={y} r="0.09" className="kr-dot" />
      ))}
      {KOLAM_PARTS.map((paths, i) => (
        <g key={i} ref={(el) => void (partsRef.current[i] = el)} className={`kr-part ${i === 0 ? "kr-part--first" : ""}`}>
          {paths.map((d, k) => (
            <path key={k} d={d} pathLength={1} className="kr-line" />
          ))}
        </g>
      ))}
      {/* the heart: a lotus that opens, a brass lamp, its flame and a warm glow (no filters) */}
      <g className="kr-heart">
        <circle cx="0" cy="-0.5" r="2.2" fill="url(#kr-glow)" className="kr-glow" />
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={i}
            className="kr-petal"
            transform={`rotate(${-78 + i * 22} 0 0.55)`}
            d="M0 0.55C-0.42 0-0.42-0.75 0-1.35 0.42-0.75 0.42 0 0 0.55Z"
            fill={i % 2 ? "#f2a2b0" : "#f7c3cc"}
            stroke="#b84a63"
            strokeWidth="0.04"
          />
        ))}
        <ellipse cx="0" cy="0.62" rx="0.78" ry="0.2" fill="url(#kr-brass)" stroke="#6e4a14" strokeWidth="0.04" />
        <path className="kr-flame" d="M0-0.95C0.3-0.5 0.3-0.12 0 0.42-0.3-0.12-0.3-0.5 0-0.95Z" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────── the RSVP ─────────────────────────────── */

const PETAL_KINDS = ["marigold", "marigold-yellow", "mallipoo", "rose"] as const;

/**
 * "Kolam RSVP", kept simple: on maroon silk a rice-flour kolam (its border already drawn) with
 * one "Accept Invitation" button breathing at its heart. Accepting draws the rest of the kolam,
 * opens a lotus, lights a deepam, showers flowers over the section and offers Add to Calendar.
 * The answer is saved quietly in the background; the guest only ever sees the celebration.
 */
export function KolamRsvp() {
  const { id: weddingId, rsvp, couple, wedding, events, venue } = useWedding();
  const { guestName, isPersonalized } = useGuest();
  const { playSfx } = useAudio();
  const reduced = usePrefersReducedMotion();
  // every visit (and every refresh) starts on "Accept Invitation"; the RSVP itself is still saved
  const [accepted, setAccepted] = useState(false);
  const [live, setLive] = useState("");

  const root = useRef<HTMLElement>(null);
  const kolam = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const after = useRef<HTMLDivElement>(null);
  const cal = useRef<HTMLAnchorElement>(null);
  const parts = useRef<(SVGGElement | null)[]>([]);
  const breathe = useRef<ReturnType<typeof gsap.to> | null>(null);

  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const muh = events.find((e) => e.startISO === wedding.dateISO);
  const calUrl = calendarUrl(`${first.name} weds ${second.name} – Wedding`, wedding.dateISO, `${venue.name}, ${venue.address}`, muh?.endISO);
  const deadline = rsvp.deadlineISO
    ? new Intl.DateTimeFormat("en-GB", { timeZone: wedding.timeZone, day: "numeric", month: "long", year: "numeric" }).format(new Date(rsvp.deadlineISO))
    : null;

  const lines = (i: number) => parts.current[i]?.querySelectorAll(".kr-line") ?? [];
  const heart = () => kolam.current?.querySelector(".kr-heart");

  // first paint: the border drawn and the rest empty — or, for a guest who already accepted, all of it
  useLayoutEffect(() => {
    const done = accepted;
    parts.current.forEach((_, i) => gsap.set(lines(i), { strokeDashoffset: done || i === 0 ? 0 : 1 }));
    const h = heart();
    if (h) {
      gsap.set(h.querySelectorAll(".kr-petal"), { scale: done ? 1 : 0, autoAlpha: done ? 1 : 0, svgOrigin: "0 0.55" });
      gsap.set(h.querySelector(".kr-flame"), { scaleY: done ? 1 : 0, autoAlpha: done ? 1 : 0, svgOrigin: "0 0.42" });
      gsap.set(h.querySelector(".kr-glow"), { autoAlpha: done ? 1 : 0 });
    }
    if (!done && !reduced && button.current) {
      // a slow breath on the button (scale only)
      breathe.current = gsap.to(button.current, { scale: 1.03, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }
    return () => void breathe.current?.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** A shower of marigold, jasmine and rose petals over the whole section; each is removed after it lands. */
  const showerFlowers = () => {
    const host = root.current;
    if (!host) return;
    const count = window.innerWidth < 768 ? 18 : 30;
    const H = host.offsetHeight;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = `kr-flower kr-flower--${PETAL_KINDS[i % PETAL_KINDS.length]}`;
      p.style.left = `${Math.random() * 100}%`;
      host.appendChild(p);
      const dur = 2.5 + Math.random();
      const sway = (Math.random() < 0.5 ? -1 : 1) * (14 + Math.random() * 26);
      gsap
        .timeline({ delay: Math.random() * 0.6, onComplete: () => p.remove() })
        .fromTo(p, { y: -30, autoAlpha: 0, rotate: Math.random() * 360 }, { autoAlpha: 1, duration: 0.25 }, 0)
        .to(p, { y: H + 30, rotate: `+=${180 + Math.random() * 240}`, duration: dur, ease: "sine.in" }, 0)
        .to(p, { x: sway, duration: dur / 4, ease: "sine.inOut", yoyo: true, repeat: 3 }, 0)
        .to(p, { autoAlpha: 0, duration: 0.35 }, dur - 0.35);
    }
  };

  /** Saved quietly: Supabase when it is set up, this device otherwise (or if it fails). Never shown. */
  const saveQuietly = () => {
    const input = { name: (isPersonalized && guestName) || "Guest", attending: true, guests: 1, message: "" };
    const local = () => void saveLocalRsvp(weddingId, input);
    if (!backendReady) return local();
    submitRsvp(weddingId, input).catch(local);
  };

  const accept = () => {
    if (accepted) return;
    // (the soft "pop" comes from the page-wide button listener, as on every pm-btn)
    saveQuietly();
    breathe.current?.kill();
    const reveal = () => {
      setAccepted(true);
      setLive("Invitation accepted");
    };

    if (reduced) {
      parts.current.forEach((_, i) => gsap.set(lines(i), { strokeDashoffset: 0 }));
      const h = heart();
      if (h) gsap.set(h.querySelectorAll(".kr-petal, .kr-flame, .kr-glow"), { scale: 1, scaleY: 1, autoAlpha: 1 });
      playSfx("flame", { volume: 0.5 });
      playSfx("bell", { volume: 0.5 });
      reveal();
      return;
    }

    const tl = gsap.timeline();
    // 1 · the button gives way
    tl.to(button.current, { scale: 0.9, autoAlpha: 0, duration: 0.3, ease: "power1.in" }, 0);
    // 2 · the rest of the kolam draws, part by part, each with a trickle of rice flour
    let at = 0.25;
    for (let i = 1; i < KOLAM_PARTS.length; i++) {
      tl.call(() => playSfx("kolam", { volume: 0.35 }), undefined, at);
      tl.to(lines(i), { strokeDashoffset: 0, duration: 0.6, ease: "power1.inOut" }, at);
      at += 0.7;
    }
    // 3 · the lotus opens, the deepam lights (flame + a soft temple bell)
    const h = heart();
    if (h) {
      tl.to(h.querySelectorAll(".kr-petal"), { scale: 1, autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: "back.out(1.6)" }, at - 0.05);
      tl.call(() => {
        playSfx("flame", { volume: 0.5 });
        playSfx("bell", { volume: 0.5 });
      });
      tl.to(h.querySelector(".kr-flame"), { scaleY: 1, autoAlpha: 1, duration: 0.55, ease: "power2.out" });
      tl.to(h.querySelector(".kr-glow"), { autoAlpha: 1, duration: 0.8, ease: "sine.out" }, "<");
    }
    // 4 · flowers fall over the section; 5 · the thank-you line and Add to Calendar rise in
    tl.call(() => {
      playSfx("petals", { volume: 0.4 });
      showerFlowers();
      reveal();
    });
  };

  // after accepting: the thank-you line and the calendar button fade up, focus moves to the button
  useLayoutEffect(() => {
    if (!accepted || !after.current) return;
    if (live) cal.current?.focus({ preventScroll: true }); // only right after the guest tapped (not on a return visit)
    if (reduced || !live) return;
    // opacity only (not visibility), so the focused calendar button keeps its focus while it fades in
    const t = gsap.fromTo(after.current.children, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power2.out" });
    return () => void t.kill();
  }, [accepted, live, reduced]);

  return (
    <section ref={root} id="rsvp" aria-labelledby="kr-heading" className="kr-section pm-silk">
      <header className="kr-head">
        <p className="pm-eyebrow">॥ Kindly Respond ॥</p>
        {isPersonalized && guestName && <p className="kr-dear">Dear {guestName},</p>}
        <h2 id="kr-heading" className="pm-script-title kr-title">
          Will you bless us with your presence?
        </h2>
        {deadline && <p className="kr-deadline">Kindly respond by {deadline}</p>}
      </header>

      <div ref={kolam} className="kr-stage">
        <Kolam partsRef={parts} />
        {!accepted && (
          <button ref={button} type="button" className="pm-btn pm-btn--solid kr-accept" onClick={accept} aria-label="Accept the invitation">
            Accept Invitation
          </button>
        )}
      </div>

      {accepted && (
        <div ref={after} className="kr-after">
          <p className="kr-thanks">Thank you! We can't wait to celebrate with you.</p>
          <a ref={cal} href={calUrl} target="_blank" rel="noopener noreferrer" className="pm-btn pm-btn--solid">
            Add to Calendar
          </a>
        </div>
      )}
      <p role="status" aria-live="polite" className="sr-only">
        {live}
      </p>
    </section>
  );
}
