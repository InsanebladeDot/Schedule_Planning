const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
  }
  return (~c) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type)
  const crcBuf = Buffer.alloc(4)
  const crcData = Buffer.concat([typeBuf, data])
  crcBuf.writeUInt32BE(crc32(crcData))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function createSolidPng(size, r, g, b, a = 255) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const row = Buffer.alloc(1 + size * 4)
  for (let x = 0; x < size; x++) {
    const o = 1 + x * 4
    row[o] = r
    row[o + 1] = g
    row[o + 2] = b
    row[o + 3] = a
  }
  const raw = Buffer.alloc((1 + size * 4) * size)
  for (let y = 0; y < size; y++) {
    row.copy(raw, y * row.length)
  }
  const compressed = zlib.deflateSync(raw)

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ])
}

const dir = path.join(__dirname, '../static')
fs.mkdirSync(dir, { recursive: true })

const icons = [
  ['tab-weekly.png', 153, 153, 153],
  ['tab-weekly-active.png', 255, 105, 180],
  ['tab-timeline.png', 153, 153, 153],
  ['tab-timeline-active.png', 255, 105, 180],
  ['tab-profile.png', 153, 153, 153],
  ['tab-profile-active.png', 255, 105, 180]
]

icons.forEach(([name, r, g, b]) => {
  fs.writeFileSync(path.join(dir, name), createSolidPng(48, r, g, b))
})

console.log('Icons generated in static/')
