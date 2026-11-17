import manifest from "@/config/art-manifest.json";

const SIZES = manifest as Record<string, { w: number; h: number }>;

/**
 * Image props that let the browser choose the 1× or sharpened 2× file
 * (made by scripts/prepare-art.mjs) for how big the image is really shown.
 *
 * Default `sizes` assumes full-screen "cover" art: when the screen is
 * narrower than the picture's shape it fills by height, so it is shown
 * 100vh × (w/h) wide — far wider than the screen. Pass `sizes` for
 * anything smaller (thumbnails, polaroids).
 * Images not in the manifest (e.g. guest photos) are returned unchanged.
 */
export function artProps(src: string, sizes?: string): { src: string; srcSet?: string; sizes?: string } {
  const m = src.match(/\/media\/([^/]+)\.webp$/);
  const s = m ? SIZES[m[1]] : undefined;
  if (!s) return { src };
  const ratio = s.w / s.h;
  return {
    src,
    srcSet: `${src} ${s.w}w, ${src.replace(/\.webp$/, "@2x.webp")} ${s.w * 2}w`,
    sizes: sizes ?? `(max-aspect-ratio: ${s.w}/${s.h}) calc(100vh * ${ratio.toFixed(3)}), 100vw`,
  };
}
