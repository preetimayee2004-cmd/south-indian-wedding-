import { forwardRef, type CSSProperties } from "react";
import { useWedding } from "@/context/WeddingContext";
import { artProps } from "@/lib/art";

/*
 * The hero temple as one stage with the picture's shape (temple-hero, 1493×2000):
 * the temple on its open paving, and three decorated elephants walking across
 * the paving in front of it. Everything is placed in % of the stage, so it stays
 * aligned at every size. The elephants walk across one after another (CSS
 * .el-walker: from beyond the left edge to beyond the right, along the paving,
 * a little larger as they come nearer), a third of the way apart, with a step
 * bob and a gentle rock (.elephant-walk). With reduced motion they simply stand
 * in a row in front of the temple.
 */

export const STAGE_RATIO = "1493 / 2000";

/** The elephant cutout's shape (897×893, mahout included). */
const EL_RATIO = "897 / 893";
/** Where they stand when nothing moves (reduced motion): left edge, feet, height — in % of the stage, on the walking path. */
const ELEPHANTS = [
  { left: 4, feet: 93.1, height: 17.2 },
  { left: 35, feet: 94.8, height: 18.5 },
  { left: 66, feet: 96.5, height: 19.9 },
];
/** How long one elephant takes to cross the scene (s). */
const WALK_SECONDS = 30;

export const TempleStage = forwardRef<HTMLDivElement, { className?: string; style?: CSSProperties; eager?: boolean }>(function TempleStage(
  { className = "", style, eager },
  ref,
) {
  const { media } = useWedding();
  const p = media.procession;
  return (
    <div ref={ref} data-layer className={`temple-stage absolute left-0 top-0 w-full ${className}`} style={{ aspectRatio: STAGE_RATIO, ...style }}>
      <img
        {...artProps(media.invitation, "100vw")}
        alt="A colourful gopuram on a stone base with steps up to its door, a yellow flowering tree beside it, and three decorated elephants walking past"
        decoding="async"
        fetchPriority={eager ? "high" : undefined}
        className="absolute inset-0 block h-full w-full"
        draggable={false}
      />
      {p &&
        ELEPHANTS.map((e, k) => (
          <div
            key={k}
            aria-hidden
            className="el-walker"
            style={{
              // where it stands when nothing moves (the reference picture)
              ["--rest-l" as string]: `${e.left}%`,
              ["--rest-b" as string]: `${100 - e.feet}%`,
              ["--rest-h" as string]: `${e.height}%`,
              aspectRatio: EL_RATIO,
              // one after another, a third of the walk apart
              animationDelay: `${-k * (WALK_SECONDS / 3)}s`,
            }}
          >
            <img src={p.elephant} alt="" decoding="async" className="elephant-walk block h-full w-full" style={{ animationDelay: `${-k * 0.37}s` }} draggable={false} />
          </div>
        ))}
    </div>
  );
});
