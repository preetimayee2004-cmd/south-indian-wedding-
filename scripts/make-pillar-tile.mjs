/**
 * Cuts one carved pillar module (garland band → deity niche → lotus pedestal)
 * out of the gopuram frame art, keeping only the two pillar bands, so the
 * frame can repeat the exact pillar design down the page.
 *
 *   node scripts/make-pillar-tile.mjs public/media/gopuram-frame@2x.webp public/media/pillar-tile [previewDir]
 *   node scripts/make-pillar-tile.mjs public/media/frame-cut@2x.webp public/media/pillar-tile-cut   (sky transparent)
 *
 * Rows T..B match media.frame.tile in wedding.config.ts.
 */
import sharp from "sharp";
const [src, outBase, preview] = process.argv.slice(2);
const T = 548, B = 831, SIDE = 215, FADE = 14; // art px (1200-wide art)
const W = 2400, H = (B - T) * 2;
const { data } = await sharp(src).extract({ left: 0, top: T * 2, width: W, height: H }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let x = 0; x < W; x++) {
  const d = Math.min(x, W - 1 - x) / 2; // distance from the outer edge, art px
  const a = d < SIDE - FADE ? 1 : d > SIDE ? 0 : (SIDE - d) / FADE;
  for (let y = 0; y < H; y++) data[(y * W + x) * 4 + 3] = Math.round(data[(y * W + x) * 4 + 3] * a);
}
const img = () => sharp(data, { raw: { width: W, height: H, channels: 4 } });
await img().webp({ quality: 90, alphaQuality: 100 }).toFile(`${outBase}@2x.webp`);
await img().resize(W / 2, H / 2).webp({ quality: 90, alphaQuality: 100 }).toFile(`${outBase}.webp`);

if (preview) {
  for (const [name, left] of [["stackL", 0], ["stackR", W - 600]]) {
    const t = await img().extract({ left, top: 0, width: 600, height: H }).png().toBuffer();
    const s = await sharp({ create: { width: 600, height: H * 3, channels: 4, background: "#f1d592" } })
      .composite([0, 1, 2].map((i) => ({ input: t, top: i * H, left: 0 }))).png().toBuffer();
    await sharp(s).resize(300).png().toFile(`${preview}/${name}.png`);
  }
}
