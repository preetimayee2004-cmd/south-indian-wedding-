import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useWedding } from "@/context/WeddingContext";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Lightbox } from "@/components/sections/gallery/Lightbox";
import { gsap } from "@/lib/gsap";

/**
 * "Moments to Cherish" — the couple's photographs set into three carved temple windows on the
 * temple wall: a larger centre window between two smaller ones (on phones the centre window on
 * top, the two others side by side beneath it), joined by fine strings of jasmine. As it comes
 * into view the heading appears, the windows' gold outlines draw themselves (centre first), the
 * photographs rise into them and the jasmine draws across. Hover lifts a photograph inside its
 * frame; a tap opens the full-screen viewer (all the photos, arrows / swipe / Esc).
 * Photos, heading and closing line come from the config (wedding.config.ts → gallery).
 */

type Photo = { src: string; caption: string; alt: string; focus?: string };

/* One window, in its own units (viewBox 0 -22 300 402): the opening, the carved band around it,
   a line of gold beads in the band, the capitals, the plinth and a lotus finial on top. */
const VB = { x: 0, y: -22, w: 300, h: 402 };
const OPENING = "M26 336V138C26 100 88 86 116 66C132 55 143 46 150 32C157 46 168 55 184 66C212 86 274 100 274 138V336Z";
const OUTER = "M8 348V136C8 88 78 72 106 50C124 36 140 24 150 8C160 24 176 36 194 50C222 72 292 88 292 136V348Z";
const BEADS = "M17 342V137C17 94 83 79 111 58C128 45 141 35 150 20C159 35 172 45 189 58C217 79 283 94 283 137V342";
/** The opening's box in the window, as fractions (where the photograph sits). */
const PHOTO_BOX = { left: 26 / VB.w, width: 248 / VB.w, top: (32 - VB.y) / VB.h, height: 304 / VB.h };
const PHOTO_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='26 32 248 304' preserveAspectRatio='none'><path d='${OPENING}'/></svg>`,
)}")`;

/** The invitation's mandapam art (1192×742): the roof, lintel and capitals end at SLICE_TOP; the plain
 *  fluted stretch of the pillars that can be drawn taller runs to SLICE_END; OPEN is the wall between the
 *  pillars, from under the lintel down to the plinth. */
const ART = "/media/invite-arch@2x.webp";
const ART_W = 1192;
const ART_H = 742;
const SLICE_TOP = 416;
const SLICE_END = 506;
const OPEN = { top: 296, bottom: 588, left: 170, right: 1022 };
const artLayer = { backgroundImage: `url("${ART}")`, backgroundRepeat: "no-repeat" } as const;

