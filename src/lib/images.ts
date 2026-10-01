/** The smaller copies scripts/images.mjs made of one photo in public/assets. */
export interface ImageVariants {
  /** The original's size, after any EXIF rotation. */
  width: number
  height: number
  /** A hash of the original, part of every copy's name. */
  hash: string
  widths: number[]
}

export type ImageFormat = 'avif' | 'webp'

// Written by scripts/images.mjs on predev and prebuild, and git-ignored. On a fresh clone, before the script
// has run, the glob finds nothing and every photo falls back to its original file, which is all that tests
// and type checks need.
const found = import.meta.glob<Record<string, ImageVariants>>('../generated/images.json', {
  eager: true,
  import: 'default',
})
const MANIFEST: Record<string, ImageVariants> = Object.values(found)[0] ?? {}

/** How many photos have copies. Zero means the script hasn't run (scripts/prerender.mjs checks). */
export const imageCount = Object.keys(MANIFEST).length

/** The copies made of `src` (a `/assets/...` path), or null when there are none. */
export function imageVariants(src: string): ImageVariants | null {
  return Object.hasOwn(MANIFEST, src) ? MANIFEST[src] : null
}

/** Where one copy lives. Must match `variantName` in scripts/images.mjs. */
export function variantUrl(src: string, hash: string, width: number, format: ImageFormat): string {
  const name = src.slice(src.lastIndexOf('/') + 1).replace(/\.[^.]+$/, '')
  return `/assets/img/${name}-${hash}-${width}.${format}`
}

/** A `srcset` value listing every copy in one format: `/assets/img/a-1f2e3d4c-480.webp 480w, ...`. */
export function srcSetFor(src: string, variants: ImageVariants, format: ImageFormat): string {
  return variants.widths
    .map((width) => `${variantUrl(src, variants.hash, width, format)} ${width}w`)
    .join(', ')
}

/**
 * The largest WebP copy of `src`, for places that take a single URL (a CSS background, a video poster), or
 * `src` itself when there are no copies.
 */
export function largestWebp(src: string): string {
  const variants = imageVariants(src)
  if (!variants) return src
  return variantUrl(src, variants.hash, Math.max(...variants.widths), 'webp')
}
