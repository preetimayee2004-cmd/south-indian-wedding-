/**
 * Cuts a deep-blue *gradient* sky (darker at the top, lighter at the horizon)
 * out of a picture, so it floats on the page's solid sky colour. Unlike
 * cut-flat-bg.mjs it does not compare against one colour: a pixel is sky when
 * it has almost no red and is strongly blue (the temple's teals and blues all
 * carry some red). Flood-fills from the picture's edges only, so enclosed blue
 * areas inside the art are kept, with a soft rim.
 *
 *   node scripts/cut-blue-sky.mjs <input> <output.webp|png>
 */
import sharp from "sharp";

const [src, out] = process.argv.slice(2);
if (!src || !out) throw new Error("usage: cut-blue-sky.mjs <input> <output>");

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

/** 1 = sky, 0 = art, in between = the soft rim. */
function skyness(i) {
  const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
  if (b < 120 || b - g < 40) return 0;
  if (r <= 18) return 1;
  if (r >= 48) return 0;
  return 1 - (r - 18) / 30;
}

const alpha = new Float32Array(W * H).fill(1);
const seen = new Uint8Array(W * H);
const stack = new Int32Array(W * H);
let sp = 0;
const push = (i) => {
  if (!seen[i]) {
    seen[i] = 1;
    stack[sp++] = i;
  }
};
for (let x = 0; x < W; x++) push(x), push((H - 1) * W + x);
for (let y = 0; y < H; y++) push(y * W), push(y * W + W - 1);

while (sp) {
  const i = stack[--sp];
  const s = skyness(i);
  if (s === 0) continue; // the art stops the fill
  alpha[i] = 1 - s;
  if (s < 1) continue; // rim pixels don't spread further
  const x = i % W, y = (i / W) | 0;
  if (x > 0) push(i - 1);
  if (x < W - 1) push(i + 1);
  if (y > 0) push(i - W);
  if (y < H - 1) push(i + W);
}

for (let i = 0; i < W * H; i++) data[i * 4 + 3] = Math.round(alpha[i] * data[i * 4 + 3]);
const img = sharp(data, { raw: { width: W, height: H, channels: 4 } });
await (out.endsWith(".png") ? img.png() : img.webp({ quality: 92, alphaQuality: 100 })).toFile(out);
console.log("wrote", out, W, "x", H);
