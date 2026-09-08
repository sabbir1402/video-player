const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Standard CRC32 table implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crcData = chunk.subarray(4, 8 + len);
  const crc = crc32(crcData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePng(width, height, isMaskable = false) {
  const bytesPerPixel = 4;
  const rawData = Buffer.alloc(height * (1 + width * bytesPerPixel));

  const cx = width / 2;
  const cy = height / 2;
  const outerR = (width / 2) * (isMaskable ? 0.75 : 0.88);
  const innerR = outerR * 0.65;
  const playSize = outerR * 0.45;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background: dark navy (#090b14)
      let r = 9, g = 11, b = 20, a = 255;

      // Rounded container outline if not maskable
      const cornerR = width * 0.22;
      const qx = Math.max(0, Math.abs(dx) - (cx - cornerR));
      const qy = Math.max(0, Math.abs(dy) - (cy - cornerR));
      const distCorner = Math.sqrt(qx * qx + qy * qy);

      if (!isMaskable && distCorner > cornerR) {
        a = 0;
        r = 0;
        g = 0;
        b = 0;
      } else {
        // Gradient background
        const grad = (x + y) / (width + height);
        r = Math.floor(10 + grad * 15);
        g = Math.floor(14 + grad * 20);
        b = Math.floor(28 + grad * 35);

        // Soundwave ring
        if (Math.abs(dist - outerR) < width * 0.02) {
          r = 56; g = 189; b = 248; // Sky-400
        } else if (dist <= innerR) {
          // Inside media disc
          r = 15; g = 23; b = 42; // Slate-900

          // Check if point is inside Play Triangle
          // Triangle vertices: (cx - playSize*0.5, cy - playSize*0.7), (cx + playSize*0.8, cy), (cx - playSize*0.5, cy + playSize*0.7)
          const p1x = cx - playSize * 0.45;
          const p1y = cy - playSize * 0.65;
          const p2x = cx + playSize * 0.75;
          const p2y = cy;
          const p3x = cx - playSize * 0.45;
          const p3y = cy + playSize * 0.65;

          const area = 0.5 * (-p2y * p3x + p1y * (-p2x + p3x) + p1x * (p2y - p3y) + p2x * p3y);
          const s = 1 / (2 * area) * (p1y * p3x - p1x * p3y + (p3y - p1y) * x + (p1x - p3x) * y);
          const t = 1 / (2 * area) * (p1x * p2y - p1y * p2x + (p1y - p2y) * x + (p2x - p1x) * y);

          if (s >= 0 && t >= 0 && (1 - s - t) >= 0) {
            // Inside Play triangle: glowing cyan / sky gradient
            const tGrad = (x - p1x) / (p2x - p1x);
            r = Math.floor(56 + tGrad * 40);
            g = Math.floor(189 - tGrad * 40);
            b = 248;
          }
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // PNG Header
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA (6)
  ihdrData[10] = 0; // Compression: Deflate (0)
  ihdrData[11] = 0; // Filter: 0
  ihdrData[12] = 0; // Interlace: 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT Chunk
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePng(64, 64, false));

console.log('Successfully generated all PWA icons in /public:');
console.log('- pwa-192x192.png');
console.log('- pwa-512x512.png');
console.log('- pwa-maskable-512x512.png');
console.log('- apple-touch-icon.png');
console.log('- favicon.ico');
