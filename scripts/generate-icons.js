const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Crisp minimalist SVG with focus checkmark
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#18181b"/>
  <rect x="24" y="24" width="464" height="464" rx="104" fill="none" stroke="#27272a" stroke-width="8"/>
  <circle cx="256" cy="256" r="160" fill="#27272a" opacity="0.4"/>
  <path d="M168 260 L228 320 L348 196" fill="none" stroke="#fafafa" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Maskable icon has more padding safe zone
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#18181b"/>
  <circle cx="256" cy="256" r="140" fill="#27272a" opacity="0.5"/>
  <path d="M180 260 L234 314 L336 206" fill="none" stroke="#fafafa" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svg);

async function generate() {
  await sharp(Buffer.from(svg))
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192.png'));

  await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512.png'));

  await sharp(Buffer.from(svg))
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));

  await sharp(Buffer.from(maskableSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-192.png'));

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512.png'));

  console.log('Icons generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
