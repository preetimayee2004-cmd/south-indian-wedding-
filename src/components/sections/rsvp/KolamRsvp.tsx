import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useWedding } from "@/context/WeddingContext";
import { useGuest } from "@/context/GuestContext";
import { useAudio } from "@/context/AudioContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { gsap } from "@/lib/gsap";
import { backendReady } from "@/lib/supabase";
import { calendarUrl } from "@/lib/format";
import { RSVP_LIMITS, readSaved, saveLocalRsvp, splitDetails, submitRsvp, validateRsvp, withDetails, type SavedRsvp } from "@/lib/rsvp";

/* ─────────────────────────────── the kolam ───────────────────────────────
 * A sikku-style kolam on a 13 × 13 dot grid (dots at whole units −6…6). Its lines weave
 * between the dots in four parts, drawn one by one as the guest moves through the steps:
 * the centre, two middle rings, two outer rings, then the corner loops and the border. */

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

const KOLAM_PARTS: string[][] = [
  [circle(0, 0, 0.5), weavingDiamond(1.5)],
  [weavingDiamond(2.5), weavingDiamond(3.5)],
  [weavingDiamond(4.5), weavingDiamond(5.5)],
  [
    ...[-1, 1].flatMap((sx) => [-1, 1].flatMap((sy) => [circle(sx * N, sy * N, 0.5), circle(sx * (N - 1), sy * (N - 1), 0.42)])),
    border(),
  ],
];

const DOTS: [number, number][] = [];
for (let x = -N; x <= N; x++) for (let y = -N; y <= N; y++) DOTS.push([x, y]);

