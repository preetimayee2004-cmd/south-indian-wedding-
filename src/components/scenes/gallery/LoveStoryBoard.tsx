import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MutableRefObject } from "react";
import { useAudio, NO_LOOP, type SfxLoop } from "@/context/AudioContext";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Lightbox } from "@/components/sections/gallery/Lightbox";
import { gsap, MotionPathPlugin, ScrollTrigger } from "@/lib/gsap";

/** The love story comes from config (wedding.config.ts → gallery): up to 6 photos. */
type Photo = { src: string; caption: string; alt: string };

function useStory() {
  const { gallery } = useWedding();
  const photos: Photo[] = (gallery?.photos ?? []).slice(0, 6).map((p) => ({
    src: p.src,
    caption: p.caption ?? "",
    alt: p.alt || p.caption || "A photo from our story",
  }));
  return {
    heading: gallery?.heading ?? "Moments to Cherish",
    subtitle: gallery?.subtitle ?? "Little memories, one beautiful story",
    ending: gallery?.ending ?? "and so it begins...",
    photos,
  };
}

/**
 * Where each polaroid sits. Wide screens: a 3 × 2 grid under the plaque (dx/dy are % of the
 * board; the columns leave ~12% of the width between photos, the rows a clear gap so a caption
 * never runs under the photo below). Phones: one column, zig-zagging left and right (CSS).
 * A small tilt only (±2°).
 */
