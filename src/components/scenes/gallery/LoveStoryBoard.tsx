import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MutableRefObject } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Lightbox } from "@/components/sections/gallery/Lightbox";
import { gsap, MotionPathPlugin, ScrollTrigger } from "@/lib/gsap";

/** The love story comes from the config (wedding.config.ts → gallery): up to 6 photos. */
type Photo = { src: string; caption: string; alt: string };
function useStory() {
  const { gallery } = useWedding();
  const photos: Photo[] = (gallery?.photos ?? []).slice(0, 6).map((p) => ({ src: p.src, caption: p.caption ?? "", alt: p.alt || p.caption || "A photo from our story" }));
  return { heading: gallery?.heading ?? "Our Love Story", ending: gallery?.ending ?? "to be continued...", photos };
}

/** Where each polaroid sits: desktop [left %, top %] of the board (a loose zigzag, top left → bottom right);
 *  phones alternate left / right down the board. Each has its own small tilt, holder and maybe a marigold. */
const SPOTS = [
  { dx: 5, dy: 12, rot: -4.5, hold: "pin", marigold: true },
  { dx: 21, dy: 50, rot: 3.5, hold: "tape", marigold: false },
  { dx: 37, dy: 10, rot: -2, hold: "pin", marigold: false },
  { dx: 53, dy: 48, rot: 5, hold: "tape", marigold: true },
  { dx: 69, dy: 12, rot: -5.5, hold: "pin", marigold: false },
  { dx: 81, dy: 47, rot: 2.5, hold: "tape", marigold: true },
] as const;

interface BoardRefs {
  board: HTMLDivElement | null;
  surface: HTMLDivElement | null;
  plaque: HTMLDivElement | null;
  photos: (HTMLButtonElement | null)[];
  desat: (HTMLSpanElement | null)[];
  letters: HTMLSpanElement[][];
  bursts: (HTMLSpanElement | null)[][];
  tag: HTMLDivElement | null;
  svg: SVGSVGElement | null;
  trail: SVGPathElement | null;
  mask: SVGPathElement | null;
  plane: HTMLDivElement | null;
  planeBody: HTMLDivElement | null;
}

const emptyRefs = (n: number): BoardRefs => ({
  board: null,
  surface: null,
  plaque: null,
  photos: [],
  desat: [],
  letters: Array.from({ length: n }, () => []),
  bursts: Array.from({ length: n }, () => []),
  tag: null,
  svg: null,
  trail: null,
  mask: null,
  plane: null,
  planeBody: null,
});

type Pt = { x: number; y: number };

/**
 * The plane's flight over the board, in board px: from just off the top left
 * to each photo's top right corner (by its pin, never over a face), swooping
 * between photos and looping twice on the way, then a last loop down to the
 * "to be continued..." tag. The whole flight is one smooth curve: a
 * Catmull-Rom spline through the waypoints, written as cubic Béziers (no
 * corners anywhere, the loops included). Returns the path and, for each
 * landing, how far along it is (0–1).
 */
