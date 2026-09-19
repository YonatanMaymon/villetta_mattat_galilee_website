import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface LightboxProps {
  images: { src: string; alt: string }[]
  /** Index of the open image, or null when closed. */
  index: number | null
  onChange: (index: number | null) => void
}

const arrowClass =
  'absolute top-1/2 -translate-y-1/2 cursor-pointer p-2 text-white/80 transition hover:text-white'

export default function Lightbox({ images, index, onChange }: LightboxProps) {
  const count = images.length

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null)
      // The page is RTL: ArrowLeft goes forward, like the on-screen left arrow.
      else if (e.key === 'ArrowLeft') onChange((index + 1) % count)
      else if (e.key === 'ArrowRight') onChange((index - 1 + count) % count)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [index, count, onChange])

  if (index === null) return null
  const image = images[index]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="תמונה מוגדלת"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-14"
      onClick={() => onChange(null)}
    >
      <img
        src={image.src}
        alt={image.alt}
        className="max-h-full max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        type="button"
        aria-label="סגירה"
        onClick={() => onChange(null)}
        className="absolute end-3 top-3 cursor-pointer p-2 text-white/80 transition hover:text-white"
      >
        <X size={30} strokeWidth={1.25} />
      </button>
      <button
        type="button"
        aria-label="הבא"
        onClick={(e) => {
          e.stopPropagation()
          onChange((index + 1) % count)
        }}
        className={`${arrowClass} left-2`}
      >
        <ChevronLeft size={40} strokeWidth={1} />
      </button>
      <button
        type="button"
        aria-label="הקודם"
        onClick={(e) => {
          e.stopPropagation()
          onChange((index - 1 + count) % count)
        }}
        className={`${arrowClass} right-2`}
      >
        <ChevronRight size={40} strokeWidth={1} />
      </button>
    </div>
  )
}
