import { useLayoutEffect, useRef, useState, type CSSProperties, type MutableRefObject } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Lightbox } from "@/components/sections/gallery/Lightbox";
import { MotionPathPlugin } from "@/lib/gsap";

/* ── Edit here: the love story, in order ───────────────────────────── */
const HEADING = "Our Love Story";
const PHOTOS = [
  { src: "/media/gallery/photo-1.webp", caption: "Where it all began" },
  { src: "/media/gallery/photo-2.webp", caption: "Our first adventure" },
  { src: "/media/gallery/photo-3.webp", caption: "She said yes" },
  { src: "/media/gallery/photo-4.webp", caption: "Two families, one promise" },
  { src: "/media/gallery/photo-5.webp", caption: "Counting down" },
  { src: "/media/gallery/photo-6.webp", caption: "And the story continues" },
];
const ENDING = "to be continued...";
/* ───────────────────────────────────────────────────────────────────── */

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

const emptyRefs = (): BoardRefs => ({
  board: null,
  surface: null,
  plaque: null,
  photos: [],
  desat: [],
  letters: PHOTOS.map(() => []),
  bursts: PHOTOS.map(() => []),
  tag: null,
  svg: null,
  trail: null,
  mask: null,
  plane: null,
  planeBody: null,
});

/**
 * The plane's flight over the board, in board px: from just off the top left
 * to each photo's top right corner (by its pin, never over a face), swooping
 * between photos and looping twice on the way, then a last loop down to the
 * "to be continued..." tag. Returns the path and, for each landing, how far
 * along it is (0–1).
 */
function planFlight(r: BoardRefs) {
  const s = r.surface!;
  const W = s.offsetWidth;
  const H = s.offsetHeight;
  const stops = r.photos.map((p) => ({ x: p!.offsetLeft + p!.offsetWidth * 0.84, y: p!.offsetTop + p!.offsetWidth * 0.05 }));
  const tag = r.tag!;
  stops.push({ x: tag.offsetLeft + tag.offsetWidth * 0.5, y: tag.offsetTop + tag.offsetHeight * 0.15 });
  const start = { x: -0.04 * W, y: Math.min(0.06 * H, 0.1 * W) };
  const seg = (a: { x: number; y: number }, b: { x: number; y: number }, k: number) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const sw = (k % 2 ? 1 : -1) * Math.min(len * 0.35, 0.18 * Math.max(W, 300));
    const c1 = { x: a.x + dx * 0.25 + nx * sw, y: a.y + dy * 0.25 + ny * sw };
    const c2 = { x: a.x + dx * 0.75 + nx * sw, y: a.y + dy * 0.75 + ny * sw };
    const loop = k === 2 || k === 4 || k === stops.length - 1;
    if (!loop) return ` C${c1.x},${c1.y} ${c2.x},${c2.y} ${b.x},${b.y}`;
    // swoop to the middle, turn a loop there, then swoop on
    const m = { x: (a.x + b.x) / 2 + nx * sw * 0.6, y: (a.y + b.y) / 2 + ny * sw * 0.6 };
    const rr = Math.max(18, Math.min(46, len * 0.12));
    return (
      ` Q${c1.x},${c1.y} ${m.x},${m.y}` +
      ` a${rr},${rr} 0 1 1 0,${-2 * rr} a${rr},${rr} 0 1 1 0,${2 * rr}` +
      ` Q${c2.x},${c2.y} ${b.x},${b.y}`
    );
  };
  let d = `M${start.x},${start.y}`;
  const parts: string[] = [];
  stops.forEach((b, k) => {
    d += seg(k ? stops[k - 1] : start, b, k);
    parts.push(d);
  });
  // how far along the whole path each landing is
  const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
  r.svg!.appendChild(probe);
  const lens = parts.map((p) => (probe.setAttribute("d", p), probe.getTotalLength()));
  probe.remove();
  const total = lens[lens.length - 1] || 1;
  return { d, W, H, at: lens.map((l) => l / total) };
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
    <svg viewBox="0 0 48 32" className="h-full w-full" aria-hidden>
      <path d="M2 16 46 3 29 29 21 19Z" fill="#ffffff" stroke="#5e1220" strokeOpacity="0.35" strokeWidth="1" strokeLinejoin="round" />
      <path d="M21 19 46 3 17 17Z" fill="#f2ece2" stroke="#5e1220" strokeOpacity="0.35" strokeWidth="1" strokeLinejoin="round" />
      <path d="M21 19 46 3" stroke="#5e1220" strokeWidth="0.9" strokeOpacity="0.8" />
    </svg>
  );
}

