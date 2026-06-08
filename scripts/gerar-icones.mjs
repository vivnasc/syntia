// Gera ícones PNG da PWA sem dependências externas (encoder PNG em JS puro).
// Fundo índigo + círculos roxo/rosa, com a marca centrada (zona segura maskable).
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");
fs.mkdirSync(PUBLIC, { recursive: true });

// --- CRC32 / PNG ---
const CRC_TAB = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TAB[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function png(size, draw) {
  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x, y);
      const i = (y * size + x) * 4;
      px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = a;
    }
  }
  // adiciona byte de filtro 0 por linha
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const INDIGO = [30, 27, 75];
const ROXO = [167, 139, 250];
const ROSA = [240, 171, 252];
function mix(a, b, t) { return a.map((v, i) => Math.round(v + (b[i] - v) * t)); }

function desenhar(size) {
  const cx = size / 2, cy = size / 2;
  const rOut = size * 0.34, rIn = size * 0.17;
  return (x, y) => {
    // gradiente de fundo diagonal índigo→índigo-mais-escuro
    const g = (x + y) / (2 * size);
    const bg = mix(INDIGO, [12, 10, 40], g);
    const d = Math.hypot(x - cx, y - cy);
    if (d < rIn) return [...ROSA, 255];
    if (d < rOut) {
      const t = (d - rIn) / (rOut - rIn);
      return [...mix(ROSA, ROXO, t), 255];
    }
    return [...bg, 255];
  };
}

for (const size of [180, 192, 512]) {
  fs.writeFileSync(path.join(PUBLIC, `icon-${size}.png`), png(size, desenhar(size)));
  console.log(`icon-${size}.png`);
}
console.log("Ícones gerados em", PUBLIC);
