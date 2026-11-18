import type { CSSProperties, ReactNode } from "react";
import { useWedding } from "@/context/WeddingContext";

/** CSS image-set offering the sharpened 2× file on retina screens. */
const imageSet = (src: string) => {
  const x2 = src.replace(/\.webp$/, "@2x.webp");
  return `image-set(url("${src}") 1x, url("${x2}") 2x)`;
};

/*
 * The pillar shaft, painted in the colours sampled from the carved pillar
 * (stops are % of the pillar band: sky → gold rim → teal → deep-teal core →
 * teal → gold rim → cream). Mirrored for the right-hand pillar.
 */
const SHAFT = [
  "#a6cdee 0%", "#a6cdee 35%",
  "#4a3a1c 35.3%", "#4a3a1c 37%",
  "#c9a24f 37%", "#e2c272 40%", "#b48a3f 42%",
  "#5a3a14 42%", "#5a3a14 43.7%",
  "#2f6f7c 43.7%", "#3d8290 48%", "#2a6370 52%",
  "#d8b465 52%", "#d8b465 55%",
  "#1f515c 55%", "#2d6b78 64%", "#1f515c 73.5%",
  "#d8b465 73.5%", "#d8b465 76.3%",
  "#4d7488 76.3%", "#5f879a 80%", "#456a7d 83.7%",
  "#3a2a12 83.7%", "#3a2a12 85.6%",
  "#c79f55 85.6%", "#e3c070 89%", "#c19750 91.2%",
  "#ead083 91.2%", "#f1d58c 100%",
];
const shaft = (dir: "right" | "left") => `linear-gradient(to ${dir}, ${SHAFT.join(", ")})`;
// Matches the artwork cream where the carved top ends (#f1d592) and the base begins (#efd18c).
const CREAM = "radial-gradient(ellipse 60% 40% at 50% 30%, rgb(255 244 205 / 0.35), transparent 70%), linear-gradient(#f1d592, #f2d896 45%, #efd18c)";

/**
 * The painted temple gateway as a frame that grows with its content:
 * roof, capitals and one carved niche on top; painted pillar shafts that
 * extend as far as the content needs; the carved bases close it. One image
 * (config media.frame), scaled uniformly — never stretched.
 */
export function GopuramFrame({ children, id, labelledBy }: { children: ReactNode; id?: string; labelledBy?: string }) {
  const { media } = useWedding();
  const f = media.frame;
  // Full screen width: the frame is drawn just wider than the screen so that,
  // once its outer sky strips are trimmed (clip), it fills edge to edge.
  const fw = `calc(100vw * ${(f.width / (f.width - 2 * f.clip)).toFixed(4)})`;
  const px = (n: number) => `calc(${fw} * ${n / f.width})`;
  const art: CSSProperties = { backgroundImage: imageSet(f.src), backgroundRepeat: "no-repeat", backgroundSize: "100% auto" };
  const side = px(f.side);
  const opening = `calc(100% - 2 * ${side} + ${px(8)})`; // parchment width between the pillars

  return (
    <section id={id} aria-labelledby={labelledBy} className="cobalt relative isolate overflow-x-clip">
      <div className="relative left-1/2 -translate-x-1/2" style={{ width: fw, clipPath: `inset(0 ${px(f.clip)})` }}>
        {/* roof, deities and capitals; parchment fills the top of the opening */}
        <div
          aria-hidden
          style={{
            height: px(f.top),
            backgroundImage: `${imageSet(f.src)}, ${CREAM}`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `100% auto, ${opening} ${px(f.top - f.contentTop + 8)}, ${opening} ${px(f.top - f.contentTop + 8)}`,
            backgroundPosition: "top center, center bottom, center bottom",
          }}
        />

        {/* pillars that grow with the content — the carved niche module repeated
            (or painted shafts without a tile); cream between */}
        <div
          style={{
            display: "flow-root", // keeps the text's negative top margin from dragging this background up over the carvings
            paddingInline: side,
            ...(f.tile
              ? {
                  // pillar modules (whole ones only: scaled a touch to fit), parchment only between the pillars
                  backgroundImage: `${imageSet(f.tile.src)}, ${CREAM}`,
                  backgroundSize: `100% ${px(f.tile.height)}, ${opening} 100%, ${opening} 100%`,
                  backgroundPosition: "center top, center, center",
                  backgroundRepeat: "no-repeat round, no-repeat, no-repeat",
                }
              : {
                  backgroundImage: `${shaft("right")}, ${shaft("left")}, ${CREAM}`,
                  backgroundSize: `${side} 100%, ${side} 100%, 100% 100%, 100% 100%`,
                  backgroundPosition: "left top, right top, center, center",
                  backgroundRepeat: "no-repeat",
                }),
          }}
        >
          {/* content starts up on the cream beneath the roof */}
          <div className="relative px-[clamp(0.25rem,2vw,2.5rem)] pb-10" style={{ marginTop: px(f.contentTop - f.top) }}>
            {children}
          </div>
        </div>

        {/* carved pillar bases */}
        <div aria-hidden style={{ ...art, height: px(f.bottom), backgroundPosition: "bottom center" }} />
      </div>
    </section>
  );
}
