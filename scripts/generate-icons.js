import fs from 'node:fs'
import zlib from 'node:zlib'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '..', 'public', 'icons')

function crc32(data) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeB = Buffer.from(type, 'ascii')
  const crcVal = crc32(Buffer.concat([typeB, data]))
  const crcB = Buffer.alloc(4)
  crcB.writeUInt32BE(crcVal)
  return Buffer.concat([len, typeB, data, crcB])
}

function createPNG(width, height, pixelFn) {
  const raw = Buffer.alloc(height * (1 + width * 4))
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height)
      const off = y * (1 + width * 4) + 1 + x * 4
      raw[off] = r
      raw[off + 1] = g
      raw[off + 2] = b
      raw[off + 3] = a
    }
  }
  const compressed = zlib.deflateSync(raw)
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function pixelIcon(x, y, w, h) {
  const cx = w / 2
  const cy = h / 2
  const r = Math.min(w, h) / 2 - 6
  const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)

  const bgT = Math.min(d / (w * 0.5), 1)
  const bgR = Math.round(lerp(11, 31, bgT))
  const bgG = Math.round(lerp(14, 21, bgT))
  const bgB = Math.round(lerp(26, 56, bgT))

  if (d > r + 2) return [0, 0, 0, 0]
  if (d > r - 2) return [201, 160, 110, 180]

  if (d < 10 * (w / 192)) return [240, 234, 255, 200]
  if (d < 22 * (w / 192)) return [170, 80, 136, 160]

  const starR = r * 0.5
  const angle = Math.atan2(y - cy, x - cx)
  const starR2 = starR * (1 - 0.4 * Math.abs(Math.cos(angle * 5)))
  if (d < starR2 + 1) {
    const t = d / starR
    return [
      Math.round(lerp(218, 201, t)),
      Math.round(lerp(186, 160, t)),
      Math.round(lerp(136, 110, t)),
      235,
    ]
  }

  return [bgR, bgG, bgB, 255]
}

const sizes = [
  [192, 'icon-192.png'],
  [512, 'icon-512.png'],
]

for (const [size, name] of sizes) {
  const png = createPNG(size, size, pixelIcon)
  fs.writeFileSync(path.join(outDir, name), png)
  const kb = (png.length / 1024).toFixed(1)
  console.log(`Generated ${name} (${size}x${size}, ${kb} KB)`)
}
