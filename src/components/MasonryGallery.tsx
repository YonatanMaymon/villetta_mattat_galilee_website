import { useEffect, useMemo, useState } from 'react'
import Lightbox from './Lightbox'
import type { GalleryPhoto } from '../data/gallery'
import { useLanguage } from '../i18n/LanguageContext'

interface MasonryGalleryProps {
  photos: GalleryPhoto[]
}

function readColumnCount() {
  return window.innerWidth >= 1024 ? 3 : window.innerWidth >= 560 ? 2 : 1
}

function useColumnCount() {
  const [count, setCount] = useState(readColumnCount)
  useEffect(() => {
    const onResize = () => setCount(readColumnCount())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return count
}

/**
 * Masonry: photos keep their reading order, each going to the currently shortest column
 * (the first column is at the start side). Click opens a lightbox.
 */
export default function MasonryGallery({ photos }: MasonryGalleryProps) {
  const {
    t,
    data: {
      gallery: { GALLERY_ALT },
    },
  } = useLanguage()
  const columnCount = useColumnCount()
  const [open, setOpen] = useState<number | null>(null)

  const columns = useMemo(() => {
    const cols: { index: number; photo: GalleryPhoto }[][] = Array.from({ length: columnCount }, () => [])
    const heights = new Array<number>(columnCount).fill(0)
    photos.forEach((photo, index) => {
      const shortest = heights.indexOf(Math.min(...heights))
      cols[shortest].push({ index, photo })
      heights[shortest] += photo.height / photo.width
    })
    return cols
  }, [photos, columnCount])

  const lightboxImages = useMemo(
    () => photos.map((p) => ({ src: p.src, alt: GALLERY_ALT })),
    [photos, GALLERY_ALT],
  )

  return (
    <>
      <div className="flex items-start gap-6 sm:gap-[50px]">
        {columns.map((col, c) => (
          <div key={c} className="flex min-w-0 flex-1 flex-col gap-6 sm:gap-[50px]">
            {col.map(({ index, photo }) => (
              <button
                key={photo.src}
                type="button"
                onClick={() => setOpen(index)}
                aria-label={t.enlargeImageN(index + 1)}
                className="block cursor-zoom-in overflow-hidden"
              >
                <img
                  src={photo.src}
                  alt={GALLERY_ALT}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  className="h-auto w-full transition-transform duration-500 hover:scale-105"
                />
              </button>
            ))}
          </div>
        ))}
      </div>
      <Lightbox images={lightboxImages} index={open} onChange={setOpen} />
    </>
  )
}
