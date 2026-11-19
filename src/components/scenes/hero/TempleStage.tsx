import { forwardRef, type CSSProperties, type MutableRefObject } from "react";
import { useWedding } from "@/context/WeddingContext";
import { rand } from "@/components/scene/Decor";

/*
 * The hero temple as one stage with the picture's shape (temple-hero, 896×1200):
 * the temple on its paving, three elephants walking in a procession, and the
 * tree's own leaves (tree-front, cut from the same picture) drawn over them.
 * Everything is placed in % of the stage, so it stays aligned at every size.
 */

export const STAGE_RATIO = 896 / 1200;

/** Where the elephants' feet stand (fraction of the stage height): the foot of the temple wall. */
export const BASELINE = 0.9;
/** The elephant cutout's shape (897×893). */
const EL_RATIO = 897 / 893;
/** Front, middle, back — the middle 8% smaller, the back 5% larger, so they don't look identical. */
export const ELEPHANTS = [
  { height: 0.19, left: 0.7094 }, // the front one, stopping at the temple steps
  { height: 0.19 * 0.92, left: 0.4542 },
  { height: 0.19 * 1.05, left: 0.1659 },
].map((e) => ({ ...e, width: (e.height / STAGE_RATIO) * EL_RATIO }));

/** The tree's leaves in front of the procession: x 0–34%, y 30–100% of the stage. */
const TREE = { left: 0, top: 0.3, width: 610 / 1792, height: 0.7 };

/** Yellow blossoms falling from the tree at three speeds: [count, seconds]. */
const BLOSSOMS: [number, number][] = [
  [4, 9],
  [4, 13],
  [3, 18],
];

export interface ElephantRefs {
  /** the walker (moved sideways) */
  outer: (HTMLDivElement | null)[];
  /** the body (bob, rock, breathing) */
  body: (HTMLDivElement | null)[];
  /** two dust puffs at the feet */
  dust: (HTMLSpanElement | null)[][];
}

export const TempleStage = forwardRef<
  HTMLDivElement,
  { className?: string; style?: CSSProperties; eager?: boolean; elephants?: MutableRefObject<ElephantRefs>; still?: boolean }
>(function TempleStage({ className = "", style, eager, elephants, still = false }, ref) {
  const { media } = useWedding();
  const p = media.procession;
  const box = (e: (typeof ELEPHANTS)[number]): CSSProperties => ({
    left: `${e.left * 100}%`,
    bottom: `${(1 - BASELINE) * 100}%`,
    width: `${e.width * 100}%`,
    aspectRatio: `${EL_RATIO}`,
  });

  return (
    <div ref={ref} data-layer className={`temple-stage absolute left-0 top-0 w-full ${className}`} style={{ aspectRatio: `${STAGE_RATIO}`, ...style }}>
      <img
        src={media.invitation.replace(/\.webp$/, "@2x.webp")}
        alt="A colourful gopuram on a stone base with steps up to its door, a yellow flowering tree beside it, on a paved courtyard"
        decoding="async"
        fetchPriority={eager ? "high" : undefined}
        className="absolute inset-0 block h-full w-full"
        draggable={false}
      />

      {/* petals drifting down the temple steps */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 6 }, (_, i) => (
          <i
            key={i}
            className="step-petal"
            style={{ left: `${66 + rand(i, 31) * 22}%`, top: `${72 + rand(i, 37) * 3}%`, animationDelay: `${-i * 2.3}s`, animationDuration: `${11 + (i % 3) * 3}s` }}
          />
        ))}
      </div>

      {/* the procession, back to front */}
      {p &&
        [2, 1, 0].map((k) => (
          <div
            key={k}
            ref={(el) => void (elephants && (elephants.current.outer[k] = el))}
            className="absolute"
            style={{ ...box(ELEPHANTS[k]), transform: still ? undefined : "translate3d(-200vw,0,0)" }}
          >
            <div ref={(el) => void (elephants && (elephants.current.body[k] = el))} className="h-full w-full" style={{ transformOrigin: "50% 100%" }}>
              <img src={p.elephant} alt={k === 0 ? "Three decorated temple elephants with their mahouts, walking to the temple steps" : ""} aria-hidden={k !== 0} decoding="async" className="block h-full w-full" draggable={false} />
            </div>
            {[0, 1].map((d) => (
              <span key={d} ref={(el) => void (elephants && ((elephants.current.dust[k] ??= [])[d] = el))} aria-hidden className="dust-puff" style={{ left: d ? "70%" : "26%" }} />
            ))}
          </div>
        ))}

      {/* the tree's leaves in front of the elephants, swaying a little; blossoms fall from it */}
      {p && (
        <img
          aria-hidden
          src={p.treeFront}
          alt=""
          decoding="async"
          className="tree-front pointer-events-none absolute"
          style={{ left: `${TREE.left * 100}%`, top: `${TREE.top * 100}%`, width: `${TREE.width * 100}%`, height: `${TREE.height * 100}%` }}
          draggable={false}
        />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {BLOSSOMS.flatMap(([n, sec], g) =>
          Array.from({ length: n }, (_, i) => {
            const k = g * 10 + i;
            return (
              <i
                key={k}
                className="blossom"
                style={{
                  left: `${3 + rand(k, 41) * 26}%`,
                  top: `${36 + rand(k, 43) * 30}%`,
                  animationDuration: `${sec}s`,
                  animationDelay: `${-rand(k, 47) * sec}s`,
                  ["--dx" as string]: `${(rand(k, 53) * 10 + 2).toFixed(1)}cqw`,
                }}
              />
            );
          }),
        )}
      </div>
    </div>
  );
});
