// Usage: node scripts/prepare-art.mjs <folder-with-originals> [subfolder]
//   e.g. scene layers: node scripts/prepare-art.mjs ./my-layers layers  → public/media/layers/
// For every PNG/JPG/WebP in the folder, writes to public/media:
//   <name>.webp      — 1×, high quality (from the lossless original)
//   <name>@2x.webp   — 2× (Lanczos + gentle sharpening) for retina phones & laptops
// Name the originals after the media file they replace, e.g. gopuram-sky.png.
// Also records each size in src/config/art-manifest.json so pages can offer the 2× file.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const src = process.argv[2];
const sub = process.argv[3] ?? "";
if (!src) throw new Error("Pass the folder of original images.");
const out = path.resolve("public/media", sub);
fs.mkdirSync(out, { recursive: true });
const manifestPath = path.resolve("src/config/art-manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

for (const f of fs.readdirSync(src)) {
  if (!/\.(png|jpe?g|webp)$/i.test(f)) continue;
  const name = path.parse(f).name;
  const input = path.join(src, f);
  const { width, height } = await sharp(input).metadata();
  await sharp(input).webp({ quality: 92, effort: 6 }).toFile(path.join(out, `${name}.webp`));
  await sharp(input)
    .resize(width * 2, null, { kernel: "lanczos3" })
    .sharpen({ sigma: 0.9, m1: 0.6, m2: 1.4 })
    .webp({ quality: 86, effort: 6 })
    .toFile(path.join(out, `${name}@2x.webp`));
  manifest[sub ? `${sub}/${name}` : name] = { w: width, h: height }; // 1× size; @2× is double
  const kb = (p) => Math.round(fs.statSync(p).size / 1024) + " KB";
  console.log(name.padEnd(18), kb(path.join(out, `${name}.webp`)).padStart(8), kb(path.join(out, `${name}@2x.webp`)).padStart(9));
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("manifest:", manifestPath);
