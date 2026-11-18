import manifest from "@/config/art-manifest.json";

type Entry = { w: number; h: number; widths: number[] };
const ART = manifest as Record<string, Entry>;

const keyOf = (src: string | undefined) => src?.match(/\/media\/(.+)\.webp$/)?.[1];
const entry = (src: string | undefined) => {
  const k = keyOf(src);
  return k ? ART[k] : undefined;
};
const file = (src: string, w: number) => src.replace(/\.webp$/, `-${w}.webp`);

/** The art's natural size in pixels (its original), if it has been prepared. */
export function naturalSize(src: string): { w: number; h: number } | undefined {
  const e = entry(src);
  return e && { w: e.w, h: e.h };
}

/** "…-480.webp 480w, …-960.webp 960w, …-1920.webp 1920w" for prepared art. */
export function srcSetOf(src: string): string | undefined {
  const e = entry(src);
  return e?.widths.map((w) => `${file(src, w)} ${w}w`).join(", ");
}

/**
 * <img> props for prepared art (scripts/prepare-art.mjs): WebP at 480/960/1920
 * (never wider than the original) with `sizes`, so the browser fetches only
 * what the screen needs. Default `sizes` = full-screen "cover" art: when the
 * screen is narrower than the picture's shape it fills by height, so it is
 * shown 100vh × (w/h) wide. Pass `sizes` for anything smaller.
 * Unprepared images (e.g. guest photos) are returned unchanged.
 */
export function artProps(src: string, sizes?: string): { src: string; srcSet?: string; sizes?: string } {
  const e = entry(src);
  if (!e) return { src };
  const fallback = file(src, e.widths.find((w) => w >= 960) ?? e.widths.at(-1)!);
  return {
    src: fallback,
    srcSet: srcSetOf(src),
    sizes: sizes ?? `(max-aspect-ratio: ${e.w}/${e.h}) calc(100vh * ${(e.w / e.h).toFixed(3)}), 100vw`,
  };
}

/** CSS image-set for background art: the 960 file on 1× screens, the largest on 2×+. */
export function bgImage(src: string): string {
  const e = entry(src);
  if (!e) return `url("${src}")`;
  const one = e.widths.find((w) => w >= 960) ?? e.widths.at(-1)!;
  const two = e.widths.at(-1)!;
  return `image-set(url("${file(src, one)}") 1x, url("${file(src, two)}") 2x)`;
}

/**
 * A scene layer by name, if its file exists (listed in art-manifest.json):
 * layer("hero-gopuram") → "/media/layers/hero-gopuram.webp" or undefined.
 * Drop new layer art in with `node scripts/prepare-art.mjs <folder> layers`.
 */
export function layer(name: string): string | undefined {
  return ART[`layers/${name}`] ? `/media/layers/${name}.webp` : undefined;
}

/** True once the art file has been prepared (it is listed in art-manifest.json). */
export function hasArt(src: string | undefined): src is string {
  return Boolean(entry(src));
}