function planFlight(r: BoardRefs) {
  const s = r.surface!;
  const W = s.offsetWidth;
  const H = s.offsetHeight;
  const stops: Pt[] = r.photos.map((p) => ({ x: p!.offsetLeft + p!.offsetWidth * 0.84, y: p!.offsetTop + p!.offsetWidth * 0.05 }));
  const tag = r.tag!;
  stops.push({ x: tag.offsetLeft + tag.offsetWidth * 0.5, y: tag.offsetTop + tag.offsetHeight * 0.15 });
  const start = { x: -0.04 * W, y: Math.min(0.06 * H, 0.1 * W) };

  // waypoints: between two stops a swoop (a point off to one side), and on some legs a loop
  const pts: Pt[] = [start];
  const landing: number[] = [];
  stops.forEach((b, k) => {
    const a = pts[pts.length - 1];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const sw = (k % 2 ? 1 : -1) * Math.min(len * 0.22, 0.12 * Math.max(W, 300));
    const mid = { x: a.x + dx * 0.5 + nx * sw, y: a.y + dy * 0.5 + ny * sw };
    if (k === 2 || k === 4 || k === stops.length - 1) {
      // a loop at the middle of the leg: in at the bottom, forward and up, over the top,
      // back down behind, and out again a little ahead (u = along the leg, n = to its side)
      const rr = Math.max(22, Math.min(50, len * 0.14));
      const ux = dx / len, uy = dy / len;
      const side = sw >= 0 ? 1 : -1;
      const p = (fu: number, fn: number) => ({ x: mid.x + ux * fu * rr + nx * side * fn * rr, y: mid.y + uy * fu * rr + ny * side * fn * rr });
      pts.push(p(0, 0), p(1, 1), p(0, 2), p(-1, 1), p(0.9, 0));
    } else pts.push(mid);
    pts.push(b);
    landing.push(pts.length - 1);
  });

  // Catmull-Rom → cubic Béziers (smooth through every point)
  const seg = (i: number) => {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    return ` C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  };
  let d = `M${start.x.toFixed(1)},${start.y.toFixed(1)}`;
  const upTo: string[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    d += seg(i);
    upTo[i + 1] = d;
  }
  // how far along the whole path each landing is
  const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
  r.svg!.appendChild(probe);
  probe.setAttribute("d", d);
  const total = probe.getTotalLength() || 1;
  const at = landing.map((idx) => (probe.setAttribute("d", upTo[idx]), probe.getTotalLength() / total));
  probe.remove();
  return { d, W, H, at };
}

function Marigold() {
  return (
    <svg aria-hidden viewBox="-12 -12 24 24" className="gb-marigold">
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} rx="3.2" ry="7" fill={i % 2 ? "#f39a1e" : "#f6b532"} transform={`rotate(${i * 30}) translate(0 -4)`} />
      ))}
      <circle r="3.4" fill="#d9701a" />
    </svg>
  );
}

function Plane() {
  return (
    <svg viewBox="0 0 48 32" className="h-full w-full overflow-visible" aria-hidden>
      <path d="M2 16 46 3 29 29 21 19Z" fill="#ffffff" stroke="#e8c56b" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M21 19 46 3 17 17Z" fill="#f4efe6" stroke="#e8c56b" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M21 19 46 3" stroke="#7a1f2b" strokeWidth="1.1" />
    </svg>
  );
}

function Board({ r, still, onOpen, story }: { r: MutableRefObject<BoardRefs>; still: boolean; onOpen: (i: number) => void; story: ReturnType<typeof useStory> }) {
  const PHOTOS = story.photos;
  const { wedding } = useWedding();
  const d = new Date(wedding.dateISO);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: wedding.timeZone, ...o }).format(d);
  const date = `${f({ day: "2-digit" })} · ${f({ month: "2-digit" })} · ${f({ year: "numeric" })}`;
  const hide = still ? "" : "invisible";

  return (
    <div ref={(el) => void (r.current.board = el)} className="gb-board">
      <div ref={(el) => void (r.current.surface = el)} className="gb-surface" style={{ ["--count" as string]: PHOTOS.length } as CSSProperties}>
        <div ref={(el) => void (r.current.plaque = el)} className="gb-plaque">
          <h2 id="gallery-heading">{story.heading}</h2>
        </div>

        {/* little things stuck between the photos */}
        <svg aria-hidden viewBox="0 0 160 40" className="gb-extra gb-jasmine">
          <path d="M4 10C40 34 120 34 156 10" fill="none" stroke="#5d8a3a" strokeWidth="1.4" />
          {Array.from({ length: 11 }, (_, i) => {
            const t = (i + 0.5) / 11;
            const x = 4 + t * 152;
            const y = 10 + Math.sin(t * Math.PI) * 18;
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${(t - 0.5) * 60})`}>
                <ellipse rx="3.2" ry="5" fill="#fffdf6" stroke="#d8ccb2" strokeWidth="0.6" />
                {i === 5 && <circle r="4.2" fill="#c8323e" />}
              </g>
            );
          })}
        </svg>
        <svg aria-hidden viewBox="0 0 32 28" className="gb-extra gb-heart">
          <path d="M16 26C6 18 1 13 1 8a7 7 0 0 1 15-3 7 7 0 0 1 15 3c0 5-5 10-15 18Z" fill="#c8323e" />
          <path d="M8 6c-2 1-3 3-3 5" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
        <div aria-hidden className="gb-extra gb-datetag">
          <span>{date}</span>
        </div>

        {PHOTOS.map((p, i) => {
          const s = SPOTS[i % SPOTS.length];
          return (
            <button
              key={p.src}
              ref={(el) => void (r.current.photos[i] = el)}
              type="button"
              onClick={() => onOpen(i)}
              className="gb-photo"
              style={{ ["--i" as string]: i, ["--dx" as string]: `${s.dx}%`, ["--dy" as string]: `${s.dy}%`, ["--mx" as string]: i % 2 ? "26%" : "3%", rotate: `${s.rot}deg` } as CSSProperties}
              aria-label={`Open photo: ${p.caption}`}
            >
              <span className="gb-polaroid">
                <span className="gb-pic">
                  <img src={p.src} alt={p.alt} loading="lazy" decoding="async" className="block h-full w-full object-cover" draggable={false} />
                  {!still && <span ref={(el) => void (r.current.desat[i] = el)} aria-hidden className="gb-desat" />}
                </span>
                <span className="gb-caption" aria-hidden>
                  {[...p.caption].map((ch, k) => (
                    <span key={k} ref={(el) => void (el && (r.current.letters[i][k] = el))} className={`inline-block ${hide}`}>
                      {ch === " " ? " " : ch}
                    </span>
                  ))}
                </span>
              </span>
              {s.hold === "pin" ? <span aria-hidden className="gb-pin" /> : <span aria-hidden className="gb-tape" />}
              {s.marigold && <Marigold />}
              {!still &&
                Array.from({ length: 5 }, (_, k) => (
                  <span
                    key={k}
                    ref={(el) => void (r.current.bursts[i][k] = el)}
                    aria-hidden
                    className="gb-burst invisible"
                    style={{ background: ["#e86a84", "#f39a1e", "#d9463e", "#f6b532", "#fff6e6"][k] }}
                  />
                ))}
            </button>
          );
        })}

        <div ref={(el) => void (r.current.tag = el)} className="gb-endtag">
          <span>{story.ending}</span>
        </div>

        {/* the flight path: a dotted gold trail, revealed behind the plane */}
        <svg ref={(el) => void (r.current.svg = el)} aria-hidden className="gb-flight">
          <defs>
            <mask id="gb-trail-mask" maskUnits="userSpaceOnUse">
              <path ref={(el) => void (r.current.mask = el)} fill="none" stroke="#fff" strokeWidth="10" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
            </mask>
          </defs>
          <path ref={(el) => void (r.current.trail = el)} fill="none" stroke="#e8c56b" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="0.1 9" mask="url(#gb-trail-mask)" />
        </svg>

        <div ref={(el) => void (r.current.plane = el)} aria-hidden className="gb-plane">
          {/* the turn: banking and a small upward arc during a U-turn */}
          <div ref={(el) => void (r.current.planeBody = el)} className="h-full w-full">
            {/* a gentle bob that never stops (CSS) */}
            <div className="gb-plane-bob h-full w-full">
              <Plane />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type Raw = ReturnType<typeof MotionPathPlugin.getRawPath>;

