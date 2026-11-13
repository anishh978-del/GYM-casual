// Generates the PWA PNG icons (no dependencies) with a simple dumbbell mark.
// Run with: node tools/make-icons.mjs

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

const CREAM = [253, 246, 233];
const CREAM_LIGHT = [255, 253, 248];
const GREEN = [21, 128, 61];
const GREEN_DARK = [17, 105, 51];

const MASTER = 1024;
const SS = 2; // supersampling factor

const roundRect = (x, y, x0, y0, x1, y1, r) => {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r);
  const cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
};

const inCircle = (x, y, cx, cy, r) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;

function paint(size, kind) {
  const w = size * SS;
  const hi = new Uint8Array(w * w * 3);
  const maskable = kind === 'maskable';

  const parts = [
    [0.29, 0.468, 0.71, 0.532, 0.032],
    [0.262, 0.345, 0.336, 0.655, 0.03],
    [0.664, 0.345, 0.738, 0.655, 0.03],
    [0.352, 0.394, 0.408, 0.606, 0.025],
    [0.592, 0.394, 0.648, 0.606, 0.025],
  ];

  for (let y = 0; y < w; y += 1) {
    const ny = (y + 0.5) / w;
    for (let x = 0; x < w; x += 1) {
      const nx = (x + 0.5) / w;
      let color = maskable ? GREEN : CREAM;
      if (maskable) {
        if (parts.some(([x0, y0, x1, y1, r]) => roundRect(nx, ny, x0, y0, x1, y1, r))) {
          color = CREAM_LIGHT;
        }
      } else {
        const d = Math.hypot(nx - 0.5, ny - 0.5);
        if (d <= 0.452) color = GREEN_DARK;
        if (d <= 0.435) color = GREEN;
        if (d <= 0.437 && parts.some(([x0, y0, x1, y1, r]) => roundRect(nx, ny, x0, y0, x1, y1, r))) {
          color = CREAM_LIGHT;
        }
      }
      const i = (y * w + x) * 3;
      hi[i] = color[0];
      hi[i + 1] = color[1];
      hi[i + 2] = color[2];
    }
  }

  // Box-downsample the supersampled image.
  const out = new Uint8Array(size * size * 3);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const i = ((y * SS + sy) * w + (x * SS + sx)) * 3;
          r += hi[i];
          g += hi[i + 1];
          b += hi[i + 2];
        }
      }
      const n = SS * SS;
      const o = (y * size + x) * 3;
      out[o] = Math.round(r / n);
      out[o + 1] = Math.round(g / n);
      out[o + 2] = Math.round(b / n);
    }
  }
  return out;
}

function resize(src, srcSize, dstSize) {
  const dst = new Uint8Array(dstSize * dstSize * 3);
  const scale = srcSize / dstSize;
  for (let y = 0; y < dstSize; y += 1) {
    const sy = Math.min(srcSize - 1, Math.max(0, (y + 0.5) * scale - 0.5));
    const y0 = Math.floor(sy);
    const y1 = Math.min(srcSize - 1, y0 + 1);
    const fy = sy - y0;
    for (let x = 0; x < dstSize; x += 1) {
      const sx = Math.min(srcSize - 1, Math.max(0, (x + 0.5) * scale - 0.5));
      const x0 = Math.floor(sx);
      const x1 = Math.min(srcSize - 1, x0 + 1);
      const fx = sx - x0;
      for (let c = 0; c < 3; c += 1) {
        const p00 = src[(y0 * srcSize + x0) * 3 + c];
        const p10 = src[(y0 * srcSize + x1) * 3 + c];
        const p01 = src[(y1 * srcSize + x0) * 3 + c];
        const p11 = src[(y1 * srcSize + x1) * 3 + c];
        dst[(y * dstSize + x) * 3 + c] = Math.round(
          p00 * (1 - fx) * (1 - fy) + p10 * fx * (1 - fy) + p01 * (1 - fx) * fy + p11 * fx * fy,
        );
      }
    }
  }
  return dst;
}

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

function encodePNG(size, rgb) {
  const stride = size * 3;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0;
    for (let x = 0; x < stride; x += 1) {
      raw[y * (stride + 1) + 1 + x] = rgb[y * stride + x];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolour
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const regular = paint(MASTER, 'regular');
const maskable = paint(MASTER, 'maskable');

const outputs = [
  ['icon-192.png', 192, regular],
  ['icon-512.png', 512, regular],
  ['maskable-512.png', 512, maskable],
  ['apple-touch-icon.png', 180, regular],
];

for (const [name, size, master] of outputs) {
  const pixels = size === MASTER ? master : resize(master, MASTER, size);
  fs.writeFileSync(path.join(outDir, name), encodePNG(size, pixels));
  console.log(`wrote public/icons/${name} (${size}x${size})`);
}
