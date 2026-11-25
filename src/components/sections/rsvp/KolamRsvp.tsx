import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { useGuest } from "@/context/GuestContext";
import { useAudio } from "@/context/AudioContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { gsap } from "@/lib/gsap";
import { backendReady } from "@/lib/supabase";
import { calendarUrl, directionsUrl } from "@/lib/format";
import { submitRsvp, fetchLampWall, type LampWall } from "@/lib/rsvp";
import { KolamFrame, JasmineFall } from "./KolamBorder";
import { RsvpSides } from "./RsvpSides";
import { markAcceptedThisVisit, useAcceptedThisVisit } from "@/hooks/useAcceptedThisVisit";
import { useFitToScreen } from "@/hooks/useFitToScreen";
import { KOLAM, KOLAM_DOTS } from "./kolamData";

/* ──────────────────────────── the pieces ──────────────────────────── */

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
/** The four lines of the centre crossing, as chords of the cut-out circle — they reveal the
 *  centre's real lines (kolam-centre.webp) as they draw. */
const CROSS = (() => {
  const { cx, cy, cut } = KOLAM;
  const v = 40; // the crossing's corners sit 40px from the centre dot
  const lines: [number, number, number, number][] = [
    [cx, cy - v, cx - v, cy],
    [cx, cy - v, cx + v, cy],
    [cx, cy + v, cx - v, cy],
    [cx, cy + v, cx + v, cy],
  ];
  return lines.map(([x1, y1, x2, y2]) => {
    // extend each side of the diamond to the edge of the circle
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
    const ux = dx / L, uy = dy / L;
    const fx = x1 - cx, fy = y1 - cy;
    const b = fx * ux + fy * uy;
    const c = fx * fx + fy * fy - cut * cut;
    const t = Math.sqrt(Math.max(0, b * b - c));
    const t1 = -b - t, t2 = -b + t;
    return `M${(x1 + ux * t1).toFixed(1)} ${(y1 + uy * t1).toFixed(1)}L${(x1 + ux * t2).toFixed(1)} ${(y1 + uy * t2).toFixed(1)}`;
  });
})();

/** A small brass deepam with a flame, centred on (0,0) at its base; ~26px wide in kolam pixels. */
function Deepam({ big = false }: { big?: boolean }) {
  const s = big ? 3 : 1;
  return (
    <g transform={`scale(${s})`}>
      <path d="M-11 0C-11 6-6 9 0 9S11 6 11 0Z" fill="url(#kr-brass)" stroke="#6e4a14" strokeWidth="0.8" />
      <ellipse cy="0" rx="11" ry="2.6" fill="#f3d27a" stroke="#6e4a14" strokeWidth="0.7" />
      <path className="kr-flame" d="M0-17C4-10 4-5 0 0-4-5-4-10 0-17Z" />
    </g>
  );
}


const PETAL_KINDS = ["marigold", "marigold-yellow", "mallipoo", "rose"] as const;
function showerPetals(host: HTMLElement, seconds = 2) {
  const count = window.innerWidth < 768 ? 16 : 26;
  const H = host.offsetHeight;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = `kr-flower kr-flower--${PETAL_KINDS[i % PETAL_KINDS.length]}`;
    p.style.left = `${Math.random() * 100}%`;
    host.appendChild(p);
    const dur = seconds + Math.random() * 0.8;
    const sway = (Math.random() < 0.5 ? -1 : 1) * (14 + Math.random() * 26);
    gsap
      .timeline({ delay: Math.random() * 0.5, onComplete: () => p.remove() })
      .fromTo(p, { y: -30, autoAlpha: 0, rotate: Math.random() * 360 }, { autoAlpha: 1, duration: 0.2 }, 0)
      .to(p, { y: H * 0.9, rotate: `+=${180 + Math.random() * 240}`, duration: dur, ease: "sine.in" }, 0)
      .to(p, { x: sway, duration: dur / 4, ease: "sine.inOut", yoyo: true, repeat: 3 }, 0)
      .to(p, { autoAlpha: 0, duration: 0.35 }, dur - 0.35);
  }
}

/* ──────────────────────────── the RSVP ──────────────────────────── */

type Phase = "open" | "saving" | "done";

