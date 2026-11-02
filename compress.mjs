import sharp from "sharp";
import fs from "fs";
import path from "path";

const inDir = "images";
const outDir = "images-optimized";
fs.mkdirSync(outDir, { recursive: true });

// 1. Shrink every JPG to 1000px wide WebP
for (const file of fs.readdirSync(inDir)) {
  if (!/\.jpe?g$/i.test(file)) continue;
  const name = path.parse(file).name.replace(/_1920$/, "");
  await sharp(path.join(inDir, file))
    .resize({ width: 1000, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(path.join(outDir, name + ".webp"));
  console.log("done:", name + ".webp");
}

// 2. Make a small favicon from the logo
await sharp(path.join(inDir, "logo.png"))
  .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(path.join(outDir, "favicon.png"));
console.log("done: favicon.png");