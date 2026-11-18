/**
 * Makes a picture drawn on one flat background colour float: flood-fills that
 * colour (sampled from the top-left corner) from the picture's edges and makes
 * it transparent, with a soft edge. Enclosed areas of the same colour inside
 * the art are kept.
 *
 *   node scripts/cut-flat-bg.mjs <input> <outBase> [tolerance]
 * Writes <outBase>@2x.webp (full size) and <outBase>.webp (half size).
 */
import sharp from "sharp";
const [src, outBase, tol = "46"] = process.argv.slice(2);
const T = Number(tol);
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const bg = [data[(5 * W + 5) * 4], data[(5 * W + 5) * 4 + 1], data[(5 * W + 5) * 4 + 2]];
const dist = (i) => Math.hypot(data[i * 4] - bg[0], data[i * 4 + 1] - bg[1], data[i * 4 + 2] - bg[2]);
const alpha = new Float32Array(W * H).fill(1);
const seen = new Uint8Array(W * H);
const stack = [];
for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
while (stack.length) {
  const i = stack.pop();
  if (seen[i]) continue;
  seen[i] = 1;
  const d = dist(i);
  if (d > T * 1.6) continue; // the art
  const a = d <= T ? 0 : (d - T) / (T * 0.6); // soft edge
  alpha[i] = Math.min(alpha[i], a);
  if (d > T) continue;
  const x = i % W, y = (i / W) | 0;
  if (x > 0) stack.push(i - 1);
  if (x < W - 1) stack.push(i + 1);
  if (y > 0) stack.push(i - W);
  if (y < H - 1) stack.push(i + W);
}
for (let i = 0; i < W * H; i++) data[i * 4 + 3] = Math.round(alpha[i] * 255);
const img = () => sharp(data, { raw: { width: W, height: H, channels: 4 } });
await img().webp({ quality: 92, alphaQuality: 100 }).toFile(`${outBase}@2x.webp`);
await img().resize(Math.round(W / 2)).webp({ quality: 92, alphaQuality: 100 }).toFile(`${outBase}.webp`);
console.log("wrote", outBase, W, "x", H, "bg", bg.join(","));
