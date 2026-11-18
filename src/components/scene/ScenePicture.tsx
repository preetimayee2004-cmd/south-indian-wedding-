import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { hasArt, srcSetOf, artProps } from "@/lib/art";

export const WIDE_QUERY = "(min-width: 901px)";

const ratioOf = (r: string) => r.replace(/\s/g, "");
const ratioNum = (r: string) => {
  const [w, h] = r.split("/").map(Number);
  return w / h;
};

/** True when the wide art exists and the screen is wider than 900px. */
export const showsWide = (wide?: string) => hasArt(wide) && window.matchMedia(WIDE_QUERY).matches;

interface Props {
  src: string;
  /** "w / h" of `src` */
  ratio: string;
  /** Landscape art for screens wider than 900px (only used once the file exists). */
  wide?: string;
  wideRatio?: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  /** The hero: loads first (high priority, not lazy) and is what the loader waits for. */
  eager?: boolean;
  /**
   * Screens wider than 900px: at most this many % of the screen height tall,
   * centred (instead of spanning the full width).
   */
  capVh?: number;
  /** Overlays that ride along with the picture (positioned in % of it). */
  children?: ReactNode;
}

/**
 * A scene picture: full width on phones (height from its aspect ratio); on
 * screens wider than 900px either the landscape file, or — with `capVh` —
 * the same picture at most capVh% of the screen tall, centred. The box takes
 * the matching aspect ratio so layout never waits for the image. Responsive
 * WebP (480/960/1920) via srcset. GSAP moves the outer div.
 */
export const ScenePicture = forwardRef<HTMLDivElement, Props>(function ScenePicture(
  { src, ratio, wide, wideRatio = "16 / 9", alt, className = "", style, eager, capVh, children },
  ref,
) {
  const useWide = hasArt(wide);
  const capped = !useWide && capVh !== undefined;
  const sizes = capped ? `(min-width: 901px) calc(${capVh}vh * ${ratioNum(ratio).toFixed(3)}), 100vw` : "100vw";
  const img = artProps(src, sizes);
  return (
    <div
      ref={ref}
      data-layer
      data-wide={useWide || undefined}
      data-cap={capped || undefined}
      className={`scene-pic absolute left-0 top-0 w-full ${className}`}
      style={{
        ["--ar" as string]: ratioOf(ratio),
        ["--ar-wide" as string]: ratioOf(wideRatio),
        ["--arn" as string]: ratioNum(ratio),
        ["--cap" as string]: capVh ?? 100,
        ...style,
      }}
    >
      <picture>
        {useWide && <source media={WIDE_QUERY} srcSet={srcSetOf(wide!)} sizes="100vw" />}
        <img
          {...img}
          alt={alt}
          data-hero={eager || undefined}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : undefined}
          className="block h-full w-full object-cover"
          draggable={false}
        />
      </picture>
      {children}
    </div>
  );
});
