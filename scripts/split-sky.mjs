/**
 * Splits a painted scene with open sky into three transparent layers so they
 * can move at different speeds:
 *   <out>-sky    the sky alone (clouds and everything else painted out)
 *   <out>-clouds the clouds alone, on transparency
 *   <out>-land   everything that isn't sky (gopuram, temple, trees, people…)
 * The sky is found by flood-filling sky-coloured pixels from the top edge.
 *
 *   node scripts/split-sky.mjs public/media/gopuram-sky@2x.webp public/media/layers/hero
 * Writes 1× and @2× WebP for each layer.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [src, outBase] = process.argv.slice(2);
fs.mkdirSync(path.dirname(outBase), { recursive: true });
const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const N = W * H;
const at = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];

const isBlue = ([r, g, b]) => b - r > 22 && b > 150 && g > r;
const isCloud = ([r, g, b]) => r > 178 && g > 186 && b > 190 && b - r > -22 && Math.max(r, g, b) - Math.min(r, g, b) < 60;
const softSky = ([r, , b]) => (b - r > 8 && b > 150 ? Math.min(1, (b - r - 8) / 14) : 0);

// 1. flood fill sky from the top edge
const sky = new Float32Array(N); // 0..1 sky membership
const seen = new Uint8Array(N);
const stack = [];
for (let x = 0; x < W; x++) stack.push(x);
while (stack.length) {
  const i = stack.pop();
  if (seen[i]) continue;
  seen[i] = 1;
  const p = at(i);
  const full = isBlue(p) || isCloud(p);
  const s = full ? 1 : softSky(p);
  if (s <= 0) continue;
  sky[i] = s;
  if (!full) continue;
  const x = i % W, y = (i / W) | 0;
  if (x > 0) stack.push(i - 1);
  if (x < W - 1) stack.push(i + 1);
  if (y > 0) stack.push(i - W);
  if (y < H - 1) stack.push(i + W);
}

// 2. per-row sky colour from pure blue pixels (cloud-free), smoothed vertically
const rows = [];
let last = [96, 160, 222];
for (let y = 0; y < H; y++) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (sky[i] === 1) {
      const p = at(i);
      if (isBlue(p) && !isCloud(p)) (r += p[0]), (g += p[1]), (b += p[2]), n++;
    }
  }
  if (n > W * 0.02) last = [r / n, g / n, b / n];
  rows.push(last);
}
const R = 24;
const smooth = rows.map((_, y) => {
  const acc = [0, 0, 0];
  let n = 0;
  for (let k = Math.max(0, y - R); k <= Math.min(H - 1, y + R); k++) (acc[0] += rows[k][0]), (acc[1] += rows[k][1]), (acc[2] += rows[k][2]), n++;
  return acc.map((v) => v / n);
});

// 3. layers
const skyBuf = Buffer.alloc(N * 4), cloudBuf = Buffer.alloc(N * 4), landBuf = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const y = (i / W) | 0;
  const s = smooth[y];
  const p = at(i);
  skyBuf.set([s[0], s[1], s[2], 255], i * 4);
  // clouds: how much brighter than the sky behind it
  const lum = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  let a = sky[i] === 1 ? Math.max(0, Math.min(1, (lum(p) - lum(s)) / (250 - lum(s)))) * sky[i] : 0;
  a = a < 0.06 ? 0 : a;
  const un = (k) => Math.max(0, Math.min(255, a ? (p[k] - (1 - a) * s[k]) / a : 0));
  cloudBuf.set([un(0), un(1), un(2), Math.round(a * 255)], i * 4);
  landBuf.set([p[0], p[1], p[2], Math.round((1 - sky[i]) * 255)], i * 4);
}
for (const [name, buf] of [["sky", skyBuf], ["clouds", cloudBuf], ["land", landBuf]]) {
  const img = () => sharp(buf, { raw: { width: W, height: H, channels: 4 } });
  const q = name === "sky" ? { quality: 80 } : { quality: 90, alphaQuality: 100 };
  await img().webp(q).toFile(`${outBase}-${name}@2x.webp`);
  await img().resize(Math.round(W / 2)).webp(q).toFile(`${outBase}-${name}.webp`);
}
console.log("wrote", outBase, "-sky/-clouds/-land", W / 2, "x", H / 2);
