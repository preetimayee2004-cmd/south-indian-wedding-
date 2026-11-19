/**
 * Grades a temple artwork toward the hero temple's palette (temple-hero.webp):
 * richer colours and contrast, and pinkish-tan stone shifted to the hero's
 * golden sandstone. Transparency is kept.
 *
 *   node scripts/match-hero-colours.mjs <input> <outBase>
 *   e.g. node scripts/match-hero-colours.mjs arch-original@2x.webp public/media/invite-arch
 * Writes <outBase>@2x.webp (full size) and <outBase>.webp (half size).
 */
import sharp from "sharp";

const [src, outBase] = process.argv.slice(2);

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  let [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
  const stone = h >= 5 && h <= 45 && s < 0.62 && l > 0.3; // the tan pillars, lintel, bases
  if (stone) {
    const w = Math.min(1, (0.62 - s) / 0.2); // plainer stone shifts more
    h += (34 - h) * 0.8 * w; // toward the hero's golden sandstone
    s = Math.min(1, s * 1.25 + 0.05 * w);
    l = Math.min(0.92, l * (1 + 0.1 * w));
  } else {
    s = Math.min(1, s * 1.18); // the painted colours, a little richer
  }
  l = Math.max(0, Math.min(1, (l - 0.45) * 1.22 + 0.44)); // a touch more contrast
  const [r, g, b] = hslToRgb(h, s, l);
  data[i] = r; data[i + 1] = g; data[i + 2] = b;
}
const img = () => sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
await img().webp({ quality: 90, alphaQuality: 100 }).toFile(`${outBase}@2x.webp`);
await img().resize(Math.round(info.width / 2)).webp({ quality: 90, alphaQuality: 100 }).toFile(`${outBase}.webp`);
console.log("wrote", outBase);