/** Where the windows stand, in a 1000-wide row: [left, top, width] — and the jasmine strings between them. */
type Layout = { h: number; wins: [number, number, number][]; strings: string[] };
const winH = (w: number) => (w * VB.h) / VB.w;
/** A window's shoulder (where its arch springs from the capital), in row units. */
const shoulder = ([x, y, w]: [number, number, number], side: "l" | "r") => [x + ((side === "l" ? 8 : 292) / VB.w) * w, y + ((136 - VB.y) / VB.h) * winH(w)] as const;
const drape = (a: readonly [number, number], b: readonly [number, number], sag: number) =>
  `M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${((a[0] + b[0]) / 2).toFixed(1)} ${(Math.max(a[1], b[1]) + sag).toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;

function makeLayout(wide: boolean): Layout {
  if (wide) {
    const bottom = 490;
    const centre: [number, number, number] = [320, bottom - winH(360), 360];
    const left: [number, number, number] = [0, bottom - winH(290), 290];
    const right: [number, number, number] = [710, bottom - winH(290), 290];
    return {
      h: 498,
      wins: [centre, left, right],
      strings: [drape(shoulder(left, "r"), shoulder(centre, "l"), 50), drape(shoulder(centre, "r"), shoulder(right, "l"), 50)],
    };
  }
  const centre: [number, number, number] = [70, 16, 860];
  const top2 = centre[1] + winH(860) + 60;
  const left: [number, number, number] = [15, top2, 475];
  const right: [number, number, number] = [510, top2, 475];
  return { h: top2 + winH(475) + 12, wins: [centre, left, right], strings: [drape(shoulder(left, "r"), shoulder(right, "l"), 70)] };
}

function useGallery() {
  const { gallery } = useWedding();
  const photos: Photo[] = (gallery?.photos ?? []).map((p) => ({
    src: p.src,
    caption: p.caption ?? "",
    alt: p.alt || p.caption || "A photo of the couple",
    focus: p.focus,
  }));
  return {
    heading: gallery?.heading ?? "Moments to Cherish",
    subtitle: gallery?.subtitle ?? "Little memories, one beautiful story",
    ending: gallery?.ending ?? "",
    photos,
  };
}

export function TempleWindowGallery() {
  const g = useGallery();
  const wide = useMediaQuery("(min-width: 768px)");
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const root = useRef<HTMLElement>(null);
  const m = useRef<Record<string, HTMLDivElement | null>>({});
  const set = (k: string) => (el: HTMLDivElement | null) => void (m.current[k] = el);
  const L = makeLayout(wide);
  // centre window: the first photo; then the second (left) and third (right)
  const shown = g.photos.slice(0, 3);

  // the mandapam is drawn to hold the gallery: only the plain stretch of its pillars grows taller
  useLayoutEffect(() => {
    const $ = m.current;
    if (!$.box || !$.col) return;
    const fit = () => {
      const W = $.box!.offsetWidth;
      const k = W / ART_W;
      const Hn = ART_H * k;
      const room = (OPEN.bottom - OPEN.top) * k;
      const extra = Math.max(0, $.col!.offsetHeight - room);
      const slice = (SLICE_END - SLICE_TOP) * k;
      const f = (slice + extra) / slice;
      $.box!.style.height = `${Hn + extra}px`;
      $.top!.style.height = `${SLICE_TOP * k}px`;
      Object.assign($.mid!.style, { top: `${SLICE_TOP * k}px`, height: `${slice + extra}px`, backgroundSize: `100% ${Hn * f}px`, backgroundPosition: `center ${-SLICE_TOP * k * f}px` });
      $.bot!.style.height = `${(ART_H - SLICE_END) * k}px`;
      Object.assign($.open!.style, { top: `${OPEN.top * k}px`, height: `${room + extra}px` });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe($.col);
    ro.observe($.box);
    return () => ro.disconnect();
  }, [wide]);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const wins = q(".tw-win");
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
      gsap.set(q(".tw-head > *"), { autoAlpha: 0, y: 14 });
      gsap.set(q(".tw-line"), { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(q(".tw-fill"), { autoAlpha: 0 });
      gsap.set(q(".tw-photo"), { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(q(".tw-draw"), { strokeDashoffset: 1 });
      gsap.set(q(".tw-bloom"), { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" });
      gsap.set(q(".tw-floor"), { autoAlpha: 0 });
      gsap.set(q(".tw-swags"), { clipPath: "inset(0% 100% 0% 0%)" });

      // the heading, softly
      tl.to(q(".tw-head > *"), { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.15 });
      // the outlines draw — the centre window first, then the two others
      wins.forEach((w, i) => {
        const at = 0.5 + (i === 0 ? 0 : 0.45 + (i - 1) * 0.25);
        tl.to(w.querySelectorAll(".tw-line"), { strokeDashoffset: 0, duration: 1.2, ease: "power1.inOut" }, at);
        tl.to(w.querySelectorAll(".tw-fill"), { autoAlpha: 1, duration: 0.7 }, at + 0.8);
        // the photograph rises into its window
        tl.to(w.querySelector(".tw-photo"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power2.inOut" }, at + 1.05);
      });
      tl.to(q(".tw-floor"), { autoAlpha: 1, duration: 0.8 }, 1.3);
      // the jasmine draws between the windows, then the little clusters open
      tl.to(q(".tw-draw"), { strokeDashoffset: 0, duration: 1.1, ease: "power1.inOut", stagger: 0.15 }, 2.6);
      tl.to(q(".tw-swags"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power1.inOut" }, 2.4);
      tl.to(q(".tw-bloom"), { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2)", stagger: 0.08 }, 3.2);

      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 70%", once: true, onEnter: () => void tl.play() } });
    }, el);
    return () => ctx.revert();
  }, [reduced, wide]);

  if (!shown.length) return null;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <section ref={root} id="gallery" aria-labelledby="gallery-heading" className="tw-wall parchment-ground relative">
      <div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#f7ecd3" }} />
      {/* the painted mandapam (as in the invitation): tiled roof with its goddess niches, two pillars and the
          carved plinth; the gallery stands on the cream wall between the pillars */}
      <div className="relative left-1/2 -translate-x-1/2" style={{ width: "max(31.75rem, 100vw)" }}>
        <div ref={set("box")} className="relative w-full">
          <div aria-hidden ref={set("top")} className="absolute inset-x-0 top-0" style={{ ...artLayer, backgroundSize: "100% auto", backgroundPosition: "center top" }} />
          <div aria-hidden ref={set("mid")} className="absolute inset-x-0" style={artLayer} />
          <div aria-hidden ref={set("bot")} className="absolute inset-x-0 bottom-0" style={{ ...artLayer, backgroundSize: "100% auto", backgroundPosition: "center bottom" }} />
          <div ref={set("open")} className="absolute" style={{ left: `${(OPEN.left / ART_W) * 100}%`, right: `${(1 - OPEN.right / ART_W) * 100}%` }}>
            {/* jasmine swags hanging from the lintel */}
            <div aria-hidden className="tw-swags" />
            <div ref={set("col")} className="tw-col">

      <header className="tw-head">
        <h2 id="gallery-heading" className="tw-title" data-fit=".tw-head">
          {g.heading}
        </h2>
        <p className="tw-sub">
          <i aria-hidden />
          {g.subtitle}
          <i aria-hidden />
        </p>
        <svg aria-hidden viewBox="0 0 160 18" className="tw-orn">
          <path d="M4 9H62M98 9H156" stroke="#b8893e" strokeWidth="1" />
          <path d="M80 1c3 3 3.2 6 0 9-3.2-3-3-6 0-9ZM78.6 10c-4.2-.4-6.4-3-6.8-6 3 .6 5.6 2.4 6.8 6ZM81.4 10c4.2-.4 6.4-3 6.8-6-3 .6-5.6 2.4-6.8 6ZM70.5 11.5c3.6 2.2 15.4 2.2 19 0" fill="#b8893e" />
        </svg>
      </header>

      <div className="tw-row" style={{ aspectRatio: `1000 / ${L.h.toFixed(1)}`, ["--row-h" as string]: L.h } as CSSProperties}>
        {shown.map((p, i) => {
          const [x, y, w] = L.wins[i];
          return (
            <div key={p.src} className="tw-win" style={{ left: pct(x, 1000), top: pct(y, L.h), width: pct(w, 1000), aspectRatio: `${VB.w} / ${VB.h}` }}>
              {/* the carved frame (behind the photograph) */}
              <svg aria-hidden viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="tw-frame">
                <defs>
                  <linearGradient id={`tw-band-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#4f9a91" />
                    <stop offset="1" stopColor="#2f6f69" />
                  </linearGradient>
                </defs>
                {/* plinth */}
                <g className="tw-fill">
                  <rect x="0" y="348" width="300" height="12" rx="1.5" fill="#f1e6cb" stroke="#b8893e" strokeWidth="1.2" />
                  <rect x="8" y="360" width="284" height="18" fill="#e9dbb8" stroke="#b8893e" strokeWidth="1.2" />
                  <path d="M14 369H286" stroke="#b8893e" strokeWidth="3" strokeDasharray="0.1 9" strokeLinecap="round" strokeOpacity="0.9" />
                  {/* the carved band: muted turquoise, a maroon edge and a line of gold beads */}
                  <path d={`${OUTER}${OPENING}`} fillRule="evenodd" fill={`url(#tw-band-${i})`} />
                  <path d={OPENING} fill="none" stroke="#7a1f2b" strokeWidth="5" />
                  <path d={BEADS} fill="none" stroke="#e2c27a" strokeWidth="3.2" strokeDasharray="0.1 8" strokeLinecap="round" />
                  {/* capitals where the arch springs */}
                  <rect x="2" y="132" width="30" height="9" rx="1.5" fill="#c9a24e" stroke="#8a6420" strokeWidth="0.8" />
                  <rect x="268" y="132" width="30" height="9" rx="1.5" fill="#c9a24e" stroke="#8a6420" strokeWidth="0.8" />
                  {/* lotus finial */}
                  <path d="M150-20c5 5 5.5 10 0 15-5.5-5-5-10 0-15ZM147.6-5c-7-.6-10.6-5-11.3-10 5 1 9.3 4 11.3 10ZM152.4-5c7-.6 10.6-5 11.3-10-5 1-9.3 4-11.3 10ZM134-2.5c6 3.6 26 3.6 32 0" fill="#c9a24e" stroke="#8a6420" strokeWidth="0.7" />
                  <circle cx="150" cy="36" r="3.2" fill="#e2c27a" stroke="#8a6420" strokeWidth="0.6" />
                </g>
                {/* the gold outlines that draw themselves */}
                <path className="tw-line" pathLength={1} d={OUTER} fill="none" stroke="#c9a24e" strokeWidth="2.6" />
                <path className="tw-line" pathLength={1} d={OPENING} fill="none" stroke="#d9b25f" strokeWidth="2.2" />
              </svg>

              {/* the photograph inside the opening */}
              <button
                type="button"
                className="tw-photo"
                onClick={() => setOpen(i)}
                aria-label={`Open photo: ${p.caption || p.alt}`}
                style={{
                  left: pct(PHOTO_BOX.left, 1),
                  width: pct(PHOTO_BOX.width, 1),
                  top: pct(PHOTO_BOX.top, 1),
                  height: pct(PHOTO_BOX.height, 1),
                  WebkitMaskImage: PHOTO_MASK,
                  maskImage: PHOTO_MASK,
                }}
              >
                <img src={p.src} alt={p.alt} loading="lazy" decoding="async" draggable={false} style={{ objectPosition: p.focus ?? "50% 35%" }} />
              </button>
            </div>
          );
        })}

        {/* jasmine strings between the windows, with a little cluster where each is tied */}
        <svg aria-hidden className="tw-strings" viewBox={`0 0 1000 ${L.h.toFixed(1)}`} preserveAspectRatio="none">
          <defs>
            {L.strings.map((d, k) => (
              <mask key={k} id={`tw-m-${wide ? "w" : "n"}-${k}`} maskUnits="userSpaceOnUse">
                <path className="tw-draw" pathLength={1} d={d} fill="none" stroke="#fff" strokeWidth="26" strokeDasharray="1" strokeDashoffset="0" />
              </mask>
            ))}
          </defs>
          {L.strings.map((d, k) => {
            const ends = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
            const pts = [
              [ends[0], ends[1]],
              [ends[4], ends[5]],
            ];
            return (
              <g key={k}>
                <g mask={`url(#tw-m-${wide ? "w" : "n"}-${k})`}>
                  <path d={d} fill="none" stroke="#6c8f3c" strokeWidth="1.2" />
                  <path d={d} fill="none" stroke="#fffaf0" strokeWidth="6.5" strokeDasharray="0.1 9" strokeLinecap="round" />
                  <path d={d} fill="none" stroke="#f3ead2" strokeWidth="4.5" strokeDasharray="0.1 9" strokeDashoffset="-4.5" strokeLinecap="round" />
                </g>
                {pts.map(([cx, cy], e) => (
                  <g key={e} className="tw-bloom" transform={`translate(${cx} ${cy})`}>
                    <path d="M0 0c-9-2-15 2-17 8 7 1 13-2 17-8Z" fill="#4f8a3a" />
                    <path d="M0 0c9-2 15 2 17 8-7 1-13-2-17-8Z" fill="#3f7a2e" />
                    {[
                      [0, -4],
                      [-5, 2],
                      [5, 2],
                      [0, 5],
                    ].map(([bx, by], b) => (
                      <circle key={b} cx={bx} cy={by} r="4" fill="#fffaf0" stroke="#e1d6bb" strokeWidth="0.8" />
                    ))}
                    <circle r="1.6" fill="#e9b949" />
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* the temple floor the windows stand on: a gold rule with a lotus and a faint kolam */}
      <div aria-hidden className="tw-floor">
        <svg viewBox="0 0 400 60" className="tw-kolam">
          <path d="M20 10H176M224 10H380" stroke="#b8893e" strokeWidth="1" />
          <path d="M200 2c3 3 3.2 6 0 9-3.2-3-3-6 0-9ZM198.6 11c-4.2-.4-6.4-3-6.8-6 3 .6 5.6 2.4 6.8 6ZM201.4 11c4.2-.4 6.4-3 6.8-6-3 .6-5.6 2.4-6.8 6Z" fill="#b8893e" />
          <g fill="none" stroke="#c97a7a" strokeOpacity="0.45" strokeWidth="1.1">
            <ellipse cx="200" cy="40" rx="62" ry="14" />
            <ellipse cx="200" cy="40" rx="40" ry="9" />
            <path d="M138 40c20-12 42-12 62 0 20 12 42 12 62 0M138 40c20 12 42 12 62 0 20-12 42-12 62 0" />
          </g>
          <g fill="#c97a7a" fillOpacity="0.5">
            {[150, 175, 225, 250].map((x) => (
              <circle key={x} cx={x} cy="40" r="1.6" />
            ))}
          </g>
        </svg>
        {g.ending && <p className="tw-ending">{g.ending}</p>}
      </div>

            </div>
          </div>
        </div>
      </div>

      {open !== null && (
        <Lightbox
          images={g.photos.map((p) => ({ src: p.src, alt: p.alt, caption: p.caption }))}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
