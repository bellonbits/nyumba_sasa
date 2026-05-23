const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

async function main() {
  const assetsDir = path.join(__dirname, "../assets");
  const publicDir = path.join(__dirname, "../public");
  
  const logoSource = path.join(assetsDir, "logo-removebg-preview.png");
  const iconnSource = path.join(assetsDir, "iconn.jpg");

  if (!fs.existsSync(logoSource)) {
    console.error("Error: logo-removebg-preview.png not found in assets/ directory!");
    console.error("Please copy 'logo-removebg-preview.png' from your Downloads folder to: " + logoSource);
    process.exit(1);
  }
  if (!fs.existsSync(iconnSource)) {
    console.error("Error: iconn.jpg not found in assets/ directory!");
    console.error("Please copy 'iconn.jpg' from your Downloads folder to: " + iconnSource);
    process.exit(1);
  }

  console.log("1. Directly copying logo-removebg-preview.png to public/logo.png...");
  fs.copyFileSync(logoSource, path.join(publicDir, "logo.png"));
  fs.copyFileSync(logoSource, path.join(publicDir, "logo-removebg-preview.png"));
  console.log("✓ public/logo.png updated.");

  console.log("2. Processing iconn.jpg with sharp to assets/icon.png...");
  await sharp(iconnSource)
    .resize(1024, 1024, { fit: "contain" })
    .png()
    .toFile(path.join(assetsDir, "icon.png"));
  console.log("✓ assets/icon.png updated successfully.");

  console.log("3. Generating mobile and web app icons via Capacitor...");
  try {
    // Run the generate icon script and capacitor assets command
    execSync("npm run icons", { stdio: "inherit", cwd: path.join(__dirname, "..") });
    console.log("✓ All mobile and web icons regenerated successfully!");
  } catch (err) {
    console.error("Warning: Icon generation command failed. Make sure all dependencies are installed.");
    console.error(err.message);
  }
}

main().catch(console.error);
