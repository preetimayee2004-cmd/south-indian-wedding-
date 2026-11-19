import { forwardRef, type CSSProperties } from "react";
import { useWedding } from "@/context/WeddingContext";

/*
 * The hero temple as one stage with the picture's shape (temple-hero, 896×1200):
 * the temple on its paving, three decorated elephants walking along its foot
 * exactly where they stand in the reference picture, and the tree's own leaves
 * (tree-front, cut from the same picture) in front of the last one. Everything
 * is placed in % of the stage, so it stays aligned at every size. The elephants
 * walk across, one after another (CSS .el-walker: from beyond the left edge to
 * beyond the right, along the ground, a little larger as they come nearer), a
 * third of the way apart, with a step bob and a gentle rock (.elephant-walk).
 * With reduced motion they simply stand where the reference picture has them.
 */

export const STAGE_RATIO = "896 / 1200";

/** The elephant cutout's shape (897×893, mahout included). */
const EL_RATIO = "897 / 893";
/** From the reference picture: left edge, where the feet stand, and height — all in % of the stage. */
const ELEPHANTS = [
  { left: 5, feet: 94, height: 19 }, // the one behind the tree
  { left: 33.5, feet: 95.8, height: 23.75 },
  { left: 67.5, feet: 97.7, height: 23.5 }, // the front one, by the steps
];
/** How long one elephant takes to cross the scene (s). */
const WALK_SECONDS = 30;
/** The tree's leaves in front: x 0–34%, y 30–100% of the stage. */
const TREE = { left: 0, top: 30, width: (610 / 1792) * 100, height: 70 };

export const TempleStage = forwardRef<HTMLDivElement, { className?: string; style?: CSSProperties; eager?: boolean }>(function TempleStage(
  { className = "", style, eager },
  ref,
) {
  const { media } = useWedding();
  const p = media.procession;
  return (
    <div ref={ref} data-layer className={`temple-stage absolute left-0 top-0 w-full ${className}`} style={{ aspectRatio: STAGE_RATIO, ...style }}>
      <img
        src={media.invitation.replace(/\.webp$/, "@2x.webp")}
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
      {p && (
        <img
          aria-hidden
          src={p.treeFront}
          alt=""
          decoding="async"
          className="pointer-events-none absolute"
          style={{ left: `${TREE.left}%`, top: `${TREE.top}%`, width: `${TREE.width}%`, height: `${TREE.height}%` }}
          draggable={false}
        />
      )}
    </div>
  );
});
