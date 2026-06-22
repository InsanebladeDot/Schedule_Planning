const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  return (~c) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function createSolidPng(size, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  const row = Buffer.alloc(1 + size * 3)
  for (let x = 0; x < size; x++) {
    const o = 1 + x * 3
    row[o] = r
    row[o + 1] = g
    row[o + 2] = b
  }
  const raw = Buffer.alloc(row.length * size)
  for (let y = 0; y < size; y++) row.copy(raw, y * row.length)
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ])
}

const dir = path.join(__dirname, '../static/icons/tab')
fs.mkdirSync(dir, { recursive: true })

const files = [
  ['calendar.png', 26, 26, 26],
  ['calendar-active.png', 26, 26, 26],
  ['clock.png', 176, 176, 176],
  ['clock-active.png', 26, 26, 26],
  ['user.png', 176, 176, 176],
  ['user-active.png', 26, 26, 26]
]

files.forEach(([name, r, g, b]) => {
  fs.writeFileSync(path.join(dir, name), createSolidPng(48, r, g, b))
})

console.log('Tab PNG placeholders generated')