const SPOTS = [
  { dx: 11, dy: 18, rot: -2, hold: "pin" },
  { dx: 41, dy: 18, rot: 1.5, hold: "tape" },
  { dx: 71, dy: 18, rot: -1.5, hold: "pin" },
  { dx: 11, dy: 57, rot: 2, hold: "tape" },
  { dx: 41, dy: 57, rot: -2, hold: "pin" },
  { dx: 71, dy: 57, rot: 1.5, hold: "tape" },
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
 * The plane's flight over the photos: swooping between them, looping along the way,
 * leaving a dotted gold flight trail, and landing at the ending tag.
 */
function planFlight(r: BoardRefs) {
  const s = r.surface!;
  const W = s.offsetWidth;
  const H = s.offsetHeight;
  const stops: Pt[] = r.photos.map((p) => ({
    x: p!.offsetLeft + p!.offsetWidth * 0.84,
    y: p!.offsetTop + p!.offsetWidth * 0.05,
  }));
  const tag = r.tag!;
  const isDesktop = tag.offsetLeft > W * 0.35;
  const planeW = r.plane?.offsetWidth || (isDesktop ? 56 : 44);

  let landingPt: Pt;
  if (isDesktop) {
    const p4Right = (r.photos[4]?.offsetLeft || 0) + (r.photos[4]?.offsetWidth || 0);
    const gap = tag.offsetLeft - p4Right;
    const clear = Math.max(42, Math.min(55, (gap - planeW) * 0.45));
    landingPt = {
      x: tag.offsetLeft - clear - planeW * 0.5,
      y: tag.offsetTop + tag.offsetHeight * 0.5,
    };
  } else {
    const clear = 44;
    landingPt = {
      x: tag.offsetLeft + tag.offsetWidth + clear + planeW * 0.5,
      y: tag.offsetTop + tag.offsetHeight * 0.5,
    };
  }
  stops.push(landingPt);

  const start = { x: -0.04 * W, y: Math.min(0.08 * H, 0.1 * W) };
  const pts: Pt[] = [start];
  const landing: number[] = [];
  stops.forEach((b, k) => {
    const a = pts[pts.length - 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const sw = (k % 2 ? 1 : -1) * Math.min(len * 0.22, 0.12 * Math.max(W, 300));
    const mid = { x: a.x + dx * 0.5 + nx * sw, y: a.y + dy * 0.5 + ny * sw };
    if (k === 2 || k === 4) {
      const rr = Math.max(22, Math.min(50, len * 0.14));
      const ux = dx / len;
      const uy = dy / len;
      const side = sw >= 0 ? 1 : -1;
      const p = (fu: number, fn: number) => ({
        x: mid.x + ux * fu * rr + nx * side * fn * rr,
        y: mid.y + uy * fu * rr + ny * side * fn * rr,
      });
      pts.push(p(0, 0), p(1, 1), p(0, 2), p(-1, 1), p(0.9, 0));
    } else if (k === stops.length - 1 && isDesktop) {
      const wp = {
        x: landingPt.x - planeW,
        y: Math.min(H - 20, tag.offsetTop + tag.offsetHeight + 18),
      };
      pts.push(wp);
    } else {
      pts.push(mid);
    }
    pts.push(b);
    landing.push(pts.length - 1);
  });

  // Catmull-Rom → cubic Béziers
  const seg = (i: number) => {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
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
  const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
  r.svg!.appendChild(probe);
  probe.setAttribute("d", d);
  const total = probe.getTotalLength() || 1;
  const at = landing.map((idx) => {
    probe.setAttribute("d", upTo[idx]);
    return probe.getTotalLength() / total;
  });
  probe.remove();
  return { d, W, H, at };
}

function Plane() {
  return (
    <svg viewBox="0 0 52 34" className="h-full w-full overflow-visible" aria-hidden="true">
      <path d="M5.5 4.1 L49.5 16.9 L21.2 29.6 L19.9 16.9 Z" fill="#ffffff" stroke="#e8c56b" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M19.9 16.9 L49.5 16.9 L17.6 13.1 Z" fill="#fbf5e6" stroke="#e8c56b" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M19.9 16.9 L49.5 16.9" stroke="#7a1f2b" strokeWidth="1.1" />
    </svg>
  );
}

function Board({
  r,
  still,
  onOpen,
  story,
}: {
  r: MutableRefObject<BoardRefs>;
  still: boolean;
  onOpen: (i: number) => void;
  story: ReturnType<typeof useStory>;
}) {
  const PHOTOS = story.photos;
  const hide = still ? "" : "invisible";

  return (
    <div ref={(el) => void (r.current.board = el)} className="gb-board">
      <div
        ref={(el) => void (r.current.surface = el)}
        className="gb-surface"
        style={{ ["--count" as string]: PHOTOS.length } as CSSProperties}
      >
        {/* Title Plaque: NO curve line above it */}
        <div ref={(el) => void (r.current.plaque = el)} className="gb-plaque">
          <h2 id="gallery-heading">{story.heading}</h2>
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
              style={
                {
                  ["--i" as string]: i,
                  ["--dx" as string]: `${s.dx}%`,
                  ["--dy" as string]: `${s.dy}%`,
                  ["--mx" as string]: i % 2 ? "24%" : "2%",
                  rotate: `${s.rot}deg`,
                } as CSSProperties
              }
              aria-label={`Open photo: ${p.caption}`}
            >
              <span className="gb-polaroid">
                <span className="gb-pic">
                  <img
                    src={p.src}
                    alt={p.alt}
                    loading="lazy"
                    decoding="async"
                    className="block h-full w-full object-cover"
                    draggable={false}
                  />
                  {!still && <span ref={(el) => void (r.current.desat[i] = el)} aria-hidden className="gb-desat" />}
                </span>
                <span className="gb-caption" aria-hidden="true">
                  {[...p.caption].map((ch, k) => (
                    <span
                      key={k}
                      ref={(el) => void (el && (r.current.letters[i][k] = el))}
                      className={`inline-block ${hide}`}
                    >
                      {ch === " " ? "\u00A0" : ch}
                    </span>
                  ))}
                </span>
              </span>
              {s.hold === "pin" ? <span aria-hidden className="gb-pin" /> : <span aria-hidden className="gb-tape" />}
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

        {/* Flight path: dotted gold trail revealed behind the plane */}
        <svg ref={(el) => void (r.current.svg = el)} aria-hidden className="gb-flight">
          <defs>
            <mask id="gb-trail-mask" maskUnits="userSpaceOnUse">
              <path
                ref={(el) => void (r.current.mask = el)}
                fill="none"
                stroke="#fff"
                strokeWidth="10"
                pathLength={1}
                style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
              />
            </mask>
          </defs>
          <path
            ref={(el) => void (r.current.trail = el)}
            fill="none"
            stroke="#e8c56b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="0.1 9"
            mask="url(#gb-trail-mask)"
          />
        </svg>

        {/* The Animated Paper Plane */}
        <div ref={(el) => void (r.current.plane = el)} aria-hidden className="gb-plane">
          <div ref={(el) => void (r.current.planeBody = el)} className="h-full w-full">
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

const onPath = (raw: Raw, p: number) =>
  MotionPathPlugin.getPositionOnPath(raw, Math.min(1, Math.max(0, p)), true) as {
    x: number;
    y: number;
    angle: number;
  };

function setupFlight(r: BoardRefs) {
  const plan = planFlight(r);
  r.svg!.setAttribute("viewBox", `0 0 ${plan.W} ${plan.H}`);
  r.trail!.setAttribute("d", plan.d);
  r.mask!.setAttribute("d", plan.d);
  const raw = MotionPathPlugin.getRawPath(r.trail!);
  MotionPathPlugin.cacheRawPathMeasurements(raw);
  return { ...plan, raw };
}

function restPlane(r: BoardRefs, raw: Raw, p: number) {
  const q = onPath(raw, p);
  if (r.plane) {
    r.plane.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px) translate(-50%, -50%) rotate(${q.angle.toFixed(1)}deg)`;
  }
  if (r.mask) {
    r.mask.style.strokeDashoffset = `${1 - p}`;
  }
}

/** Phones: the board follows the finger closely (a long catch-up feels like lag there). */
const TOUCH = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

const turnTo = (a: number, b: number) => ((((b - a) % 360) + 540) % 360) - 180;

export function LoveStoryScene() {
  const { playSfx, startLoop } = useAudio();
  const story = useStory();
  const PHOTOS = story.photos;
  const r = useRef<BoardRefs>(emptyRefs(story.photos.length));
  const [open, setOpen] = useState<number | null>(null);
  const fly = useRef<{ p: number; dir: 1 | -1; raw: Raw | null }>({ p: 0, dir: 1, raw: null });

  useEffect(() => {
    let shown = 0;
    let offset = 0;
    let facing: 1 | -1 = 1;
    let turn = 1;
    let first = true;
    let lastP = -1;
    let lastRaw: Raw | null = null;
    let lastVh = 0;
    let scene: Element | null = null;
    let settled = false;
    const tick = (_t: number, dtMs: number) => {
      const R = r.current;
      const raw = fly.current.raw;
      if (!raw || !R.plane) return;
      scene ??= R.board?.closest(".scene") ?? null;
      if (scene && !scene.classList.contains("is-live")) return;
      // nothing moved (no scroll, no turn in progress): skip the frame — keeps phones cool
      const vhNow = window.innerHeight;
      if (!first && settled && turn >= 1 && fly.current.dir === facing && fly.current.p === lastP && raw === lastRaw && vhNow === lastVh) return;
      lastP = fly.current.p;
      lastRaw = raw;
      lastVh = vhNow;
      const dt = Math.min(0.05, dtMs / 1000);
      const q = onPath(raw, fly.current.p);
      if (fly.current.dir !== facing && turn >= 1) {
        facing = fly.current.dir;
        turn = 0;
      }
      let bank = 1;
      let lift = 0;
      if (turn < 1) {
        turn = Math.min(1, turn + dt / 0.5);
        const e = turn < 0.5 ? 2 * turn * turn : 1 - (-2 * turn + 2) ** 2 / 2;
        offset = facing === 1 ? 180 * (1 - e) : 180 * e;
        const k = Math.sin(Math.PI * turn);
        bank = 1 - 0.35 * k;
        lift = -12 * k;
      } else {
        offset = facing === 1 ? 0 : 180;
      }
      const target = q.angle + offset;
      if (first) {
        shown = target;
        first = false;
      } else {
        shown += Math.max(-7, Math.min(7, turnTo(shown, target)));
      }
      settled = Math.abs(turnTo(shown, target)) < 0.3;
      R.plane.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px) translate(-50%, -50%) rotate(${shown.toFixed(2)}deg)`;
      if (R.planeBody) R.planeBody.style.transform = `translateY(${lift.toFixed(1)}px) scaleY(${bank.toFixed(3)})`;
      if (R.mask) R.mask.style.strokeDashoffset = `${1 - fly.current.p}`;

      const board = R.board!;
      const vh = window.innerHeight;
      if (board.offsetHeight > vh - 24) {
        const top = R.surface!.offsetTop + board.offsetTop;
        const y = Math.min(16, Math.max(vh - board.offsetHeight - 16, vh * 0.5 - (top + q.y)));
        board.style.transform = `translateY(${y.toFixed(1)}px)`;
      } else {
        board.style.transform = "";
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // The wind follows the plane: a soft wind loop while the section is on screen, louder, faster
  // and brighter the faster the plane flies, fading out within ~250ms when it stops.
  const inside = useRef(false);
  useEffect(() => {
    let loop: SfxLoop | null = null;
    let prevP = fly.current.p;
    let speed = 0;
    const tick = (_t: number, dtMs: number) => {
      if (!inside.current) {
        if (loop) {
          loop.stop();
          loop = null;
        }
        return;
      }
      if (!loop || loop === NO_LOOP) loop = startLoop("wind"); // retries until the guest has tapped once
      const dt = Math.max(0.008, dtMs / 1000);
      const p = fly.current.p;
      const v = Math.abs(p - prevP) / dt; // path progress per second
      prevP = p;
      speed += (v - speed) * Math.min(1, dt * 8); // a little smoothing
      const s = Math.min(1, speed * 4);
      loop.set(s < 0.02 ? 0 : Math.min(0.6, s * 0.75), 0.9 + s * 0.4, 600 + s * 1600);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      loop?.stop();
    };
  }, [startLoop]);

  const build: Build = (tl, section) => {
    const R = r.current;
    const f = setupFlight(R);
    fly.current.raw = f.raw;
    const proxy = fly.current;
    proxy.p = 0;

    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => void (inside.current = self.isActive),
    });
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => void (proxy.dir = self.direction === -1 ? -1 : 1),
    });

    // Plaque is visible right from the start
    gsap.set(R.plaque, { autoAlpha: 1, y: 0 });
    const LEG = 1;
    PHOTOS.forEach((_, i) => {
      const t0 = 0.2 + i * LEG;
      const photo = R.photos[i];
      tl.fromTo(proxy, { p: i ? f.at[i - 1] : 0 }, { p: f.at[i], duration: 0.7 * LEG, ease: "none", immediateRender: false }, t0);
      // the plane touches down on the photo: a very soft paper tap (only flying forward)
      tl.call(
        () => {
          const b = section.getBoundingClientRect();
          if (proxy.dir === 1 && b.top < window.innerHeight && b.bottom > 0) playSfx("tap", { volume: 0.3 });
        },
        undefined,
        t0 + 0.68 * LEG,
      );
      tl.fromTo(photo, { scale: 0.94, autoAlpha: 0.7 }, { scale: 1.06, autoAlpha: 1, duration: 0.14 * LEG, ease: "back.out(3)" }, t0 + 0.68 * LEG);
      tl.fromTo(R.desat[i], { opacity: 0.5 }, { opacity: 0, duration: 0.14 * LEG }, t0 + 0.68 * LEG);
      tl.fromTo(
        R.letters[i],
        { autoAlpha: 0, y: 4 },
        { autoAlpha: 1, y: 0, duration: 0.04, stagger: (0.22 * LEG) / Math.max(1, R.letters[i].length), ease: "power1.out" },
        t0 + 0.74 * LEG,
      );
      R.bursts[i].forEach((b, k) => {
        const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
        tl.fromTo(
          b,
          { x: 0, y: 0, scale: 0.4, rotate: 0, autoAlpha: 0 },
          { keyframes: [{ autoAlpha: 1, duration: 0.02 }, { x: Math.cos(a) * 34, y: Math.sin(a) * 26 + 18, scale: 1, rotate: 160 + k * 40, autoAlpha: 0, duration: 0.24 * LEG }] },
          t0 + 0.7 * LEG,
        );
      });
      tl.to(photo, { scale: 1, duration: 0.12 * LEG, ease: "power1.out" }, t0 + LEG);
    });

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
      className="gb-wall relative overflow-hidden"
      scrub={TOUCH ? 0.6 : 1.8}
      build={build}
    >
      <div className="gb-viewport">
        <Board r={r} still={false} onOpen={setOpen} story={story} />
      </div>
      {open !== null && (
        <Lightbox
          images={PHOTOS.map((p) => ({ src: p.src, alt: p.alt, caption: p.caption }))}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </Scene>
  );
}

export function LoveStoryStill() {
  const story = useStory();
  const PHOTOS = story.photos;
  const r = useRef<BoardRefs>(emptyRefs(story.photos.length));
  const [open, setOpen] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!r.current.surface) return;
    const place = () => {
      const f = setupFlight(r.current);
      restPlane(r.current, f.raw, 1);
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
      {open !== null && (
        <Lightbox
          images={PHOTOS.map((p) => ({ src: p.src, alt: p.alt, caption: p.caption }))}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
