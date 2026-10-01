// Makes smaller copies of the photos in public/assets for browsers to choose from: AVIF and WebP at a few
// widths, in public/assets/img, plus the manifest <Picture> reads (src/generated/images.json). Both are
// git-ignored. Runs before `vite` and `vite build` (predev, prebuild). A copy's name carries a hash of its
// original, so existing copies are reused and only new or changed photos take time.
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'

const SOURCE_DIR = 'public/assets'
const OUT_DIR = 'public/assets/img'
const MANIFEST = 'src/generated/images.json'
const WIDTHS = [480, 960, 1600]
const ENCODERS = {
  avif: (image) => image.avif({ quality: 50, effort: 4 }),
  webp: (image) => image.webp({ quality: 75 }),
}
const PHOTO = /\.(jpe?g|png|webp)$/i
// Small decorations drawn at a fixed size: the logo, the heading ornament and the favicon.
const SKIP = new Set(['villetta-logo.png', 'header-banner.png', 'site-icon.jpg'])

/** Must match `variantUrl` in src/lib/images.ts. */
const variantName = (file, hash, width, format) => `${path.parse(file).name}-${hash}-${width}.${format}`

/** The widths to make: the standard ones below the original's, plus the original's own if it is smaller. */
function widthsFor(width) {
  const widths = WIDTHS.filter((w) => w < width)
  if (width < WIDTHS[WIDTHS.length - 1]) widths.push(width)
  return widths
}

async function processPhoto(file) {
  const source = await readFile(path.join(SOURCE_DIR, file))
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 8)
  const meta = await sharp(source).metadata()
  // Camera photos can be stored sideways with an EXIF note to turn them; browsers and .rotate() apply it.
  const [width, height] = (meta.orientation ?? 1) >= 5 ? [meta.height, meta.width] : [meta.width, meta.height]
  const widths = widthsFor(width)

  const outputs = []
  let made = 0
  for (const w of widths) {
    for (const [format, encode] of Object.entries(ENCODERS)) {
      const name = variantName(file, hash, w, format)
      outputs.push(name)
      const target = path.join(OUT_DIR, name)
      if (existsSync(target)) continue
      await encode(sharp(source).rotate().resize({ width: w })).toFile(target)
      made++
    }
  }
  return { file, entry: { width, height, hash, widths }, outputs, made }
}

/** Runs `task` over `items`, a few at a time. */
async function inPool(items, limit, task) {
  const results = []
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await task(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

const started = Date.now()
await mkdir(OUT_DIR, { recursive: true })
await mkdir(path.dirname(MANIFEST), { recursive: true })

const entries = await readdir(SOURCE_DIR, { withFileTypes: true })
const photos = entries
  .filter((entry) => entry.isFile() && PHOTO.test(entry.name) && !SKIP.has(entry.name))
  .map((entry) => entry.name)
  .sort()

const results = await inPool(photos, Math.max(1, Math.floor(os.availableParallelism() / 2)), processPhoto)

// Copies of photos that were changed or removed since the last run.
const expected = new Set(results.flatMap((result) => result.outputs))
const stale = (await readdir(OUT_DIR)).filter((name) => !expected.has(name))
await Promise.all(stale.map((name) => rm(path.join(OUT_DIR, name))))

const manifest = Object.fromEntries(results.map(({ file, entry }) => [`/assets/${file}`, entry]))
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')

const made = results.reduce((sum, result) => sum + result.made, 0)
const seconds = ((Date.now() - started) / 1000).toFixed(1)
console.log(`images: ${photos.length} photos, ${made} new copies, ${stale.length} removed (${seconds}s)`)