/** Where the plane is at `p` (0–1) along the flight, with the path's direction there (degrees). */
const onPath = (raw: Raw, p: number) => MotionPathPlugin.getPositionOnPath(raw, Math.min(1, Math.max(0, p)), true) as { x: number; y: number; angle: number };

function setupFlight(r: BoardRefs) {
  const plan = planFlight(r);
  r.svg!.setAttribute("viewBox", `0 0 ${plan.W} ${plan.H}`);
  r.trail!.setAttribute("d", plan.d);
  r.mask!.setAttribute("d", plan.d);
  const raw = MotionPathPlugin.getRawPath(r.trail!);
  MotionPathPlugin.cacheRawPathMeasurements(raw);
  return { ...plan, raw };
}

/** Puts the plane at `p`, nose along the path, and the trail drawn up to it (the still board). */
function restPlane(r: BoardRefs, raw: Raw, p: number) {
  const q = onPath(raw, p);
  if (r.plane) r.plane.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px) translate(-50%, -50%) rotate(${q.angle.toFixed(1)}deg)`;
  if (r.mask) r.mask.style.strokeDashoffset = `${1 - p}`;
}

/** Shortest turn from a to b, in degrees (−180…180). */
const turnTo = (a: number, b: number) => ((((b - a) % 360) + 540) % 360) - 180;

/**
 * Our Love Story — a photo board in a carved teak frame with a paper plane
 * that flies from photo to photo. The section pins (about one screen of scroll
 * per photo, scrub 1.8): the plane follows one smooth curve through the six
 * polaroids, swooping and looping, a dotted gold trail drawn behind it (and
 * erased again when it flies back). Each photo waits dimmed until the plane
 * lands on it, then comes to full colour with a little bounce, its caption
 * writes in and petals burst from its pin; flying back, they dim again. When
 * the scroll changes direction the plane makes a quick U-turn (banking, with a
 * small upward arc) so it always flies nose-first. After the sixth it loops
 * down to "to be continued..." and all the photos pulse once. On phones the
 * board is taller than the screen and the view follows the plane.
 */
export function LoveStoryScene() {
  const story = useStory();
  const PHOTOS = story.photos;
  const r = useRef<BoardRefs>(emptyRefs(story.photos.length));
  const [open, setOpen] = useState<number | null>(null);
  /** the flight: where the scroll has the plane (p), which way the scroll goes, the path */
  const fly = useRef<{ p: number; dir: 1 | -1; raw: Raw | null }>({ p: 0, dir: 1, raw: null });

  // Every frame: place the plane on the path, its nose along the path (smoothed, never jumping
  // more than a few degrees a frame), turning round when the scroll changes direction.
  useEffect(() => {
    let shown = 0; // the angle on screen
    let offset = 0; // 0 = nose forward along the path, 180 = flying back
    let facing: 1 | -1 = 1;
    let turn = 1; // U-turn progress (1 = not turning)
    let first = true;
    const tick = (_t: number, dtMs: number) => {
      const R = r.current;
      const raw = fly.current.raw;
      if (!raw || !R.plane) return;
      const scene = R.board?.closest(".scene");
      if (scene && !scene.classList.contains("is-live")) return;
      const dt = Math.min(0.05, dtMs / 1000);
      const q = onPath(raw, fly.current.p);
      // a U-turn whenever the scroll turns round
      if (fly.current.dir !== facing && turn >= 1) {
        facing = fly.current.dir;
        turn = 0;
      }
      let bank = 1;
      let lift = 0;
      if (turn < 1) {
        turn = Math.min(1, turn + dt / 0.5);
        const e = turn < 0.5 ? 2 * turn * turn : 1 - (-2 * turn + 2) ** 2 / 2; // ease in-out
        offset = facing === 1 ? 180 * (1 - e) : 180 * e;
        const k = Math.sin(Math.PI * turn);
        bank = 1 - 0.35 * k; // tilts over as it banks
        lift = -12 * k; // and rises a little through the turn
      } else offset = facing === 1 ? 0 : 180;
      const target = q.angle + offset;
      if (first) {
        shown = target;
        first = false;
      } else shown += Math.max(-7, Math.min(7, turnTo(shown, target)));
      R.plane.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px) translate(-50%, -50%) rotate(${shown.toFixed(2)}deg)`;
      if (R.planeBody) R.planeBody.style.transform = `translateY(${lift.toFixed(1)}px) scaleY(${bank.toFixed(3)})`;
      // the trail: drawn up to the plane (erased behind it when it flies back)
      if (R.mask) R.mask.style.strokeDashoffset = `${1 - fly.current.p}`;
      // phones: the view moves down the board so the plane stays near the middle of the screen
      const board = R.board!;
      const vh = window.innerHeight;
      if (board.offsetHeight > vh - 24) {
        const top = R.surface!.offsetTop + board.offsetTop;
        const y = Math.min(16, Math.max(vh - board.offsetHeight - 16, vh * 0.5 - (top + q.y)));
        board.style.transform = `translateY(${y.toFixed(1)}px)`;
      } else board.style.transform = "";
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const build: Build = (tl, section) => {
    const R = r.current;
    const f = setupFlight(R);
    fly.current.raw = f.raw;
    const proxy = fly.current;
    proxy.p = 0;
    // which way the scroll is going (ScrollTrigger's direction)
    ScrollTrigger.create({ trigger: section, start: "top top", end: "bottom bottom", onUpdate: (self) => void (proxy.dir = self.direction === -1 ? -1 : 1) });

    tl.fromTo(R.plaque, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0);
    const LEG = 1; // one screen of scroll per photo
    PHOTOS.forEach((_, i) => {
      const t0 = 0.2 + i * LEG;
      const photo = R.photos[i];
      // fly to the photo (the path tween itself has no easing; the scroll is smoothed by scrub 1.8)
      tl.fromTo(proxy, { p: i ? f.at[i - 1] : 0 }, { p: f.at[i], duration: 0.7 * LEG, ease: "none", immediateRender: false }, t0);
      // the landing: full colour, a small bounce, the caption writes in, petals burst from the pin
      tl.fromTo(photo, { scale: 0.94, autoAlpha: 0.7 }, { scale: 1.06, autoAlpha: 1, duration: 0.14 * LEG, ease: "back.out(3)" }, t0 + 0.68 * LEG);
      tl.fromTo(R.desat[i], { opacity: 0.5 }, { opacity: 0, duration: 0.14 * LEG }, t0 + 0.68 * LEG);
      tl.fromTo(R.letters[i], { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.04, stagger: (0.22 * LEG) / Math.max(1, R.letters[i].length), ease: "power1.out" }, t0 + 0.74 * LEG);
      R.bursts[i].forEach((b, k) => {
        const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
        tl.fromTo(
          b,
          { x: 0, y: 0, scale: 0.4, rotate: 0, autoAlpha: 0 },
          { keyframes: [{ autoAlpha: 1, duration: 0.02 }, { x: Math.cos(a) * 34, y: Math.sin(a) * 26 + 18, scale: 1, rotate: 160 + k * 40, autoAlpha: 0, duration: 0.24 * LEG }] },
          t0 + 0.7 * LEG,
        );
      });
      // when the plane leaves it settles back to its size, still in full colour
      tl.to(photo, { scale: 1, duration: 0.12 * LEG, ease: "power1.out" }, t0 + LEG);
    });

    // the ending: a last loop down to "to be continued...", and all six pulse together
    const tEnd = 0.2 + PHOTOS.length * LEG;
    tl.fromTo(proxy, { p: f.at[PHOTOS.length - 1] }, { p: 1, duration: 0.8 * LEG, ease: "none", immediateRender: false }, tEnd);
    tl.fromTo(R.tag, { scale: 0.9, autoAlpha: 0.6 }, { scale: 1, autoAlpha: 1, duration: 0.15, ease: "back.out(3)" }, tEnd + 0.75 * LEG);
    tl.to(R.photos, { scale: 1.05, duration: 0.12, ease: "sine.out" }, tEnd + 0.95 * LEG).to(R.photos, { scale: 1, duration: 0.15, ease: "sine.in" }, tEnd + 1.07 * LEG);
    tl.to({}, { duration: 0.4 });
  };

  if (!PHOTOS.length) return null;
  return (
    <Scene
      id="gallery"
      labelledBy="gallery-heading"
      className="gb-wall"
      scrub={1.8}
      build={build}
      edgeTop={<div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#5a0f1c" }} />}
    >
      <div className="gb-viewport">
        <Board r={r} still={false} onOpen={setOpen} story={story} />
      </div>
      {open !== null && <Lightbox images={PHOTOS.map((p) => ({ src: p.src, alt: p.alt, caption: p.caption }))} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </Scene>
  );
}

/** Reduced motion: no pinning, every photo in full colour, the plane resting on the last photo. */
export function LoveStoryStill() {
  const story = useStory();
  const PHOTOS = story.photos;
  const r = useRef<BoardRefs>(emptyRefs(story.photos.length));
  const [open, setOpen] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!r.current.surface) return; // no photos listed
    const place = () => {
      const f = setupFlight(r.current);
      restPlane(r.current, f.raw, f.at[PHOTOS.length - 1]);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(r.current.surface!);
    return () => ro.disconnect();
  }, []);
  if (!PHOTOS.length) return null;
  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="gb-wall relative px-[3vw] py-12">
      <Board r={r} still onOpen={setOpen} story={story} />
      {open !== null && <Lightbox images={PHOTOS.map((p) => ({ src: p.src, alt: p.alt, caption: p.caption }))} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}
