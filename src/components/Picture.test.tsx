import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import Picture from './Picture'

// One photo with copies, whatever the generated manifest on this machine holds.
vi.mock('../lib/images', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/images')>()
  const variants = { width: 1600, height: 1000, hash: 'abcd1234', widths: [480, 960, 1600] }
  return { ...actual, imageVariants: (src: string) => (src === '/assets/photo.jpg' ? variants : null) }
})

const SIZES = '(min-width: 640px) 50vw, 100vw'

describe('<Picture>', () => {
  const html = renderToStaticMarkup(
    <Picture src="/assets/photo.jpg" alt="The view" sizes={SIZES} loading="lazy" />,
  )

  it('offers AVIF, then WebP, each with the sizes the browser needs to choose a copy', () => {
    const sources = html.match(/<source [^>]*>/g) ?? []
    expect(sources).toHaveLength(2)
    expect(sources[0]).toContain('type="image/avif"')
    expect(sources[1]).toContain('type="image/webp"')
    for (const source of sources) {
      expect(source).toContain(`sizes="${SIZES}"`)
      expect(source).toContain('/assets/img/photo-abcd1234-960.')
    }
  })

  it('keeps the original as the fallback, with its natural size so the page does not jump', () => {
    expect(html).toContain('src="/assets/photo.jpg"')
    expect(html).toContain('width="1600"')
    expect(html).toContain('height="1000"')
    expect(html).toContain('alt="The view"')
    expect(html).toContain('loading="lazy"')
  })

  it('is a plain <img> for a photo without copies', () => {
    const plain = renderToStaticMarkup(<Picture src="/assets/other.jpg" alt="" sizes={SIZES} />)
    expect(plain).not.toContain('<picture')
    expect(plain).toContain('src="/assets/other.jpg"')
  })
})
