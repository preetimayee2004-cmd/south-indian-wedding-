import sharp from "sharp";

async function generateAllAssets() {
  const inputPath = "C:/Users/DELL/.gemini/antigravity/brain/f8d94bf3-72bd-4579-a357-2b185750d7f8/.user_uploaded/media_1795243588314_c20f19a0.jpg";
  const orig = sharp(inputPath);
  const meta = await orig.metadata();
  console.log("Source image:", meta.width, "x", meta.height);

  // 1. Portrait 1x
  await sharp(inputPath)
    .webp({ quality: 92 })
    .toFile("public/media/temple-events-bg.webp");
  await sharp(inputPath)
    .jpeg({ quality: 92 })
    .toFile("public/media/temple-events-bg.jpg");

  // 2. Portrait 2x (upscaled lanczos3 for retina)
  await sharp(inputPath)
    .resize(meta.width * 2, meta.height * 2, { kernel: "lanczos3" })
    .webp({ quality: 90 })
    .toFile("public/media/temple-events-bg@2x.webp");

  console.log("Generated portrait assets (1x & 2x)");

  // 3. Wide 1x (1920 x 1080)
  const W = 1920;
  const H = 1080;

  // Extract pure damask floral patch from top-right
  const patternPatch = await sharp(inputPath)
    .extract({ left: 420, top: 30, width: 300, height: 480 })
    .toBuffer();

  const baseMaroon = await sharp({
    create: {
      width: W,
      height: H,
      channels: 3,
      background: { r: 90, g: 2, b: 23 }
    }
  }).png().toBuffer();

  const scaledWidth = Math.round(meta.width * (H / meta.height)); // 766 px
  const scaledImg = await sharp(inputPath)
    .resize(scaledWidth, H, { fit: "fill", kernel: "lanczos3" })
    .toBuffer();

  const leftW = Math.round(scaledWidth * 0.72); // ~552 px
  const leftPart = await sharp(scaledImg)
    .extract({ left: 0, top: 0, width: leftW, height: H })
    .png()
    .toBuffer();

  const rightStart = Math.round(scaledWidth * 0.58); // ~444 px
  const rightW = scaledWidth - rightStart; // ~322 px
  const rightPart = await sharp(scaledImg)
    .extract({ left: rightStart, top: 0, width: rightW, height: H })
    .png()
    .toBuffer();

  const fadeW = 120;
  const leftMaskSvg = `
    <svg width="${leftW}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#fff" />
          <stop offset="${(leftW - fadeW) / leftW * 100}%" stop-color="#fff" />
          <stop offset="100%" stop-color="#000" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)" />
    </svg>
  `;
  const leftMaskPng = await sharp(Buffer.from(leftMaskSvg)).png().toBuffer();
  const leftWithAlpha = await sharp(leftPart)
    .ensureAlpha()
    .composite([{ input: leftMaskPng, blend: "dest-in" }])
    .png()
    .toBuffer();

  const rightFadeW = 100;
  const rightMaskSvg = `
    <svg width="${rightW}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#000" />
          <stop offset="${rightFadeW / rightW * 100}%" stop-color="#fff" />
          <stop offset="100%" stop-color="#fff" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g2)" />
    </svg>
  `;
  const rightMaskPng = await sharp(Buffer.from(rightMaskSvg)).png().toBuffer();
  const rightWithAlpha = await sharp(rightPart)
    .ensureAlpha()
    .composite([{ input: rightMaskPng, blend: "dest-in" }])
    .png()
    .toBuffer();

  const tiles = [];
  for (let y = 0; y < H; y += 480) {
    for (let x = 0; x < W; x += 300) {
      tiles.push({ input: patternPatch, left: x, top: y });
    }
  }

  const tiledBg = await sharp(baseMaroon)
    .composite(tiles)
    .png()
    .toBuffer();

  await sharp(tiledBg)
    .composite([
      { input: leftWithAlpha, left: 0, top: 0 },
      { input: rightWithAlpha, left: W - rightW, top: 0 }
    ])
    .webp({ quality: 92 })
    .toFile("public/media/temple-events-bg-wide.webp");

  console.log("Generated wide 1x asset");

  // 4. Wide 2x (2560 x 1440)
  const W2 = 2560;
  const H2 = 1440;
  const scaledWidth2 = Math.round(meta.width * (H2 / meta.height));
  const scaledImg2 = await sharp(inputPath)
    .resize(scaledWidth2, H2, { fit: "fill", kernel: "lanczos3" })
    .toBuffer();

  const leftW2 = Math.round(scaledWidth2 * 0.72);
  const leftPart2 = await sharp(scaledImg2)
    .extract({ left: 0, top: 0, width: leftW2, height: H2 })
    .png()
    .toBuffer();

  const rightStart2 = Math.round(scaledWidth2 * 0.58);
  const rightW2 = scaledWidth2 - rightStart2;
  const rightPart2 = await sharp(scaledImg2)
    .extract({ left: rightStart2, top: 0, width: rightW2, height: H2 })
    .png()
    .toBuffer();

  const fadeW2 = 160;
  const leftMaskSvg2 = `
    <svg width="${leftW2}" height="${H2}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#fff" />
          <stop offset="${(leftW2 - fadeW2) / leftW2 * 100}%" stop-color="#fff" />
          <stop offset="100%" stop-color="#000" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g3)" />
    </svg>
  `;
  const leftMaskPng2 = await sharp(Buffer.from(leftMaskSvg2)).png().toBuffer();
  const leftWithAlpha2 = await sharp(leftPart2)
    .ensureAlpha()
    .composite([{ input: leftMaskPng2, blend: "dest-in" }])
    .png()
    .toBuffer();

  const rightFadeW2 = 140;
  const rightMaskSvg2 = `
    <svg width="${rightW2}" height="${H2}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#000" />
          <stop offset="${rightFadeW2 / rightW2 * 100}%" stop-color="#fff" />
          <stop offset="100%" stop-color="#fff" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g4)" />
    </svg>
  `;
  const rightMaskPng2 = await sharp(Buffer.from(rightMaskSvg2)).png().toBuffer();
  const rightWithAlpha2 = await sharp(rightPart2)
    .ensureAlpha()
    .composite([{ input: rightMaskPng2, blend: "dest-in" }])
    .png()
    .toBuffer();

  const baseMaroon2 = await sharp({
    create: {
      width: W2,
      height: H2,
      channels: 3,
      background: { r: 90, g: 2, b: 23 }
    }
  }).png().toBuffer();

  const tiles2 = [];
  for (let y = 0; y < H2; y += 480) {
    for (let x = 0; x < W2; x += 300) {
      tiles2.push({ input: patternPatch, left: x, top: y });
    }
  }

  const tiledBg2 = await sharp(baseMaroon2)
    .composite(tiles2)
    .png()
    .toBuffer();

  await sharp(tiledBg2)
    .composite([
      { input: leftWithAlpha2, left: 0, top: 0 },
      { input: rightWithAlpha2, left: W2 - rightW2, top: 0 }
    ])
    .webp({ quality: 90 })
    .toFile("public/media/temple-events-bg-wide@2x.webp");

  console.log("Generated wide 2x asset");
}

generateAllAssets().catch(err => {
  console.error("Error generating assets:", err);
  process.exit(1);
});
