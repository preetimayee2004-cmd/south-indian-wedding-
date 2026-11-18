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
  const m = src.match(/\/media\/(.+)\.webp$/);
  const s = m ? SIZES[m[1]] : undefined;
  if (!s) return { src };
  const ratio = s.w / s.h;
  return {
    src,
    srcSet: `${src} ${s.w}w, ${src.replace(/\.webp$/, "@2x.webp")} ${s.w * 2}w`,
    sizes: sizes ?? `(max-aspect-ratio: ${s.w}/${s.h}) calc(100vh * ${ratio.toFixed(3)}), 100vw`,
  };
}

/**
 * A scene layer by name, if its file exists (listed in art-manifest.json):
 * layer("hero-gopuram") → "/media/layers/hero-gopuram.webp" or undefined.
 * Drop new layer art in with `node scripts/prepare-art.mjs <folder> layers`.
 */
export function layer(name: string): string | undefined {
  return SIZES[`layers/${name}`] ? `/media/layers/${name}.webp` : undefined;
}

/** Always the sharpened 2× file — for layers that scale up during scroll. */
export function art2x(src: string): { src: string } {
  const m = src.match(/\/media\/(.+)\.webp$/);
  return m && SIZES[m[1]] ? { src: src.replace(/\.webp$/, "@2x.webp") } : { src };
}

/** True once the art file has been prepared (it is listed in art-manifest.json). */
export function hasArt(src: string | undefined): src is string {
  const m = src?.match(/\/media\/(.+)\.webp$/);
  return Boolean(m && SIZES[m[1]]);
}
