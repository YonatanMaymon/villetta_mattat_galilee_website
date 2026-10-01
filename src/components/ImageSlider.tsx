import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AutoplayToggle from './AutoplayToggle'
import Picture from './Picture'
import type { SliderImage } from '../data/types'
import { useAutoplay } from '../hooks/useAutoplay'
import { useLanguage } from '../i18n/LanguageContext'

interface ImageSliderProps {
  images: SliderImage[]
  intervalMs: number
  label: string
  /** Tailwind aspect-ratio class for the frame. */
  aspectClassName?: string
  /** How wide the slider is drawn, for picking a photo size; by default half the screen on wide ones. */
  sizes?: string
}

const arrowClass =
  'absolute top-1/2 z-10 -translate-y-1/2 cursor-pointer p-2 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] transition hover:scale-110'

/** Cross-fading image slider with arrows, autoplay, and a pause button. */
export default function ImageSlider({
  images,
  intervalMs,
  label,
  aspectClassName = 'aspect-[10/7]',
  sizes = '(min-width: 1024px) 50vw, 100vw',
}: ImageSliderProps) {
  const { t } = useLanguage()
  const [index, setIndex] = useState(0)
  const count = images.length

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count)
  const autoplay = useAutoplay(intervalMs, () => go(1), index)

  return (
    <div
      dir="ltr"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={`relative w-full overflow-hidden bg-neutral-200 ${aspectClassName}`}
      {...autoplay.regionProps}
    >
      {images.map((img, i) => (
        <Picture
          key={img.src}
          src={img.src}
          alt={img.alt}
          sizes={sizes}
          loading={i === 0 ? 'eager' : 'lazy'}
          aria-hidden={i !== index}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <button type="button" onClick={() => go(-1)} aria-label={t.previous} className={`${arrowClass} left-2`}>
        <ChevronLeft size={32} strokeWidth={1.25} />
      </button>
      <button type="button" onClick={() => go(1)} aria-label={t.next} className={`${arrowClass} right-2`}>
        <ChevronRight size={32} strokeWidth={1.25} />
      </button>
      <AutoplayToggle
        playing={autoplay.playing}
        onToggle={autoplay.toggle}
        className="absolute bottom-3 end-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/70"
      />
    </div>
  )
}
