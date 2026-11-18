import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { hasArt } from "@/lib/art";

export const WIDE_QUERY = "(min-width: 901px)";

const x2 = (src: string) => src.replace(/\.webp$/, "@2x.webp");
const ratioOf = (r: string) => r.replace(/\s/g, "");

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
  eager?: boolean;
  /** Overlays that ride along with the picture (positioned in % of it). */
  children?: ReactNode;
}

/**
 * A scene picture that always spans the full width (height from its aspect
 * ratio): the landscape file on screens wider than 900px, the portrait one
 * below. The box takes the matching aspect ratio so layout never waits for
 * the image. GSAP moves the outer div.
 */
export const ScenePicture = forwardRef<HTMLDivElement, Props>(function ScenePicture(
  { src, ratio, wide, wideRatio = "16 / 9", alt, className = "", style, eager, children },
  ref,
) {
  const useWide = hasArt(wide);
  return (
    <div
      ref={ref}
      data-layer
      data-wide={useWide || undefined}
      className={`scene-pic absolute left-0 top-0 w-full ${className}`}
      style={{ ["--ar" as string]: ratioOf(ratio), ["--ar-wide" as string]: ratioOf(wideRatio), ...style }}
    >
      <picture>
        {useWide && <source media={WIDE_QUERY} srcSet={x2(wide!)} />}
        <img src={x2(src)} alt={alt} decoding="async" fetchPriority={eager ? "high" : undefined} className="block h-full w-full object-cover" draggable={false} />
      </picture>
      {children}
    </div>
  );
});
