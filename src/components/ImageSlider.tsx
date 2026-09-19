import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { SliderImage } from '../data/types'

interface ImageSliderProps {
  images: SliderImage[]
  intervalMs: number
  label: string
  /** Tailwind aspect-ratio class for the frame. */
  aspectClassName?: string
}

const arrowClass =
  'absolute top-1/2 z-10 -translate-y-1/2 cursor-pointer p-2 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] transition hover:scale-110'

/** Cross-fading image slider with arrows, autoplay and pause on hover. */
export default function ImageSlider({
  images,
  intervalMs,
  label,
  aspectClassName = 'aspect-[10/7]',
}: ImageSliderProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = images.length

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count)

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), intervalMs)
    return () => window.clearInterval(id)
  }, [paused, index, count, intervalMs])

  return (
    <div
      dir="ltr"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={`relative w-full overflow-hidden bg-neutral-200 ${aspectClassName}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          loading={i === 0 ? 'eager' : 'lazy'}
          aria-hidden={i !== index}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <button type="button" onClick={() => go(-1)} aria-label="הקודם" className={`${arrowClass} left-2`}>
        <ChevronLeft size={32} strokeWidth={1.25} />
      </button>
      <button type="button" onClick={() => go(1)} aria-label="הבא" className={`${arrowClass} right-2`}>
        <ChevronRight size={32} strokeWidth={1.25} />
      </button>
    </div>
  )
}
