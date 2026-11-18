import { useRef, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Lightbox } from "@/components/sections/gallery/Lightbox";
import { artProps } from "@/lib/art";

const PLANE_SVG = (
  <svg viewBox="0 0 48 32" className="h-full w-full" aria-hidden>
    <path d="M2 16 46 2 30 30 22 19Z" fill="#fbf2dc" stroke="#b88a3e" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M22 19 46 2 18 17Z" fill="#e9d6a8" stroke="#b88a3e" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

/** Catmull-Rom point and tangent angle through `pts` at t ∈ [0, 1]. */
function along(pts: { x: number; y: number }[], t: number) {
  const n = pts.length - 1;
  const f = Math.min(n - 1e-6, Math.max(0, t * n));
  const i = Math.floor(f);
  const u = f - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
  const c = (a: number, b: number, c2: number, d: number) =>
    0.5 * (2 * b + (-a + c2) * u + (2 * a - 5 * b + 4 * c2 - d) * u * u + (-a + 3 * b - 3 * c2 + d) * u * u * u);
  const dc = (a: number, b: number, c2: number, d: number) =>
    0.5 * (-a + c2 + 2 * (2 * a - 5 * b + 4 * c2 - d) * u + 3 * (-a + 3 * b - 3 * c2 + d) * u * u);
  return { x: c(p0.x, p1.x, p2.x, p3.x), y: c(p0.y, p1.y, p2.y, p3.y), a: Math.atan2(dc(p0.y, p1.y, p2.y, p3.y), dc(p0.x, p1.x, p2.x, p3.x)) };
}

function City({ lead, city, native, line }: { lead: string; city: string; native?: string; line: string }) {
  return (
    <div data-stop className="flex w-[78vw] max-w-[22rem] shrink-0 flex-col items-center justify-center text-center">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.34em] text-[#fbf2dc]">{lead}</p>
      <p className="mt-2 text-[clamp(2.2rem,11vw,3.4rem)] font-bold uppercase leading-none tracking-[0.12em] text-[#f3cf73]">{city}</p>
      {native && <p className="mt-1 text-[1.2rem] text-[#fbf2dc]">{native}</p>}
      <p className="mt-2 font-script text-[1.7rem] leading-none text-[#fbf2dc]">{line}</p>
    </div>
  );
}

/**
 * Our Love Story (as in the reference runway). While
 * the page scrolls past, the stage stays on screen (sticky) and the photos
 * travel from right to left along a gold line, from the city where it began
 * to the city it lives on in; a paper plane flies along a smooth curve that
 * swoops towards each photo, tilting with the curve (scrolling back runs it in
 * reverse and the plane turns round). Tap a photo to open it large.
 */
export function JourneyScene() {
  const { gallery, loveStory } = useWedding();
  const [open, setOpen] = useState<number | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const line = useRef<SVGPathElement>(null);
  const head = useRef<HTMLDivElement>(null);

  if (gallery.length === 0) return null;

  const build: Build = (tl) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tr = track.current!;
    const travel = Math.max(0, tr.scrollWidth - vw);
    // waypoints (track px): the opening city, a swoop up to each photo, the closing city
    const base = tr.getBoundingClientRect();
    const stops = [...tr.querySelectorAll("[data-stop]")].map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - base.left + r.width / 2, top: r.top - base.top, h: r.height };
    });
    const lineY = base.height * 0.5;
    const pts = stops.map((s, i) => ({ x: s.x, y: i === 0 || i === stops.length - 1 ? lineY : s.top - 18 }));
    if (line.current && pts.length > 1) line.current.setAttribute("d", `M${pts[0].x},${lineY} L${pts[pts.length - 1].x},${lineY}`);

    const T = Math.max(1.2, travel / vh); // about 1:1 with the scroll
    tl.from(head.current!.children, { opacity: 0, y: 18, duration: 0.25, stagger: 0.08 }, 0).fromTo(tr, { x: 0 }, { x: -travel, duration: T, ease: "none" }, 0.15);

    // the plane: under the middle of the screen, on the curve
    const state = { p: 0 };
    let lastX = -1;
    let facing = 1;
    const place = () => {
      if (pts.length < 2 || !plane.current) return;
      const x = vw * 0.5 + travel * state.p;
      const t = Math.min(1, Math.max(0, (x - pts[0].x) / (pts[pts.length - 1].x - pts[0].x)));
      const q = along(pts, t);
      if (lastX >= 0 && Math.abs(q.x - lastX) > 0.5) facing = q.x >= lastX ? 1 : -1;
      lastX = q.x;
      plane.current.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px) translate(-50%, -50%) rotate(${q.a.toFixed(3)}rad) scaleX(${facing})`;
    };
    place();
    tl.fromTo(state, { p: 0 }, { p: 1, duration: T, ease: "none", onUpdate: place }, 0.15).to({}, { duration: 0.3 });
  };

  return (
    <Scene
      id="gallery"
      labelledBy="gallery-heading"
      className="cobalt"
      build={build}
      edgeTop={<div aria-hidden className="edge edge-fade-top" />}
    >
      <div className="flex h-full flex-col">
        <div ref={head} className="px-gutter pt-[max(1.5rem,6svh)] text-center">
          <h2 id="gallery-heading" className="font-script text-[clamp(2.4rem,10vw,3.6rem)] font-normal leading-none text-[#f3cf73]">
            Our Love Story
          </h2>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div ref={track} data-layer className="absolute inset-y-0 left-0 flex items-center gap-[10vw] px-[11vw]">
            <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
              <path ref={line} fill="none" stroke="#d9b25f" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
            </svg>
            {loveStory && <City lead="began in" city={loveStory.began.city} native={loveStory.began.native} line={loveStory.began.line} />}
            {gallery.map((g, i) => (
              <button
                key={`${g.src}-${i}`}
                data-stop
                type="button"
                onClick={() => setOpen(i)}
                className="relative w-[58vw] max-w-[17rem] shrink-0 bg-[#fbf3df] p-2 pb-1 text-left shadow-[0_14px_30px_rgb(5_15_45/0.4)] ring-1 ring-[#e0cc9f]"
                style={{ rotate: `${i % 2 ? 2.5 : -2.5}deg` }}
                aria-label={`Open photo: ${g.caption ?? g.alt}`}
              >
                <span className="block aspect-[4/5] overflow-hidden bg-[#e9dcc0]">
                  <img {...artProps(g.src, "60vw")} alt={g.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" draggable={false} />
                </span>
                {g.caption && <span className="mt-1 block text-center font-script text-[1.35rem] leading-[1.05] text-maroon">{g.caption}</span>}
              </button>
            ))}
            {loveStory && <City lead="and our love story still lives on in" city={loveStory.livesOn.city} native={loveStory.livesOn.native} line={loveStory.livesOn.line} />}
            <div ref={plane} aria-hidden className="pointer-events-none absolute left-0 top-0 z-10 h-7 w-10">
              {PLANE_SVG}
            </div>
          </div>
        </div>
      </div>
      {open !== null && <Lightbox images={gallery} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </Scene>
  );
}
