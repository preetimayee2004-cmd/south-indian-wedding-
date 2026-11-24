import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

export interface JourneyStop {
  /** small caps line above the text, e.g. "Stop 01" or "You've arrived" */
  label: string;
  text: string;
  icon: ReactNode;
  /** the destination: a gold medallion */
  end?: boolean;
}

type Pt = { x: number; y: number };

interface Geo {
  w: number;
  h: number;
  pts: Pt[];
  d: string;
  narrow: boolean;
}

/** A smooth curve through the stops: sideways waves on wide screens, a snake down the page on phones. */
function routePath(p: Pt[], narrow: boolean) {
  let d = `M${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i];
    const b = p[i + 1];
    if (narrow) {
      const k = (b.y - a.y) / 2;
      d += ` C${a.x.toFixed(1)} ${(a.y + k).toFixed(1)} ${b.x.toFixed(1)} ${(b.y - k).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    } else {
      const k = (b.x - a.x) / 2;
      d += ` C${(a.x + k).toFixed(1)} ${a.y.toFixed(1)} ${(b.x - k).toFixed(1)} ${b.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    }
  }
  return d;
}

function Compass() {
  return (
    <svg viewBox="-50 -50 100 100" className="jm-compass" aria-hidden>
      <circle r="44" fill="none" stroke="#8a5d1f" strokeWidth="1.2" />
      <circle r="38" fill="none" stroke="#8a5d1f" strokeWidth="0.6" strokeDasharray="1 3" />
      <path d="M0-40 7-7 40 0 7 7 0 40-7 7-40 0-7-7Z" fill="#e8c56b" stroke="#8a5d1f" strokeWidth="1" />
      <path d="M0-40 7-7 0 0Z M40 0 7 7 0 0Z M0 40-7 7 0 0Z M-40 0-7-7 0 0Z" fill="#8e1426" />
      <path d="M-26-26-5-5M26-26 5-5M26 26 5 5M-26 26-5 5" stroke="#8a5d1f" strokeWidth="1" />
      <circle r="4" fill="#fff6dc" stroke="#8a5d1f" strokeWidth="1" />
      <text y="-46" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="11" fontWeight="700" fill="#8e1426">
        N
      </text>
    </svg>
  );
}

/**
 * Travel as an old parchment map: a dotted route winds from stop to stop and ends at the
 * venue, drawing itself in when it comes into view. The map is opaque, so the eye stays on
 * the journey rather than the patterned section background.
 */
export function JourneyMap({ stops, reduced }: { stops: JourneyStop[]; place?: string; nickname?: string; reduced: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const route = useRef<SVGPathElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const n = stops.length;

  // lay the stops out for the map's real size (and again when it changes)
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const calc = () => {
      const w = el.clientWidth;
      if (!w) return;
      const narrow = w < 620;
      const step = 74;
      const h = narrow ? 78 + (n - 1) * step + 40 : 200;
      const pts: Pt[] = stops.map((_, i) =>
        narrow
          ? { x: w * (i % 2 ? 0.62 : 0.38), y: 82 + i * step }
          : { x: w * (0.1 + (0.8 * i) / Math.max(1, n - 1)), y: i % 2 ? 82 : 118 },
      );
      setGeo((g) => (g && g.w === w && g.h === h ? g : { w, h, pts, d: routePath(pts, narrow), narrow }));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
    // the layout depends only on how many stops there are
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  // the route draws itself in, then each stop pops in along it
  useLayoutEffect(() => {
    if (!geo || reduced || !box.current) return;
    const el = box.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 78%", once: true } });
      tl.fromTo(".jm-route-draw", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2, ease: "power1.inOut" }, 0)
        .from(".jm-route-dots", { opacity: 0, duration: 0.6 }, 1.2)
        .from(".jm-stop", { opacity: 0, scale: 0.6, duration: 0.45, stagger: 0.42, ease: "back.out(2)" }, 0.1);
    }, el);
    return () => ctx.revert();
    // only once the layout is known
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo === null, reduced]);

  return (
    <div className="jm-card">
      <img src="/media/gold-corner.webp" alt="" aria-hidden draggable={false} className="jm-corner jm-corner--tl" />
      <img src="/media/gold-corner.webp" alt="" aria-hidden draggable={false} className="jm-corner jm-corner--tr" />
      <img src="/media/gold-corner.webp" alt="" aria-hidden draggable={false} className="jm-corner jm-corner--bl" />
      <img src="/media/gold-corner.webp" alt="" aria-hidden draggable={false} className="jm-corner jm-corner--br" />

      <div ref={box} className={`jm-map ${geo?.narrow ? "is-narrow" : ""}`} style={{ height: geo?.h ?? 200 }}>
        {/* the map's own furniture: a title cartouche and a compass rose */}
        <Compass />

        {geo && (
          <>
            <svg className="jm-route" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden>
              <path d={geo.d} className="jm-route-shadow" />
              <path ref={route} d={geo.d} className="jm-route-draw" pathLength={1} />
              <path d={geo.d} className="jm-route-dots" />
            </svg>

            <ol className="jm-stops">
              {stops.map((s, i) => {
                const p = geo.pts[i];
                // phones: the text sits on the open side of the medallion; wide: above / below it
                const side = geo.narrow ? (i % 2 ? "right" : "left") : "below";
                return (
                  <li key={s.text} className={`jm-stop jm-stop--${side} ${s.end ? "jm-stop--end" : ""}`} style={{ left: p.x, top: p.y }}>
                    <span className="jm-medal" aria-hidden>
                      {s.icon}
                    </span>
                    <span className="jm-copy" style={geo.narrow ? { width: Math.max(110, (i % 2 ? geo.w - p.x : p.x) - 44) } : undefined}>
                      <span className="jm-text">{s.text}</span>
                      {s.label && <span className="jm-label">{s.label}</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
