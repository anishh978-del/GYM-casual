// Derives the Android icon / splash sources in assets/ from the PWA icon mark.
// Run with: node tools/make-android-assets.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const iconPath = path.join(root, 'public', 'icons', 'icon-1024.png');
const outDir = path.join(root, 'assets');
const CREAM = '#fdf6e9';

fs.mkdirSync(outDir, { recursive: true });

const write = (name, pipeline) => pipeline.toFile(path.join(outDir, name));

// Legacy launcher icon + store icon.
await write('icon.png', sharp(iconPath).png());

// Adaptive foreground: the round mark only, inside Android's 66% safe zone.
const circleMask = await sharp(
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><circle cx="512" cy="512" r="463" fill="#fff"/></svg>',
  ),
)
  .png()
  .toBuffer();
const cutMark = await sharp(iconPath)
  .composite([{ input: circleMask, blend: 'dest-in' }])
  .png()
  .toBuffer();
const roundMark = await sharp(cutMark)
  .resize(700, 700, { fit: 'contain' })
  .png()
  .toBuffer();
await write(
  'icon-foreground.png',
  sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: roundMark, gravity: 'center' }])
    .png(),
);
await write(
  'icon-background.png',
  sharp({ create: { width: 1024, height: 1024, channels: 4, background: CREAM } }).png(),
);

// Launch splash: cream canvas with the mark centred.
const splashMark = await sharp(iconPath).resize(760, 760).png().toBuffer();
await write(
  'splash.png',
  sharp({ create: { width: 2732, height: 2732, channels: 4, background: CREAM } })
    .composite([{ input: splashMark, gravity: 'center' }])
    .png(),
);
await write(
  'splash-dark.png',
  sharp({ create: { width: 2732, height: 2732, channels: 4, background: CREAM } })
    .composite([{ input: splashMark, gravity: 'center' }])
    .png(),
);

console.log('wrote assets/icon.png, icon-foreground.png, icon-background.png, splash.png, splash-dark.png');
