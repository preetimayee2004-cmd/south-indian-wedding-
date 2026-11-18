import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { Plugin } from "vite";
import type { WeddingConfig } from "../src/config/types";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * <link rel=preload> for the hero picture with the same srcset/sizes the page's
 * <img> uses (ScenePicture: full width on phones, ≤85vh tall above 900px).
 */
function heroPreload(src: string, root: string): string {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "src/config/art-manifest.json"), "utf8"));
  const key = src.match(/\/media\/(.+)\.webp$/)?.[1];
  const e = key ? manifest[key] : undefined;
  if (!e) return `<link rel="preload" as="image" href="${src}" fetchpriority="high" />`;
  const file = (w: number) => src.replace(/\.webp$/, `-${w}.webp`);
  const set = e.widths.map((w: number) => `${file(w)} ${w}w`).join(", ");
  const sizes = `(min-width: 901px) calc(85vh * ${(e.w / e.h).toFixed(3)}), 100vw`;
  return `<link rel="preload" as="image" href="${file(e.widths.find((w: number) => w >= 960) ?? e.widths.at(-1))}" imagesrcset="${set}" imagesizes="${sizes}" fetchpriority="high" />`;
}

/**
 * Link previews come from static HTML (WhatsApp's crawler runs no JS), so this
 * plugin writes the wedding's title / description / Open Graph tags into
 * index.html from wedding.config.ts, preloads the opening artwork, and at
 * build time crops the preview image to 1200×630 JPEG and makes an
 * apple-touch icon from the favicon.
 */
export function weddingMeta(config: WeddingConfig, root: string): Plugin {
  const site = (config.meta.siteUrl ?? "").replace(/\/$/, "");
  const abs = (p: string) => (site ? `${site}${p.startsWith("/") ? p : `/${p}`}` : p);

  return {
    name: "wedding-meta",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const isBuild = !ctx.server;
        const ogImage = isBuild ? abs("/og-image.jpg") : config.meta.ogImage;
        const t = esc(config.meta.title);
        const d = esc(config.meta.description);
        const tags = [
          `<title>${t}</title>`,
          `<meta name="description" content="${d}" />`,
          `<meta name="theme-color" content="${config.theme.ivory}" />`,
          `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`,
          `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
          `<meta property="og:type" content="website" />`,
          `<meta property="og:title" content="${t}" />`,
          `<meta property="og:description" content="${d}" />`,
          `<meta property="og:image" content="${ogImage}" />`,
          `<meta property="og:image:width" content="1200" />`,
          `<meta property="og:image:height" content="630" />`,
          `<meta property="og:image:alt" content="${esc(`${config.couple.bride.name} & ${config.couple.groom.name}`)}" />`,
          site ? `<meta property="og:url" content="${site}/" />` : "",
          `<meta name="twitter:card" content="summary_large_image" />`,
          `<meta name="twitter:title" content="${t}" />`,
          `<meta name="twitter:description" content="${d}" />`,
          `<meta name="twitter:image" content="${ogImage}" />`,
          // only the hero temple is preloaded (sky colour and envelope are CSS) — the same
          // srcset/sizes as the page's <img>, so the browser fetches it once, at the right size
          heroPreload(config.media.invitation, root),
        ]
          .filter(Boolean)
          .join("\n    ");
        return html.replace(/<!-- wedding-meta -->/, tags);
      },
    },
    async generateBundle() {
      if (!site) this.warn('meta.siteUrl is empty — set it in wedding.config.ts so WhatsApp can show the preview image.');
      const src = path.join(root, "public", config.meta.ogImage.replace(/^\//, ""));
      const og = await sharp(src).resize(1200, 630, { fit: "cover", position: "attention" }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      this.emitFile({ type: "asset", fileName: "og-image.jpg", source: og });
      const icon = path.join(root, "public", "favicon.svg");
      if (fs.existsSync(icon)) {
        const png = await sharp(icon, { density: 300 }).resize(180, 180).png().toBuffer();
        this.emitFile({ type: "asset", fileName: "apple-touch-icon.png", source: png });
      }
    },
  };
}
