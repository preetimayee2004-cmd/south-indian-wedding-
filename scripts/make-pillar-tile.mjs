/**
 * Cuts one repeatable pillar module out of a frame picture, keeping only the
 * two pillar bands (the middle is made transparent), so a frame can grow
 * taller by repeating the exact pillar design.
 *
 *   node scripts/make-pillar-tile.mjs <src> <outBase> <artWidth> <top> <bottom> <side> [fade]
 *
 * top/bottom = the rows of the module, side = width of each pillar band from
 * the picture's edge — all in art px (the frame's `width`, e.g. 1376). The
 * values must match media.frame (tile rows, side) in wedding.config.ts.
 * Writes <outBase>.webp (half size) and <outBase>@2x.webp (full size).
 *
 *   node scripts/make-pillar-tile.mjs public/media/arch-frame@2x.webp public/media/arch-tile 1376 497 642 380 3
 */
import sharp from "sharp";
const [src, outBase, artW, T, B, SIDE, FADE = "3"] = process.argv.slice(2);
const meta = await sharp(src).metadata();
const k = meta.width / Number(artW); // file px per art px
const top = Math.round(Number(T) * k), H = Math.round((Number(B) - Number(T)) * k);
const W = meta.width;
const { data } = await sharp(src).extract({ left: 0, top, width: W, height: H }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const side = Number(SIDE), fade = Number(FADE);
for (let x = 0; x < W; x++) {
  const d = Math.min(x, W - 1 - x) / k; // distance from the outer edge, art px
  const a = d < side - fade ? 1 : d > side ? 0 : (side - d) / fade;
  for (let y = 0; y < H; y++) data[(y * W + x) * 4 + 3] = Math.round(data[(y * W + x) * 4 + 3] * a);
}
const img = () => sharp(data, { raw: { width: W, height: H, channels: 4 } });
await img().webp({ quality: 90, alphaQuality: 100 }).toFile(`${outBase}@2x.webp`);
await img().resize(Math.round(W / 2)).webp({ quality: 90, alphaQuality: 100 }).toFile(`${outBase}.webp`);
console.log("wrote", outBase, W, "x", H);
