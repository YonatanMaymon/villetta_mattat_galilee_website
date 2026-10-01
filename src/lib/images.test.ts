import { describe, expect, it } from 'vitest'
import { imageVariants, largestWebp, srcSetFor, variantUrl } from './images'

const variants = { width: 1653, height: 1100, hash: '1f2e3d4c', widths: [480, 960, 1600] }

describe('photo copies', () => {
  it('are named the way scripts/images.mjs writes them', () => {
    expect(variantUrl('/assets/gallery-01.jpg', '1f2e3d4c', 480, 'webp')).toBe(
      '/assets/img/gallery-01-1f2e3d4c-480.webp',
    )
    expect(variantUrl('/assets/culinary-wix-photo.webp', 'aa', 960, 'avif')).toBe(
      '/assets/img/culinary-wix-photo-aa-960.avif',
    )
  })

  it('are listed by width for srcset', () => {
    expect(srcSetFor('/assets/a.jpg', variants, 'avif')).toBe(
      '/assets/img/a-1f2e3d4c-480.avif 480w, /assets/img/a-1f2e3d4c-960.avif 960w, ' +
        '/assets/img/a-1f2e3d4c-1600.avif 1600w',
    )
  })

  it('fall back to the original when a photo has none', () => {
    expect(imageVariants('/assets/not-a-photo.jpg')).toBeNull()
    expect(largestWebp('/assets/not-a-photo.jpg')).toBe('/assets/not-a-photo.jpg')
  })
})
