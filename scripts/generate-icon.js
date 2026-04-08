const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function generate() {
  const assetsDir = path.join(__dirname, "../assets");
  const iconSource = path.join(assetsDir, "icon.png");

  if (!fs.existsSync(iconSource)) {
    console.error("Error: assets/icon.png not found! Please ensure it exists.");
    process.exit(1);
  }

  console.log("Using assets/icon.png as the source logo...");

  // 1. icon-foreground.png (for Android adaptive icons, usually the logo with transparency)
  // We'll just use the source icon for now, ensuring it's 1024x1024
  await sharp(iconSource)
    .resize(1024, 1024, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toFile(path.join(assetsDir, "icon-foreground.png"));
  console.log("✓ icon-foreground.png");

  // 2. splash.png (2732x2732, centered logo on white background)
  await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: "#FFFFFF"
    }
  })
    .composite([
      {
        input: await sharp(iconSource).resize(1200, 1200, { fit: "contain" }).toBuffer(),
        gravity: "center"
      }
    ])
    .png()
    .toFile(path.join(assetsDir, "splash.png"));
  console.log("✓ splash.png");

  // 3. splash-dark.png (2732x2732, centered logo on dark background)
  await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: "#1A0A3C"
    }
  })
    .composite([
      {
        input: await sharp(iconSource).resize(1200, 1200, { fit: "contain" }).toBuffer(),
        gravity: "center"
      }
    ])
    .png()
    .toFile(path.join(assetsDir, "splash-dark.png"));
  console.log("✓ splash-dark.png");

  console.log("\nAll source assets synchronized with icon.png in /assets/");
}

generate().catch(console.error);