/**
 * RSVP in one meaningful tap: the guest completes the kolam. It is drawn whole except its
 * centre (a faint dashed outline with a pulsing gold ring); tapping the centre — or the equal
 * "Joyfully accept" button — saves the answer at once. A dot drops into the centre, its lines
 * draw to join the rest, a brass lamp lights on it, flames light on every other dot from the
 * centre outwards and the cells fill with haldi, kumkum and leaf green, petals fall. Then:
 * a check, "Your response is saved", Add to calendar and Get directions. When the
 * backend can tell how many have accepted, a wall of lit lamps appears below.
 * Every visit starts fresh (nothing is kept on the device). Works with animations off and without the kolam art.
 */
export function KolamRsvp() {
  const { id: weddingId, rsvp, couple, wedding, events, venue } = useWedding();
  const { guestName, isPersonalized } = useGuest();
  const { playSfx } = useAudio();
  const reduced = usePrefersReducedMotion();
  // nothing is remembered on this device: every visit starts with the unlit kolam
  const [phase, setPhase] = useState<Phase>("open");
  const [fresh, setFresh] = useState(false); // accepted just now
  const [burst, setBurst] = useState(false); // the dense shower of jasmine, about four seconds of it
  const accepted = useAcceptedThisVisit(); // no flowers fall until the guest accepts
  const [handOn, setHandOn] = useState(true); // the tapping hand, until the first tap
  const [error, setError] = useState("");
  const [artFailed, setArtFailed] = useState(false);
  const [wall, setWall] = useState<LampWall | null>(null);
  const [live, setLive] = useState("");

  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const confirm = useRef<HTMLDivElement>(null);
  const framed = useRef<HTMLDivElement>(null);
  // one screen tall, like the gallery: the content scales down to fit when it is taller
  useFitToScreen(root, framed);

  const name = (isPersonalized && guestName) || guestName || "Dear guest";
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const muh = events.find((e) => e.startISO === wedding.dateISO);
  const calUrl = calendarUrl(`${first.name} weds ${second.name} – Wedding`, wedding.dateISO, `${venue.name}, ${venue.address}`, muh?.endISO);
  const query = venue.mapsQuery || `${venue.name}, ${venue.address}`;
  const city = wedding.city.split(",")[0];
  const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: wedding.timeZone, ...o }).format(new Date(iso));
  const dates = (() => {
    const all = [...events.map((e) => e.startISO), wedding.dateISO].sort();
    const a = all[0], b = all[all.length - 1];
    const sameMonth = fmt(a, { month: "long", year: "numeric" }) === fmt(b, { month: "long", year: "numeric" });
    if (a.slice(0, 10) === b.slice(0, 10)) return fmt(b, { day: "numeric", month: "long", year: "numeric" });
    return sameMonth ? `${fmt(a, { day: "numeric" })}–${fmt(b, { day: "numeric", month: "long", year: "numeric" })}` : `${fmt(a, { day: "numeric", month: "long" })} – ${fmt(b, { day: "numeric", month: "long", year: "numeric" })}`;
  })();
  const deadline = rsvp.deadlineISO ? fmt(rsvp.deadlineISO, { day: "numeric", month: "long" }) : null;

  const q = (sel: string) => stage.current?.querySelectorAll<SVGElement | HTMLElement>(sel) ?? [];
  const done = phase === "done";

  // the wall of lamps, only when the backend can count them
  useEffect(() => {
    let alive = true;
    if (done) fetchLampWall(weddingId).then((w) => alive && setWall(w));
    return () => {
      alive = false;
    };
  }, [done, weddingId]);

  // first paint: incomplete (centre missing) — or, for a returning guest, complete and lit
  useLayoutEffect(() => {
    const finished = phase === "done";
    gsap.set(q(".kr-cross"), { strokeDashoffset: finished ? 0 : 1 });
    gsap.set(q(".kr-cdot"), { autoAlpha: finished ? 1 : 0, y: 0 });
    gsap.set(q(".kr-lamp"), { autoAlpha: finished ? 1 : 0, scale: 1, transformOrigin: "50% 100%" });
    gsap.set(q(".kr-dflame"), { autoAlpha: finished ? 1 : 0, scale: 1, transformOrigin: "50% 100%" });
    gsap.set(q(".kr-fill"), { autoAlpha: finished ? 1 : 0 });
    gsap.set(q(".kr-missing"), { autoAlpha: finished ? 0 : 1 });
    if (!reduced && stage.current) gsap.set(stage.current, { clipPath: "circle(0% at 50% 50%)" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** After the frame has drawn itself, the centre kolam draws (opens out from its middle). */
  const drawCentre = () => {
    if (reduced || !stage.current) return;
    gsap.to(stage.current, { clipPath: "circle(75% at 50% 50%)", duration: 1.1, ease: "power2.inOut", clearProps: "clipPath" });
  };

  const accept = async () => {
    if (phase !== "open") return;
    setError("");
    setHandOn(false);
    setPhase("saving");
    playSfx("tap", { gesture: true, owner: root.current });
    const c = KOLAM;
    // 1 · a white dot drops into the centre with a small bounce (it lifts out again if saving fails)
    if (!reduced) gsap.fromTo(q(".kr-cdot"), { autoAlpha: 1, y: -c.cut * 1.6 }, { y: 0, duration: 0.55, ease: "bounce.out" });
    else gsap.set(q(".kr-cdot"), { autoAlpha: 1, y: 0 });

    const input = { name: (isPersonalized && guestName) || "Guest", attending: true, guests: 1, message: "" };
    const minWait = new Promise((r) => window.setTimeout(r, reduced ? 0 : 550));
    try {
      // sent to the backend (one answer per guest there); nothing is kept on this device
      if (backendReady) await submitRsvp(weddingId, input, isPersonalized ? guestName : undefined);
      await minWait;
    } catch {
      await minWait;
      if (!reduced) gsap.to(q(".kr-cdot"), { y: -c.cut * 1.6, autoAlpha: 0, duration: 0.4, ease: "power2.in" });
      else gsap.set(q(".kr-cdot"), { autoAlpha: 0 });
      setPhase("open");
      setError("Could not save. Please try again.");
      return;
    }

    // saved: complete the kolam; a dense shower of jasmine
    setFresh(true);
    setPhase("done");
    setBurst(true);
    markAcceptedThisVisit();
    window.setTimeout(() => setBurst(false), 8000); // (the last flowers of the shower have landed by then)
    setLive("Your response is saved. The celebration is complete.");
    // a short buzz on phones that allow it (only while the tap still counts as the guest's own)
    const act = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation;
    if (!act || act.isActive) navigator.vibrate?.(35);
    if (reduced) {
      gsap.set(q(".kr-cross"), { strokeDashoffset: 0 });
      gsap.set(q(".kr-lamp, .kr-dflame, .kr-fill"), { autoAlpha: 1 });
      gsap.set(q(".kr-missing"), { autoAlpha: 0 });
      playSfx("bell", { volume: 0.5 });
      return;
    }
    const flames = [...q(".kr-dflame")];
    const order = flames
      .map((el) => ({ el, d: Number((el as HTMLElement).dataset.d) }))
      .sort((a, b) => a.d - b.d);
    const tl = gsap.timeline();
    tl.to(q(".kr-missing"), { autoAlpha: 0, duration: 0.3 }, 0);
    // 2 · its lines draw to join the rest
    tl.call(() => playSfx("kolam", { volume: 0.35, owner: root.current }), undefined, 0);
    tl.to(q(".kr-cross"), { strokeDashoffset: 0, duration: 0.6, ease: "power1.inOut", stagger: 0.08 }, 0);
    // 3 · the brass lamp appears on the centre dot and lights
    tl.fromTo(q(".kr-lamp"), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, 0.75);
    tl.call(() => {
      playSfx("flame", { volume: 0.5, owner: root.current });
      playSfx("bell", { volume: 0.5 });
      if (root.current) showerPetals(root.current, 2);
    }, undefined, 1.1);
    // 4 · flames light on every other dot, from the centre outwards; the cells fill with colour
    const maxD = order[order.length - 1]?.d || 1;
    order.forEach(({ el, d }) => tl.fromTo(el, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, 1.25 + (d / maxD) * 1.3));
    tl.to(q(".kr-fill"), { autoAlpha: 1, duration: 1.4, ease: "sine.inOut" }, 1.4);
  };


  // the confirmation rises in right after accepting; focus moves to it
  useLayoutEffect(() => {
    if (!done || !fresh || !confirm.current) return;
    confirm.current.focus({ preventScroll: true });
    if (reduced) return;
    const t = gsap.fromTo(confirm.current.children, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 1.6, ease: "power2.out" });
    return () => void t.kill();
  }, [done, fresh, reduced]);

  const W = KOLAM.w, H = KOLAM.h;
  // the others on the wall (this guest is the "You" lamp, so their own name is left out once)
  const own = name.trim().split(/\s+/)[0];
  const wallNames = (() => {
    const list = [...(wall?.names ?? [])];
    const i = list.findIndex((n) => n === own);
    if (i >= 0) list.splice(i, 1);
    return list.slice(0, 23);
  })();
  const saving = phase === "saving";

  return (
    <section ref={root} id="rsvp" aria-labelledby="kr-heading" className="kr-section kr-velvet">
      {/* no flowers until the guest accepts: then a dense shower, then a light slow fall */}
      {accepted && <JasmineFall burst={burst} density={0.6} fromTop slow />}
      <RsvpSides lit={done} />
      <div ref={framed} className="kr-framed">
      <KolamFrame lit={done} onDrawn={drawCentre} />
      <div className="kr-col">
        <p className="kr-label">R · S · V · P</p>
        <h2 id="kr-heading" className="kr-heading">
          {done ? <>The celebration is complete, {name}!</> : <>{name}, your presence completes our celebration</>}
        </h2>
        <p className="kr-when">
          {dates} · {city}
        </p>
        {deadline && !done && <p className="kr-deadline">Kindly respond by {deadline}</p>}

        {/* the kolam: complete but for its centre */}
        {!artFailed && (
          <div ref={stage} className="kr-stage" style={{ aspectRatio: `${W} / ${H}` }}>
            <img src="/media/kolam-fill.webp" alt="" aria-hidden className="kr-layer kr-fill" draggable={false} />
            <img
              src="/media/kolam-lines.webp"
              alt="A rice-flour kolam of loops and dots, complete except for its centre"
              className="kr-layer"
              draggable={false}
              onError={() => setArtFailed(true)}
            />
            <svg className="kr-layer kr-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden>
              <defs>
                <linearGradient id="kr-brass" x1="0" x2="1">
                  <stop offset="0" stopColor="#7a5216" />
                  <stop offset="0.35" stopColor="#f3d27a" />
                  <stop offset="0.62" stopColor="#c8952f" />
                  <stop offset="1" stopColor="#6e4a14" />
                </linearGradient>
                <mask id="kr-centre-mask" maskUnits="userSpaceOnUse">
                  {CROSS.map((d, i) => (
                    <path key={i} className="kr-cross" d={d} pathLength={1} stroke="#fff" strokeWidth="26" strokeLinecap="round" fill="none" strokeDasharray="1" />
                  ))}
                </mask>
              </defs>
              {/* the missing centre: a faint dashed outline */}
              <circle className="kr-missing" cx={KOLAM.cx} cy={KOLAM.cy} r={KOLAM.cut - 6} fill="none" stroke="#fffaf0" strokeOpacity="0.45" strokeWidth="3" strokeDasharray="7 9" />
              {/* its real lines, revealed as they draw */}
              <image href="/media/kolam-centre.webp" x={KOLAM.cx - KOLAM.cut} y={KOLAM.cy - KOLAM.cut} width={KOLAM.cut * 2} height={KOLAM.cut * 2} mask="url(#kr-centre-mask)" />
              {/* the centre dot that drops in */}
              <circle className="kr-cdot" cx={KOLAM.cx} cy={KOLAM.cy} r="9" fill="#fffaf0" />
              {/* flames on every other dot */}
              {KOLAM_DOTS.map(([x, y]) => (
                <g key={`${x},${y}`} transform={`translate(${x} ${y - 2})`}>
                  <path className="kr-dflame" data-d={Math.hypot(x - KOLAM.cx, y - KOLAM.cy).toFixed(0)} d="M0-15C3.6-9 3.6-4.5 0 0-3.6-4.5-3.6-9 0-15Z" />
                </g>
              ))}
              {/* the brass lamp on the centre dot */}
              <g transform={`translate(${KOLAM.cx} ${KOLAM.cy + 6})`}>
                <g className="kr-lamp">
                  <Deepam big />
                </g>
              </g>
            </svg>
            {/* the tap target and its pulsing gold ring */}
            {!done && (
              <button
                type="button"
                className="kr-centre"
                style={{ left: pct(KOLAM.cx, W), top: pct(KOLAM.cy, H) }}
                onClick={accept}
                disabled={saving}
                aria-label="Complete the kolam: accept the invitation"
              >
              </button>
            )}
          </div>
        )}

        {!done && (
          <>
            <p className="kr-hint">Tap on the Accept button</p>
            <span className="kr-accept-wrap">
              <button type="button" className="kr-accept" onClick={accept} disabled={saving} aria-busy={saving || undefined}>
                {saving ? <span aria-hidden className="kr-spinner" /> : null}
                {saving ? "Saving…" : "Joyfully accept"}
              </button>
              {/* the tapping hand: its fingertip on the button's lower right corner */}
              {handOn && !reduced && (
                <span aria-hidden className="kr-hand">
                  <span className="kr-ripple" />
                  <svg viewBox="0 0 40 48" className="kr-hand-svg">
                    <path
                      d="M15 22V8a3 3 0 0 1 6 0v11l1-1a3 3 0 0 1 5 2v1a3 3 0 0 1 5 1v1a3 3 0 0 1 5 1v8c0 7-5 12-12 12h-2c-4 0-7-2-9-5l-6-9a3 3 0 0 1 4-4l3 3Z"
                      fill="#fbf2dc"
                      stroke="#5e1220"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </span>
            {error && (
              <p className="kr-error" role="alert">
                {error}
              </p>
            )}
          </>
        )}

        {done && (
          <div ref={confirm} className="kr-confirm" tabIndex={-1}>
            <p className="kr-saved">
              <svg aria-hidden viewBox="0 0 24 24" className="kr-check">
                <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Your response is saved
            </p>
            <p className="kr-links">
              <a href={calUrl} target="_blank" rel="noopener noreferrer">
                Add to calendar
              </a>
              <span aria-hidden>·</span>
              <a href={directionsUrl(query)} target="_blank" rel="noopener noreferrer">
                Get directions
              </a>
            </p>
          </div>
        )}

        {/* the wall of lamps: only when the backend can count who has accepted */}
        {done && wall && wall.count > 0 && (
          <div className="kr-wall">
            <p className="kr-wall-title">
              {wall.count} {wall.count === 1 ? "family is" : "families are"} joining us
            </p>
            <ul className="kr-lamps">
              <li className={`kr-lampcell kr-lampcell--you ${fresh && !reduced ? "kr-lampcell--fly" : ""}`}>
                <svg viewBox="-16 -20 32 32" aria-hidden className="kr-lampsvg">
                  <defs>
                    <linearGradient id="kr-brass2" x1="0" x2="1">
                      <stop offset="0" stopColor="#7a5216" />
                      <stop offset="0.4" stopColor="#f3d27a" />
                      <stop offset="1" stopColor="#6e4a14" />
                    </linearGradient>
                  </defs>
                  <path d="M-11 0C-11 6-6 9 0 9S11 6 11 0Z" fill="url(#kr-brass2)" />
                  <path className="kr-flame" d="M0-17C4-10 4-5 0 0-4-5-4-10 0-17Z" />
                </svg>
                <span>You</span>
              </li>
              {wallNames.map((n, i) => (
                <li key={`${n}-${i}`} className="kr-lampcell">
                  <svg viewBox="-16 -20 32 32" aria-hidden className="kr-lampsvg">
                    <path d="M-11 0C-11 6-6 9 0 9S11 6 11 0Z" fill="url(#kr-brass2)" />
                    <path className="kr-flame" d="M0-17C4-10 4-5 0 0-4-5-4-10 0-17Z" />
                  </svg>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
            {wall.count > 24 && <p className="kr-more">+ {wall.count - 24} more</p>}
          </div>
        )}

        <p role="status" aria-live="polite" className="sr-only">
          {live}
        </p>
      </div>
      </div>
    </section>
  );
}
