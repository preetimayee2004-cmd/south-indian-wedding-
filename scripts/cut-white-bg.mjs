/**
 * Makes a picture drawn on a plain white background float: flood-fills the
 * near-white background from the picture's edges and makes it transparent
 * (with a soft 1px edge). Enclosed white areas inside the art are kept.
 *
 *   node scripts/cut-white-bg.mjs <input> <output.png>
 */
import sharp from "sharp";
const [src, out] = process.argv.slice(2);
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const whiteness = (i) => {
  const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
  const min = Math.min(r, g, b), max = Math.max(r, g, b);
  if (max - min > 22) return 0; // coloured
  return Math.max(0, Math.min(1, (min - 200) / 35)); // 200 → 0, 235+ → 1
};
const alpha = new Float32Array(W * H).fill(1);
const seen = new Uint8Array(W * H);
const stack = [];
for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
while (stack.length) {
  const i = stack.pop();
  if (seen[i]) continue;
  seen[i] = 1;
  const w = whiteness(i);
  if (w <= 0) continue;
  alpha[i] = 1 - w;
  if (w < 1) continue;
  const x = i % W, y = (i / W) | 0;
  if (x > 0) stack.push(i - 1);
  if (x < W - 1) stack.push(i + 1);
  if (y > 0) stack.push(i - W);
  if (y < H - 1) stack.push(i + W);
}
for (let i = 0; i < W * H; i++) data[i * 4 + 3] = Math.round(alpha[i] * data[i * 4 + 3]);
await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toFile(out);
console.log("wrote", out, W, "x", H);
