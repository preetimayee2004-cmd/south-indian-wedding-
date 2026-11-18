import { forwardRef, type CSSProperties } from "react";
import { art2x, artProps } from "@/lib/art";

interface LayerProps {
  src: string;
  alt?: string;
  /** object-position of the art inside the layer box. */
  position?: string;
  className?: string;
  style?: CSSProperties;
  /** The layer scales above ~1.15 during scroll: always use the 2× file. */
  hi?: boolean;
  eager?: boolean;
}

/**
 * One painted layer of a scene. Every layer of a scene uses the same box and
 * fit, so separately exported layers line up exactly. GSAP moves the outer
 * div (transform/opacity only).
 */
export const Layer = forwardRef<HTMLDivElement, LayerProps>(function Layer(
  { src, alt = "", position = "50% 50%", className = "absolute inset-0", style, hi, eager },
  ref,
) {
  const img = hi ? art2x(src) : artProps(src);
  return (
    <div ref={ref} data-layer className={className} style={style} aria-hidden={alt ? undefined : true}>
      <img
        {...img}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full object-cover"
        style={{ objectPosition: position }}
        draggable={false}
      />
    </div>
  );
});