function Board({ r, still, onOpen }: { r: MutableRefObject<BoardRefs>; still: boolean; onOpen: (i: number) => void }) {
  const { wedding } = useWedding();
  const d = new Date(wedding.dateISO);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: wedding.timeZone, ...o }).format(d);
  const date = `${f({ day: "2-digit" })} · ${f({ month: "2-digit" })} · ${f({ year: "numeric" })}`;
  const hide = still ? "" : "invisible";

  return (
    <div ref={(el) => void (r.current.board = el)} className="gb-board">
      <div ref={(el) => void (r.current.surface = el)} className="gb-surface">
        <div ref={(el) => void (r.current.plaque = el)} className="gb-plaque">
          <h2 id="gallery-heading">{HEADING}</h2>
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
        <svg aria-hidden viewBox="-30 -30 60 60" className="gb-extra gb-kolam">
          {[[-12, -12], [12, -12], [-12, 12], [12, 12], [0, 0]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.8" fill="#b8893e" />
          ))}
          <path d="M0-24C14-24 24-14 24 0S14 24 0 24-24 14-24 0-14-24 0-24ZM-18 0C-18-10-10-18 0-18M18 0C18 10 10 18 0 18" fill="none" stroke="#b8893e" strokeWidth="1.3" />
          <path d="M-24 0H24M0-24V24" stroke="#b8893e" strokeWidth="0.8" strokeDasharray="2 3" />
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
                  <img src={p.src} alt={p.caption} loading="lazy" decoding="async" className="block h-full w-full object-cover" draggable={false} />
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
          <span>{ENDING}</span>
        </div>

        {/* the flight path: a dotted gold trail, revealed behind the plane */}
        <svg ref={(el) => void (r.current.svg = el)} aria-hidden className="gb-flight">
          <defs>
            <mask id="gb-trail-mask" maskUnits="userSpaceOnUse">
              <path ref={(el) => void (r.current.mask = el)} fill="none" stroke="#fff" strokeWidth="10" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
            </mask>
          </defs>
          <path ref={(el) => void (r.current.trail = el)} fill="none" stroke="#b8893e" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.1 9" mask="url(#gb-trail-mask)" />
        </svg>

        <div ref={(el) => void (r.current.plane = el)} aria-hidden className="gb-plane">
          <div ref={(el) => void (r.current.planeBody = el)} className="h-full w-full">
            <Plane />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Puts the plane `p` (0–1) along the flight, and reveals the trail up to it. */
function placePlane(r: BoardRefs, raw: ReturnType<typeof MotionPathPlugin.getRawPath>, p: number) {
  const q = MotionPathPlugin.getPositionOnPath(raw, Math.min(1, Math.max(0, p)), true) as { x: number; y: number; angle: number };
  if (r.plane) r.plane.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px) translate(-50%, -50%) rotate(${q.angle.toFixed(2)}deg)`;
  if (r.mask) r.mask.style.strokeDashoffset = `${1 - p}`;
  return q;
}

function setupFlight(r: BoardRefs) {
  const plan = planFlight(r);
  r.svg!.setAttribute("viewBox", `0 0 ${plan.W} ${plan.H}`);
  r.trail!.setAttribute("d", plan.d);
  r.mask!.setAttribute("d", plan.d);
  const raw = MotionPathPlugin.getRawPath(r.trail!);
  MotionPathPlugin.cacheRawPathMeasurements(raw);
  return { ...plan, raw };
}

/**
 * Our Love Story — a photo board in a carved wooden frame with a paper plane
 * that flies from photo to photo. The section pins (about one screen of scroll
 * per photo, scrub 1): the plane follows one curved path through the six
 * polaroids, swooping and looping, a dotted gold trail drawn behind it. Each
 * photo waits pale and small until the plane lands on it, then comes to full
 * colour with a little bounce, its caption writes in and petals burst from its
 * pin. After the sixth the plane loops down to "to be continued..." and all the
 * photos pulse once. On phones the board is taller than the screen and the view
 * follows the plane. Tap a photo to open it large. Scrolling back reverses it.
 */
export function LoveStoryScene() {
  const r = useRef<BoardRefs>(emptyRefs());
  const [open, setOpen] = useState<number | null>(null);

  const build: Build = (tl) => {
    const R = r.current;
    const f = setupFlight(R);
    const vh = window.innerHeight;
    const board = R.board!;
    const tall = () => board.offsetHeight > vh - 24;
    const proxy = { p: 0 };
    const follow = () => {
      const q = placePlane(R, f.raw, proxy.p);
      // a slight tilt and bob while flying
      if (R.planeBody) R.planeBody.style.transform = `translateY(${(Math.sin(proxy.p * 90) * 3).toFixed(1)}px) rotate(${(Math.sin(proxy.p * 70) * 6).toFixed(1)}deg)`;
      // phones: the view moves down the board so the plane stays near the middle of the screen
      if (tall()) {
        const top = R.surface!.offsetTop + board.offsetTop;
        const y = Math.min(16, Math.max(vh - board.offsetHeight - 16, vh * 0.5 - (top + q.y)));
        board.style.transform = `translateY(${y.toFixed(1)}px)`;
      } else board.style.transform = "";
    };
    follow();

    tl.fromTo(R.plaque, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0);
    const LEG = 1; // one screen of scroll per photo
    PHOTOS.forEach((_, i) => {
      const t0 = 0.2 + i * LEG;
      const photo = R.photos[i];
      // fly to the photo, slowing as it arrives
      tl.fromTo(proxy, { p: i ? f.at[i - 1] : 0 }, { p: f.at[i], duration: 0.7 * LEG, ease: "power2.inOut", onUpdate: follow, immediateRender: false }, t0);
      // the landing: full colour, a small bounce, the caption writes in, petals burst from the pin
      tl.fromTo(photo, { scale: 0.94, autoAlpha: 0.55 }, { scale: 1.06, autoAlpha: 1, duration: 0.14 * LEG, ease: "back.out(3)" }, t0 + 0.68 * LEG);
      tl.fromTo(R.desat[i], { opacity: 0.75 }, { opacity: 0, duration: 0.14 * LEG }, t0 + 0.68 * LEG);
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
    tl.fromTo(proxy, { p: f.at[PHOTOS.length - 1] }, { p: 1, duration: 0.8 * LEG, ease: "power2.inOut", onUpdate: follow, immediateRender: false }, tEnd);
    tl.fromTo(R.tag, { scale: 0.9, autoAlpha: 0.6 }, { scale: 1, autoAlpha: 1, duration: 0.15, ease: "back.out(3)" }, tEnd + 0.75 * LEG);
    tl.to(R.photos, { scale: 1.05, duration: 0.12, ease: "sine.out" }, tEnd + 0.95 * LEG).to(R.photos, { scale: 1, duration: 0.15, ease: "sine.in" }, tEnd + 1.07 * LEG);
    tl.to({}, { duration: 0.4 });
  };

  return (
    <Scene
      id="gallery"
      labelledBy="gallery-heading"
      className="cobalt"
      build={build}
      edgeTop={<div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "var(--sky-top)" }} />}
    >
      <div className="gb-viewport">
        <Board r={r} still={false} onOpen={setOpen} />
      </div>
      {open !== null && <Lightbox images={PHOTOS.map((p) => ({ src: p.src, alt: p.caption, caption: p.caption }))} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </Scene>
  );
}

/** Reduced motion: no pinning, every photo in full colour, the plane resting on the last photo. */
export function LoveStoryStill() {
  const r = useRef<BoardRefs>(emptyRefs());
  const [open, setOpen] = useState<number | null>(null);
  useLayoutEffect(() => {
    const place = () => {
      const f = setupFlight(r.current);
      placePlane(r.current, f.raw, f.at[PHOTOS.length - 1]);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(r.current.surface!);
    return () => ro.disconnect();
  }, []);
  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="cobalt relative px-[3vw] py-12">
      <Board r={r} still onOpen={setOpen} />
      {open !== null && <Lightbox images={PHOTOS.map((p) => ({ src: p.src, alt: p.caption, caption: p.caption }))} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}
