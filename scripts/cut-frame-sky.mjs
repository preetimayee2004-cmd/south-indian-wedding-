/**
 * Makes the temple-frame art float: flood-fills the open sky (blue + white
 * clouds) from the picture's edges and makes it transparent, so the painted
 * roof and pillars can rise over the scene behind them. The cream panel is
 * never reached (it isn't sky-coloured), so it stays opaque.
 *
 *   node scripts/cut-frame-sky.mjs public/media/gopuram-frame@2x.webp public/media/frame-cut
 *   → frame-cut.webp (1×) and frame-cut@2x.webp
 */
import sharp from "sharp";
const [src, outBase] = process.argv.slice(2);
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const px = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
// "how sky-like" 0..1: blue sky, or bright neutral/bluish cloud
const skyness = (i) => {
  const [r, g, b] = px(i);
  const blue = b - r; // sky ≈ 60–110, clouds ≈ 0–30, cream/gold ≪ 0
  if (blue > 35 && b > 140) return 1;
  if (r > 190 && g > 200 && b > 205 && blue > -6) return 1; // cloud
  if (blue > 18 && b > 150) return (blue - 18) / 17;
  return 0;
};
const seen = new Uint8Array(W * H);
const alpha = new Float32Array(W * H).fill(1);
const stack = [];
for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
while (stack.length) {
  const i = stack.pop();
  if (seen[i]) continue;
  seen[i] = 1;
  const s = skyness(i);
  if (s <= 0) continue;
  alpha[i] = 1 - s;
  if (s < 1) continue; // soft edge: stop spreading
  const x = i % W, y = (i / W) | 0;
  if (x > 0) stack.push(i - 1);
  if (x < W - 1) stack.push(i + 1);
  if (y > 0) stack.push(i - W);
  if (y < H - 1) stack.push(i + W);
}
// feather 1px so the edge isn't jagged
const a2 = new Float32Array(alpha);
for (let y = 1; y < H - 1; y++)
  for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    if (alpha[i] === 1 && (alpha[i - 1] < 1 || alpha[i + 1] < 1 || alpha[i - W] < 1 || alpha[i + W] < 1)) a2[i] = 0.6;
  }
for (let i = 0; i < W * H; i++) data[i * 4 + 3] = Math.round(a2[i] * 255);
const img = () => sharp(data, { raw: { width: W, height: H, channels: 4 } });
await img().webp({ quality: 90, alphaQuality: 100 }).toFile(`${outBase}@2x.webp`);
await img().resize(W / 2).webp({ quality: 90, alphaQuality: 100 }).toFile(`${outBase}.webp`);
console.log("wrote", outBase);
