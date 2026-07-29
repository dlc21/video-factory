import { deflateSync } from "node:zlib"

export interface ChromaKeyColor {
  red: number
  green: number
  blue: number
}

export const RETRO_MOUTH_SKIN_KEY: ChromaKeyColor = {
  red: 199,
  green: 143,
  blue: 103,
}

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

const crcTable = new Uint32Array(256)
for (let index = 0; index < crcTable.length; index += 1) {
  let value = index
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  crcTable[index] = value >>> 0
}

const crc32 = (value: Buffer): number => {
  let crc = 0xffffffff
  for (const byte of value) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

const pngChunk = (type: string, data = Buffer.alloc(0)): Buffer => {
  const typeBytes = Buffer.from(type, "ascii")
  const chunk = Buffer.allocUnsafe(12 + data.length)
  chunk.writeUInt32BE(data.length, 0)
  typeBytes.copy(chunk, 4)
  data.copy(chunk, 8)
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 8 + data.length)
  return chunk
}

export const chromaKeyBmpToPng = (
  source: Buffer,
  key: ChromaKeyColor = RETRO_MOUTH_SKIN_KEY,
): Buffer => {
  if (source.length < 54 || source.toString("ascii", 0, 2) !== "BM") throw new Error("Retro mouth frame must be a Windows BMP")
  const pixelOffset = source.readUInt32LE(10)
  const dibSize = source.readUInt32LE(14)
  const width = source.readInt32LE(18)
  const signedHeight = source.readInt32LE(22)
  const planes = source.readUInt16LE(26)
  const bitsPerPixel = source.readUInt16LE(28)
  const compression = source.readUInt32LE(30)
  if (dibSize < 40 || width <= 0 || signedHeight === 0 || planes !== 1 || compression !== 0 || (bitsPerPixel !== 24 && bitsPerPixel !== 32)) {
    throw new Error("Retro mouth frame must be an uncompressed 24-bit or 32-bit BMP")
  }

  const height = Math.abs(signedHeight)
  const topDown = signedHeight < 0
  const bytesPerPixel = bitsPerPixel / 8
  const sourceStride = Math.ceil(width * bytesPerPixel / 4) * 4
  if (pixelOffset + sourceStride * height > source.length) throw new Error("Retro mouth frame pixel data is truncated")

  const scanlines = Buffer.allocUnsafe(height * (1 + width * 4))
  for (let y = 0; y < height; y += 1) {
    const sourceY = topDown ? y : height - 1 - y
    const sourceRow = pixelOffset + sourceY * sourceStride
    const destinationRow = y * (1 + width * 4)
    scanlines[destinationRow] = 0
    for (let x = 0; x < width; x += 1) {
      const sourcePixel = sourceRow + x * bytesPerPixel
      const blue = source[sourcePixel]
      const green = source[sourcePixel + 1]
      const red = source[sourcePixel + 2]
      const keyed = red === key.red && green === key.green && blue === key.blue
      const destinationPixel = destinationRow + 1 + x * 4
      scanlines[destinationPixel] = keyed ? 0 : red
      scanlines[destinationPixel + 1] = keyed ? 0 : green
      scanlines[destinationPixel + 2] = keyed ? 0 : blue
      scanlines[destinationPixel + 3] = keyed ? 0 : 255
    }
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 6
  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(scanlines, { level: 9 })),
    pngChunk("IEND"),
  ])
}
