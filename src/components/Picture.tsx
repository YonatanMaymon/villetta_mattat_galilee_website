import type { ImgHTMLAttributes } from 'react'
import { imageVariants, srcSetFor } from '../lib/images'

interface PictureProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  /** How wide the photo is drawn at each screen width, as in <img sizes>, so the browser picks a copy. */
  sizes: string
}

/**
 * A photo from /assets as <picture>: AVIF and WebP copies at several widths (made by scripts/images.mjs),
 * the original as the fallback, and its natural size, so the page doesn't jump while the photo loads.
 * `sizes` goes on each <source>: the one on the <img> doesn't apply to them.
 */
export default function Picture({ src, sizes, ...img }: PictureProps) {
  const variants = imageVariants(src)
  if (!variants) return <img src={src} {...img} />

  return (
    // `contents`: the <picture> draws no box of its own, so the <img> lays out as if it stood alone.
    <picture className="contents">
      <source type="image/avif" srcSet={srcSetFor(src, variants, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSetFor(src, variants, 'webp')} sizes={sizes} />
      <img src={src} width={variants.width} height={variants.height} decoding="async" {...img} />
    </picture>
  )
}
