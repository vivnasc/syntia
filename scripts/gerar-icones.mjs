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

// Tile editorial: estrela de quatro pontas em ouro + anel-selo fino,
// sobre tinta quente profunda. Sóbrio, condiz com o "✦ SyntIA".
const INK_A = [38, 26, 28];   // canto claro do fundo
const INK_B = [24, 16, 18];   // canto escuro do fundo
const GOLD = [198, 162, 78];
const GOLD_HI = [230, 201, 130];
function mix(a, b, t) { return a.map((v, i) => Math.round(v + (b[i] - v) * t)); }
function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

function desenhar(size) {
  const cx = (size - 1) / 2, cy = (size - 1) / 2;
  const rStar = size * 0.30;     // raio das pontas da estrela
  const rRing = size * 0.40;     // anel-selo
  const ringW = Math.max(1, size * 0.011);
  return (x, y) => {
    const dx = x - cx, dy = y - cy;
    const g = clamp01((x + y) / (2 * size));
    const bg = mix(INK_A, INK_B, g);

    // estrela de 4 pontas (astroide): sqrt(|nx|)+sqrt(|ny|) <= 1
    const nx = Math.abs(dx) / rStar;
    const ny = Math.abs(dy) / rStar;
    const s = Math.sqrt(nx) + Math.sqrt(ny);
    if (s <= 1.02) {
      const dist = Math.hypot(dx, dy);
      const core = clamp01(1 - dist / rStar);          // mais claro ao centro
      const col = mix(GOLD, GOLD_HI, core * 0.7);
      const edge = clamp01((1.02 - s) / 0.06);          // suaviza o contorno
      return [...mix(bg, col, edge), 255];
    }

    // anel-selo fino
    const dist = Math.hypot(dx, dy);
    const ringA = clamp01(1 - Math.abs(dist - rRing) / ringW);
    if (ringA > 0) return [...mix(bg, GOLD, ringA * 0.55), 255];

    return [...bg, 255];
  };
}

for (const size of [32, 180, 192, 512]) {
  fs.writeFileSync(path.join(PUBLIC, `icon-${size}.png`), png(size, desenhar(size)));
  console.log(`icon-${size}.png`);
}
console.log("Ícones gerados em", PUBLIC);