function Kolam({ partsRef }: { partsRef: React.MutableRefObject<(SVGGElement | null)[]> }) {
  return (
    <svg className="kr-kolam" viewBox="-7.6 -7.6 15.2 15.2" aria-hidden>
      {DOTS.map(([x, y]) => (
        <circle key={`${x},${y}`} cx={x} cy={y} r="0.09" className="kr-dot" />
      ))}
      {KOLAM_PARTS.map((paths, i) => (
        <g key={i} ref={(el) => void (partsRef.current[i] = el)} className="kr-part">
          {paths.map((d, k) => (
            <path key={k} d={d} pathLength={1} className="kr-line" />
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────────── small pieces ─────────────────────────────── */

/** A small brass deepam (oil lamp); its flame shows when lit. */
function Deepam({ lit, className = "", delay = 0 }: { lit: boolean; className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 40 44" className={`kr-deepam ${lit ? "is-lit" : ""} ${className}`} style={{ ["--d" as string]: `${delay}s` }} aria-hidden>
      <circle cx="20" cy="14" r="13" fill="url(#kr-glow)" className="kr-deepam-glow" />
      <path className="kr-deepam-flame" d="M20 4C24 11 24 16 20 20 16 16 16 11 20 4Z" />
      <path d="M5 24c3 8 9 12 15 12s12-4 15-12Z" fill="url(#kr-brass)" stroke="#6e4a14" strokeWidth="0.8" />
      <ellipse cx="20" cy="24" rx="15" ry="3" fill="#f3d27a" stroke="#6e4a14" strokeWidth="0.8" />
      <path d="M16 36h8l3 5H13Z" fill="url(#kr-brass)" stroke="#6e4a14" strokeWidth="0.7" />
    </svg>
  );
}

/** Hands joined in a namaste (decline). */
function Namaste() {
  return (
    <svg viewBox="0 0 40 44" className="kr-deepam" aria-hidden>
      <path
        d="M20 6c-2 0-3 2-3 4v14l-6 8-3 4 3 3 7-6c2-2 2-4 2-6Zm0 0c2 0 3 2 3 4v14l6 8 3 4-3 3-7-6c-2-2-2-4-2-6Z"
        fill="none"
        stroke="#8a1b2c"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M20 8v22" stroke="#8a1b2c" strokeWidth="1" />
    </svg>
  );
}

/** Shared gradients for the lamps (one copy on the page). */
function Defs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <linearGradient id="kr-brass" x1="0" x2="1">
          <stop offset="0" stopColor="#7a5216" />
          <stop offset="0.35" stopColor="#f3d27a" />
          <stop offset="0.62" stopColor="#c8952f" />
          <stop offset="1" stopColor="#6e4a14" />
        </linearGradient>
        <radialGradient id="kr-glow">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** The crest on top of the card: a lotus that opens and a deepam that lights at the end. */
function Crest({ crestRef }: { crestRef: React.RefObject<SVGSVGElement | null> }) {
  return (
    <svg ref={crestRef} viewBox="-40 -40 80 64" className="kr-crest" aria-hidden>
      <circle cx="0" cy="-10" r="30" fill="url(#kr-glow)" className="kr-crest-glow" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = -90 + (i - 3.5) * 22;
        return (
          <path
            key={i}
            className="kr-petal"
            transform={`rotate(${a + 90} 0 10)`}
            d="M0 10C-7 0-7-12 0-22 7-12 7 0 0 10Z"
            fill={i % 2 ? "#f2a2b0" : "#f7c3cc"}
            stroke="#b84a63"
            strokeWidth="0.8"
          />
        );
      })}
      <ellipse cx="0" cy="12" rx="13" ry="3.5" fill="url(#kr-brass)" stroke="#6e4a14" strokeWidth="0.7" />
      <path className="kr-crest-flame" d="M0-14C5-6 5 0 0 5-5 0-5-6 0-14Z" />
    </svg>
  );
}

/** A kumkum thumbprint: a red oval with a whorl of ridges. */
function Thumbprint() {
  return (
    <svg viewBox="-30 -36 60 72" className="kr-thumb" aria-hidden>
      <ellipse rx="24" ry="31" fill="#b3122e" opacity="0.9" />
      {[5, 9, 13, 17, 21].map((r, i) => (
        <ellipse key={r} rx={r * 0.8} ry={r} fill="none" stroke="#6e0718" strokeWidth="1.6" strokeDasharray={i % 2 ? "6 3" : "9 2"} opacity="0.75" />
      ))}
      <path d="M-14 22c8 6 20 6 26-4" fill="none" stroke="#f3b2b6" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

/* ─────────────────────────────── the RSVP ─────────────────────────────── */

const JOINING = ["Family", "Friend", "Relative", "Colleague"] as const;
type Joining = (typeof JOINING)[number];
const STEPS = 5;
type Status = "form" | "sending" | "done";

interface Answer {
  name: string;
  attending: boolean | null;
  guests: number;
  joiningAs: Joining;
  ceremonies: string[];
  blessing: string;
}

/** Arrow keys move the choice inside a radiogroup of buttons. */
function arrowNav(e: KeyboardEvent<HTMLElement>) {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
  const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
  const i = items.indexOf(document.activeElement as HTMLButtonElement);
  if (i < 0) return;
  e.preventDefault();
  const next = items[(i + (e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1) + items.length) % items.length];
  next.focus();
  next.click();
}

/**
 * "Kolam RSVP": on maroon silk, an ivory card sits inside a large Tamil kolam of rice-flour dots.
 * Each step the guest completes draws one part of the kolam (it is the progress bar). On sending,
 * the kolam closes, a lotus opens on the card's crest, a deepam lights, and the card turns into a
 * palm-leaf Guest Pass sealed with a kumkum thumbprint.
 */
export function KolamRsvp() {
  const { id: weddingId, rsvp, events, couple, wedding, venue } = useWedding();
  const { guestName, isPersonalized, setGuestName } = useGuest();
  const { playSfx } = useAudio();
  const reduced = usePrefersReducedMotion();
  const ceremonyNames = useMemo(() => events.map((e) => e.name), [events]);

  const fromSaved = (s: SavedRsvp): Answer => {
    const d = splitDetails(s.message);
    return {
      name: s.name,
      attending: s.attending,
      guests: Math.max(1, s.guests || 1),
      joiningAs: (JOINING as readonly string[]).includes(d.joiningAs ?? "") ? (d.joiningAs as Joining) : "Friend",
      ceremonies: d.ceremonies.length ? d.ceremonies : ceremonyNames,
      blessing: d.blessing,
    };
  };

  const [saved, setSaved] = useState<SavedRsvp | null>(() => readSaved(weddingId));
  const [answer, setAnswer] = useState<Answer>(() =>
    saved
      ? fromSaved(saved)
      : { name: isPersonalized ? guestName : "", attending: null, guests: 1, joiningAs: "Friend", ceremonies: ceremonyNames, blessing: "" },
  );
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>(saved ? "done" : "form");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [live, setLive] = useState("");
  const [litUpTo, setLitUpTo] = useState(saved?.attending ? saved.guests : 0);
  const [litFrom, setLitFrom] = useState(0);

  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const crest = useRef<SVGSVGElement>(null);
  const pass = useRef<HTMLDivElement>(null);
  const parts = useRef<(SVGGElement | null)[]>([]);
  const drawn = useRef(0);
  const animate = useRef(false); // set when the pass should appear with its stamp and petals

  const set = <K extends keyof Answer>(k: K, v: Answer[K]) => setAnswer((a) => ({ ...a, [k]: v }));
  const max = rsvp.maxAttendees;
  const deadline = new Intl.DateTimeFormat("en-GB", { timeZone: wedding.timeZone, day: "numeric", month: "long", year: "numeric" }).format(new Date(rsvp.deadlineISO ?? wedding.dateISO));

  // the message as it will be stored, and how much room is left for the blessing
  const prefix = answer.attending ? withDetails(answer.joiningAs, answer.ceremonies, "") + " " : "";
  const blessingMax = RSVP_LIMITS.message - prefix.length;

  /* the kolam: draw or erase whole parts to match a count */
  const drawTo = useCallback(
    (count: number, opts: { sound?: boolean; instant?: boolean } = {}) => {
      const from = drawn.current;
      drawn.current = count;
      const tl = gsap.timeline();
      parts.current.forEach((g, i) => {
        if (!g) return;
        const lines = g.querySelectorAll(".kr-line");
        const on = i < count;
        if (reduced || opts.instant) {
          gsap.set(lines, { strokeDashoffset: on ? 0 : 1 });
          return;
        }
        if (on && i >= from) tl.to(lines, { strokeDashoffset: 0, duration: 0.9, ease: "power1.inOut" }, (i - from) * 0.5);
        else if (!on && i < from) tl.to(lines, { strokeDashoffset: 1, duration: 0.6, ease: "power1.inOut" }, 0);
      });
      if (opts.sound && count > from) for (let i = 0; i < count - from; i++) playSfx("kolam", { volume: 0.35, delay: i * 0.5 });
      return tl;
    },
    [playSfx, reduced],
  );

  // first paint: the kolam as it should stand (all of it for a guest who already answered)
  useLayoutEffect(() => {
    parts.current.forEach((g) => g && gsap.set(g.querySelectorAll(".kr-line"), { strokeDashoffset: 1 }));
    drawTo(saved ? 4 : 0, { instant: true });
    if (saved) gsap.set(crest.current?.querySelectorAll(".kr-petal, .kr-crest-flame, .kr-crest-glow") ?? [], { scale: 1, autoAlpha: 1 });
    else gsap.set(crest.current?.querySelectorAll(".kr-petal, .kr-crest-flame, .kr-crest-glow") ?? [], { scale: 0, autoAlpha: 0, svgOrigin: "0 10" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* steps: the old one slides out to the left, the new one in from the right (mirrored going back) */
  const go = (next: number) => {
    if (next === step) return;
    const dir = next > step ? 1 : -1;
    playSfx("swish", { volume: 0.4 });
    if (!editing) drawTo(Math.min(next, 4), { sound: true });
    const swap = () => {
      setStep(next);
      setError(null);
    };
    if (reduced || !body.current) return swap();
    gsap.to(body.current, {
      x: -24 * dir,
      autoAlpha: 0,
      duration: 0.16,
      ease: "power1.in",
      onComplete: () => {
        swap();
        requestAnimationFrame(() => gsap.fromTo(body.current, { x: 24 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.2, ease: "power2.out" }));
      },
    });
  };

  // focus moves to the new step's heading
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    body.current?.querySelector<HTMLElement>("legend")?.focus();
    setLive(`Step ${step + 1} of ${STEPS}`);
  }, [step]);

  const canNext = step === 0 ? answer.name.trim().length > 0 : step === 1 ? answer.attending !== null : step === 3 ? answer.ceremonies.length > 0 : true;
  const next = () => {
    if (!canNext) return;
    if (step === 1 && answer.attending === false) return go(4); // a decline goes straight to the blessing
    go(step + 1);
  };
  const back = () => go(step === 4 && answer.attending === false ? 1 : step - 1);

  /* guests: tapping the Nth lamp lights 1…N one after another */
  const pickGuests = (n: number) => {
    set("guests", n);
    const from = litUpTo;
    setLitFrom(Math.min(from, n));
    setLitUpTo(n);
    if (n > from) for (let i = from; i < n; i++) playSfx("flame", { volume: 0.4, rate: 1 + i * 0.04, delay: reduced ? 0 : (i - from) * 0.08 });
  };

  /* send */
  const send = async () => {
    const message = answer.attending ? withDetails(answer.joiningAs, answer.ceremonies, answer.blessing) : answer.blessing.trim();
    const input = { name: answer.name.trim(), attending: Boolean(answer.attending), guests: answer.attending ? answer.guests : 0, message };
    const problem = validateRsvp(input, max);
    if (problem) {
      setError(problem);
      setLive(problem);
      return;
    }
    setStatus("sending");
    setError(null);
    setLive("Sending…");
    let result: SavedRsvp;
    try {
      result = backendReady ? await submitRsvp(weddingId, input) : saveLocalRsvp(weddingId, input);
    } catch {
      setStatus("form");
      setError("We couldn't send that just now. Please try again.");
      setLive("Sending failed. Try again.");
      return;
    }
    setGuestName(input.name);
    finish(result);
  };

  const finish = (result: SavedRsvp) => {
    const accept = result.attending;
    const t = gsap.timeline();
    const crestBits = crest.current;
    if (!editing) t.add(drawTo(4, { sound: true }));
    const done = () => {
      animate.current = !reduced;
      setSaved(result);
      setStatus("done");
      setEditing(false);
      setLive(accept ? `Thank you, ${result.name}. Your guest pass is ready.` : `Thank you, ${result.name}. We'll miss you.`);
    };
    if (reduced) {
      playSfx("bell", { volume: accept ? 0.5 : 0.4 });
      if (crestBits) gsap.set(crestBits.querySelectorAll(".kr-petal, .kr-crest-flame, .kr-crest-glow"), { scale: 1, autoAlpha: 1 });
      done();
      return;
    }
    t.call(() => playSfx("bell", { volume: accept ? 0.5 : 0.4 }));
    if (crestBits && accept) {
      t.to(crestBits.querySelectorAll(".kr-petal"), { scale: 1, autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: "back.out(1.6)" }, ">-0.1");
      t.call(() => playSfx("flame", { volume: 0.5 }));
    }
    if (crestBits) {
      t.fromTo(crestBits.querySelector(".kr-crest-flame"), { scaleY: 0, autoAlpha: 0, svgOrigin: "0 5" }, { scaleY: 1, scale: 1, autoAlpha: 1, duration: 0.6, ease: "power2.out" });
      t.to(crestBits.querySelector(".kr-crest-glow"), { scale: 1, autoAlpha: 1, duration: 0.8, ease: "sine.out" }, "<");
    }
    t.to(card.current, { rotateY: 90, duration: 0.25, ease: "power1.in" }, "+=0.15").call(done).set(card.current, { rotateY: -90 }).to(card.current, { rotateY: 0, duration: 0.3, ease: "power2.out" });
  };

  // the pass arrives: the thumbprint is pressed on and a little gust of petals falls
  useLayoutEffect(() => {
    if (status !== "done" || !animate.current || !pass.current) return;
    animate.current = false;
    pass.current.querySelector<HTMLElement>(".kr-pass-name")?.focus(); // keyboard and screen-reader users land on the pass
    const accept = saved?.attending;
    const ctx = gsap.context(() => {
      if (!accept) return;
      gsap.fromTo(".kr-seal", { scale: 1.4, rotate: -8, autoAlpha: 0 }, { scale: 1, rotate: -8, autoAlpha: 1, duration: 0.35, ease: "power3.in", delay: 0.35, onComplete: () => playSfx("stamp", { volume: 0.6 }) });
      const petals = gsap.utils.toArray<HTMLElement>(".kr-fall", root.current);
      gsap.delayedCall(0.6, () => playSfx("petals", { volume: 0.4 }));
      petals.forEach((p, i) => {
        gsap.fromTo(
          p,
          { x: 0, y: -40, rotate: i * 37, autoAlpha: 0 },
          { keyframes: [{ autoAlpha: 1, duration: 0.2 }, { y: 420 + (i % 4) * 60, x: (i % 2 ? 1 : -1) * (30 + (i % 5) * 12), rotate: `+=${200 + i * 20}`, autoAlpha: 0, duration: 2.6, ease: "sine.in" }], delay: 0.6 + i * 0.07 },
        );
      });
    }, root);
    return () => ctx.revert();
  }, [status, saved, playSfx]);

  const edit = () => {
    if (!saved) return;
    setAnswer(fromSaved(saved));
    setLitUpTo(saved.attending ? saved.guests : 0);
    setEditing(true);
    setStep(0);
    setStatus("form");
    drawTo(4, { instant: true });
    requestAnimationFrame(() => body.current?.querySelector<HTMLElement>("legend")?.focus());
  };

  /* ── render ── */
  const legend = (text: string, hint?: ReactNode) => (
    <>
      <legend tabIndex={-1} className="kr-legend">
        {text}
      </legend>
      {hint && <p className="kr-hint">{hint}</p>}
    </>
  );

  const stepView = () => {
    switch (step) {
      case 0:
        return (
          <fieldset className="kr-step">
            {legend("Your name", "So the family knows whom to welcome.")}
            <input
              className="kr-input"
              value={answer.name}
              onChange={(e) => set("name", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && next()}
              maxLength={RSVP_LIMITS.name}
              autoComplete="name"
              placeholder="Your name"
              aria-label="Your name"
            />
          </fieldset>
        );
      case 1:
        return (
          <fieldset className="kr-step">
            {legend("Will you join us?")}
            <div role="radiogroup" aria-label="Will you join us?" className="kr-attend" onKeyDown={arrowNav}>
              {[true, false].map((yes) => (
                <button
                  key={String(yes)}
                  type="button"
                  role="radio"
                  aria-checked={answer.attending === yes}
                  tabIndex={answer.attending === yes || (answer.attending === null && yes) ? 0 : -1}
                  data-pop
                  className={`kr-choice ${answer.attending === yes ? "is-on" : ""}`}
                  onClick={() => set("attending", yes)}
                >
                  {yes ? <Deepam lit /> : <Namaste />}
                  <span>{yes ? "Joyfully Accept" : "Regretfully Decline"}</span>
                </button>
              ))}
            </div>
          </fieldset>
        );
      case 2:
        return (
          <fieldset className="kr-step">
            {legend("How many of you?", "Tap a lamp — one for each guest, you included.")}
            <div role="radiogroup" aria-label="Number of guests" className="kr-lamps" onKeyDown={arrowNav}>
              {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={answer.guests === n}
                  aria-label={`${n} ${n === 1 ? "guest" : "guests"}`}
                  tabIndex={answer.guests === n ? 0 : -1}
                  data-pop
                  className="kr-lamp"
                  onClick={() => pickGuests(n)}
                >
                  <Deepam lit={n <= litUpTo} className={reduced ? "" : "kr-anim"} delay={Math.max(0, n - 1 - litFrom) * 0.08} />
                </button>
              ))}
            </div>
            <p className="kr-count" aria-hidden>
              {answer.guests} {answer.guests === 1 ? "guest" : "guests"}
            </p>
          </fieldset>
        );
      case 3:
        return (
          <fieldset className="kr-step">
            {legend("Joining as")}
            <div role="radiogroup" aria-label="Joining as" className="kr-chips" onKeyDown={arrowNav}>
              {JOINING.map((j) => (
                <button
                  key={j}
                  type="button"
                  role="radio"
                  aria-checked={answer.joiningAs === j}
                  tabIndex={answer.joiningAs === j ? 0 : -1}
                  data-pop
                  className={`kr-chip ${answer.joiningAs === j ? "is-on" : ""}`}
                  onClick={() => set("joiningAs", j)}
                >
                  {j}
                </button>
              ))}
            </div>
            <p className="kr-sub">Which ceremonies will you attend?</p>
            <div className="kr-chips" role="group" aria-label="Which ceremonies will you attend?">
              {ceremonyNames.map((c) => {
                const on = answer.ceremonies.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    data-pop
                    className={`kr-chip ${on ? "is-on" : ""}`}
                    onClick={() => set("ceremonies", on ? answer.ceremonies.filter((x) => x !== c) : ceremonyNames.filter((x) => x === c || answer.ceremonies.includes(x)))}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      default:
        return (
          <fieldset className="kr-step">
            {legend("A blessing for the couple", "Optional — a few words they'll keep.")}
            <textarea
              className="kr-input kr-textarea"
              value={answer.blessing}
              onChange={(e) => set("blessing", e.target.value.slice(0, blessingMax))}
              maxLength={blessingMax}
              rows={4}
              placeholder="A blessing for the couple"
              aria-label="A blessing for the couple"
              aria-describedby="kr-counter"
            />
            <p id="kr-counter" className="kr-counter">
              {answer.blessing.length} / {blessingMax}
            </p>
          </fieldset>
        );
    }
  };

  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const dateText = new Intl.DateTimeFormat("en-GB", { timeZone: wedding.timeZone, day: "numeric", month: "long", year: "numeric" }).format(new Date(wedding.dateISO));
  const muh = events.find((e) => e.startISO === wedding.dateISO);
  const calUrl = calendarUrl(`${first.name} weds ${second.name} – Wedding`, wedding.dateISO, `${venue.name}, ${venue.address}`, muh?.endISO);
  const savedDetails = saved ? splitDetails(saved.message) : null;

  return (
    <section ref={root} id="rsvp" aria-labelledby="kr-heading" className="kr-section pm-silk">
      <Defs />
      <header className="kr-head">
        <p className="pm-eyebrow">॥ Kindly Respond ॥</p>
        <h2 id="kr-heading" className="pm-script-title">
          Will you bless us?
        </h2>
        {rsvp.deadlineISO && <p className="kr-deadline">Kindly respond by {deadline}</p>}
      </header>

      <div className="kr-stage">
        <Kolam partsRef={parts} />
        <div className="kr-card-wrap">
          <Crest crestRef={crest} />
          <div ref={card} className={`kr-card ${status === "done" ? "kr-card--pass" : ""}`}>
            {status !== "done" ? (
              <>
                <ol className="kr-dots" aria-label={`Step ${step + 1} of ${STEPS}`}>
                  {Array.from({ length: STEPS }, (_, i) => (
                    <li key={i} className={i === step ? "is-now" : i < step ? "is-done" : ""} aria-hidden />
                  ))}
                </ol>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (step === 4) void send();
                    else next();
                  }}
                >
                  <div ref={body} className="kr-body">
                    {stepView()}
                  </div>
                  {error && (
                    <p className="kr-error" role="alert">
                      {error}
                      {status === "form" && step === 4 && (
                        <button type="button" className="kr-retry" data-pop onClick={() => void send()}>
                          Try again
                        </button>
                      )}
                    </p>
                  )}
                  <div className="kr-nav">
                    <button type="button" className="pm-btn pm-btn--ghost kr-back" onClick={back} disabled={step === 0 || status === "sending"} aria-disabled={step === 0}>
                      Back
                    </button>
                    {step < 4 ? (
                      <button type="submit" className="pm-btn pm-btn--solid" disabled={!canNext}>
                        Next
                      </button>
                    ) : (
                      <button type="submit" className="pm-btn pm-btn--solid" disabled={status === "sending"}>
                        {status === "sending" ? "Sending…" : "Send with Blessings"}
                      </button>
                    )}
                  </div>
                </form>
              </>
            ) : (
              saved && (
                <div ref={pass} className="kr-pass">
                  <span aria-hidden className="kr-hole kr-hole--l" />
                  <span aria-hidden className="kr-hole kr-hole--r" />
                  {saved.attending ? (
                    <>
                      <p className="kr-pass-label">Guest Pass</p>
                      <p className="kr-pass-name" tabIndex={-1}>{saved.name}</p>
                      <p className="kr-pass-line">
                        Joyfully attending · {saved.guests} {saved.guests === 1 ? "guest" : "guests"}
                      </p>
                      {savedDetails?.joiningAs && <p className="kr-pass-small">Joining as {savedDetails.joiningAs}</p>}
                      {savedDetails && savedDetails.ceremonies.length > 0 && <p className="kr-pass-small">{savedDetails.ceremonies.join(" · ")}</p>}
                      <span aria-hidden className="kr-pass-rule" />
                      <p className="kr-pass-couple">
                        {first.name} &amp; {second.name}
                      </p>
                      <p className="kr-pass-small">
                        {dateText} · {venue.name}
                      </p>
                      <span className="kr-seal">
                        <Thumbprint />
                      </span>
                    </>
                  ) : (
                    <>
                      <Deepam lit className="kr-pass-lamp" />
                      <p className="kr-pass-name" tabIndex={-1}>We'll miss you, {saved.name}</p>
                      <p className="kr-pass-line">Thank you for your blessings</p>
                    </>
                  )}
                  <div className="kr-nav kr-nav--pass">
                    {saved.attending && (
                      <a href={calUrl} target="_blank" rel="noopener noreferrer" className="pm-btn pm-btn--solid">
                        Add to Calendar
                      </a>
                    )}
                    <button type="button" className="pm-btn pm-btn--ghost" onClick={edit}>
                      Edit response
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
        {/* a light gust of petals when the pass is ready */}
        <div className="kr-falls" aria-hidden>
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} className={`kr-fall ${i % 3 === 0 ? "kr-fall--marigold" : ""}`} style={{ left: `${8 + ((i * 47) % 84)}%` }} />
          ))}
        </div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {live}
      </p>
    </section>
  );
}
