import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

interface LightboxProps {
  images: { src: string; alt: string }[]
  /** Index of the open image, or null when closed. */
  index: number | null
  onChange: (index: number | null) => void
}

const arrowClass =
  'absolute top-1/2 -translate-y-1/2 cursor-pointer p-2 text-white/80 transition hover:text-white'

export default function Lightbox({ images, index, onChange }: LightboxProps) {
  const { t, dir } = useLanguage()
  const count = images.length
  const rtl = dir === 'rtl'

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null)
      // Keys follow the on-screen arrows: in RTL the left arrow goes forward, in LTR the right one.
      else if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) onChange((index + 1) % count)
      else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) onChange((index - 1 + count) % count)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [index, count, rtl, onChange])

  if (index === null) return null
  const image = images[index]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.enlargedImage}
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
        aria-label={t.close}
        onClick={() => onChange(null)}
        className="absolute end-3 top-3 cursor-pointer p-2 text-white/80 transition hover:text-white"
      >
        <X size={30} strokeWidth={1.25} />
      </button>
      <button
        type="button"
        aria-label={rtl ? t.next : t.previous}
        onClick={(e) => {
          e.stopPropagation()
          onChange(rtl ? (index + 1) % count : (index - 1 + count) % count)
        }}
        className={`${arrowClass} left-2`}
      >
        <ChevronLeft size={40} strokeWidth={1} />
      </button>
      <button
        type="button"
        aria-label={rtl ? t.previous : t.next}
        onClick={(e) => {
          e.stopPropagation()
          onChange(rtl ? (index - 1 + count) % count : (index + 1) % count)
        }}
        className={`${arrowClass} right-2`}
      >
        <ChevronRight size={40} strokeWidth={1} />
      </button>
    </div>
  )
}
