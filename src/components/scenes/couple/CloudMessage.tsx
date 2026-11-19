import type { MutableRefObject } from "react";
import { rand } from "@/components/scene/Decor";

/**
 * The couple's names in a soft white cloud above their heads (the flat cloud
 * style of the hero). Layers, outermost first: .cloud-drift (lifted away at the
 * end), .cloud-float (a gentle CSS float), the two small clouds that drift in
 * from the edges and the big cloud they merge into, whose text — "THE COUPLE",
 * the names written in letter by letter around a gold "&" in a tiny lotus, and
 * a gold flourish that draws itself — keeps at least 20px inside the cloud.
 */

export interface CloudRefs {
  drift: HTMLDivElement | null;
  main: HTMLDivElement | null;
  left: HTMLDivElement | null;
  right: HTMLDivElement | null;
  label: HTMLParagraphElement | null;
  amp: HTMLSpanElement | null;
  letters: HTMLSpanElement[];
  flourish: SVGPathElement | null;
  petals: HTMLSpanElement[];
  rain: HTMLDivElement | null;
}

/** One cloud: overlapping rounded bumps on a body, a pale blue shade along its underside. */
function CloudShape({ className = "" }: { className?: string }) {
  const bumps: [number, number, number][] = [
    [95, 95, 55],
    [165, 62, 60],
    [240, 58, 62],
    [305, 90, 55],
    [62, 150, 50],
    [338, 150, 50],
    [128, 185, 46],
    [272, 185, 46],
    [200, 195, 50],
  ];
  const body = (dy: number, fill: string, opacity: number) => (
    <g fill={fill} fillOpacity={opacity} transform={`translate(0 ${dy})`}>
      <rect x="40" y="72" width="320" height="128" rx="64" />
      {bumps.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} />
      ))}
    </g>
  );
  return (
    <svg aria-hidden viewBox="-12 -12 424 270" preserveAspectRatio="none" className={className}>
      {body(7, "#cfe0f3", 0.9)}
      {body(0, "#ffffff", 0.96)}
    </svg>
  );
}

function Letters({ text, refs, still }: { text: string; refs?: MutableRefObject<CloudRefs>; still: boolean }) {
  return (
    <span className="cloud-name" aria-label={text}>
      {[...text].map((ch, i) => (
        <span
          key={i}
          aria-hidden
          ref={(el) => void (el && refs && !refs.current.letters.includes(el) && refs.current.letters.push(el))}
          className={`inline-block ${still ? "" : "invisible"}`}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

export function CloudMessage({ first, second, refs, still = false }: { first: string; second: string; refs?: MutableRefObject<CloudRefs>; still?: boolean }) {
  const hide = still ? "" : "invisible";
  return (
    <div className="cloud-zone pointer-events-none absolute inset-x-0 flex items-center justify-center">
      <div ref={(el) => void (refs && (refs.current.drift = el))} className="cloud-drift relative">
        <div className="cloud-float relative">
          {/* the two small clouds that drift in from the edges and merge */}
          <div ref={(el) => void (refs && (refs.current.left = el))} className={`cloud-small ${hide}`}>
            <CloudShape className="h-full w-full" />
          </div>
          <div ref={(el) => void (refs && (refs.current.right = el))} className={`cloud-small ${hide}`}>
            <CloudShape className="h-full w-full" />
          </div>

          <div ref={(el) => void (refs && (refs.current.main = el))} className={`cloud-msg ${hide}`}>
            <CloudShape className="cloud-shape" />
            <div className="cloud-text">
              <p ref={(el) => void (refs && (refs.current.label = el))} className={`cloud-label ${hide}`}>
                The Couple
              </p>
              <h2 id="couple-heading" className="cloud-names">
                <Letters text={first} refs={refs} still={still} />
                <span ref={(el) => void (refs && (refs.current.amp = el))} className={`cloud-amp ${hide}`} aria-label="and">
                  <svg aria-hidden viewBox="-20 -20 40 40" className="cloud-amp-lotus">
                    {[-60, -30, 0, 30, 60].map((a) => (
                      <path key={a} d="M0 4C-5 -3 -4 -12 0 -17 4 -12 5 -3 0 4Z" fill="#e8c56b" fillOpacity={a === 0 ? 0.9 : 0.55} transform={`rotate(${a})`} />
                    ))}
                    <path d="M-15 6c8 4 22 4 30 0" fill="none" stroke="#b8893e" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <span aria-hidden className="relative">&amp;</span>
                </span>
                <Letters text={second} refs={refs} still={still} />
              </h2>
              <svg aria-hidden viewBox="0 0 220 14" className="cloud-flourish">
                <path
                  ref={(el) => void (refs && (refs.current.flourish = el))}
                  pathLength={1}
                  d="M4 8c30-7 52 6 82 0 10-2 16-7 24-7s14 5 24 7c30 6 52-7 82 0"
                  fill="none"
                  stroke="#b8893e"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  style={{ strokeDasharray: 1, strokeDashoffset: still ? 0 : 1 }}
                />
              </svg>
            </div>
          </div>

          {/* petals falling from under the cloud onto the couple (moved by the scroll), then a light steady fall */}
          {!still &&
            Array.from({ length: 10 }, (_, i) => (
              <span
                key={i}
                ref={(el) => void (el && refs && (refs.current.petals[i] = el))}
                aria-hidden
                className="cloud-petal invisible"
                style={{ left: `${30 + rand(i, 61) * 40}%`, background: ["#e86a84", "#d9463e", "#f2a42c", "#fff6e6"][i % 4] }}
              />
            ))}
          {!still && (
            <div ref={(el) => void (refs && (refs.current.rain = el))} aria-hidden className="cloud-rain invisible">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className="cloud-rain-petal"
                  style={{ left: `${22 + i * 14}%`, animationDelay: `${-i * 1.9}s`, animationDuration: `${7 + (i % 3) * 2}s`, background: ["#e86a84", "#f2a42c", "#d9463e"][i % 3] }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
