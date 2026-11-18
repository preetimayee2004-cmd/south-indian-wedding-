// Usage: node scripts/prepare-art.mjs <folder-with-originals> [subfolder]
//   e.g. scene layers: node scripts/prepare-art.mjs ./my-layers layers  → public/media/layers/
//
// For every PNG/JPG/WebP in the folder, writes responsive WebP files to public/media:
//   <name>-480.webp, <name>-960.webp, <name>-1920.webp
//     — never wider than the original (a smaller original stops at its own width,
//       e.g. a 768px original gives -480 and -768); nothing is ever enlarged.
//   <name>.webp — the largest of those, for places that need one plain URL.
// Name the originals after the media file they replace, e.g. temple-hero.png.
// Records each image's natural size and its widths in src/config/art-manifest.json,
// which the pages use to build srcset/sizes (src/lib/art.ts).
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const STEPS = [480, 960, 1920];

const src = process.argv[2];
const sub = process.argv[3] ?? "";
if (!src) throw new Error("Pass the folder of original images.");
const out = path.resolve("public/media", sub);
fs.mkdirSync(out, { recursive: true });
const manifestPath = path.resolve("src/config/art-manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
const kb = (p) => Math.round(fs.statSync(p).size / 1024) + "K";

for (const f of fs.readdirSync(src)) {
  if (!/\.(png|jpe?g|webp)$/i.test(f)) continue;
  const name = path.parse(f).name;
  const input = path.join(src, f);
  const { width, height } = await sharp(input).metadata();
  const widths = [...new Set([...STEPS.filter((w) => w < width), Math.min(width, 1920)])].sort((a, b) => a - b);

  const sizes = [];
  for (const w of widths) {
    const file = path.join(out, `${name}-${w}.webp`);
    await sharp(input).resize(w, null, { kernel: "lanczos3" }).webp({ quality: w >= 1920 ? 84 : 86, alphaQuality: 100, effort: 6 }).toFile(file);
    sizes.push(`${w}:${kb(file)}`);
  }
  fs.copyFileSync(path.join(out, `${name}-${widths.at(-1)}.webp`), path.join(out, `${name}.webp`));

  manifest[sub ? `${sub}/${name}` : name] = { w: width, h: height, widths };
  console.log(name.padEnd(18), `${width}x${height}`.padEnd(11), sizes.join("  "));
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("manifest:", manifestPath);
