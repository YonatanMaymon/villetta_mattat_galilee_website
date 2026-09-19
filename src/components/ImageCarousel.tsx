import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { SliderImage } from '../data/types'

interface ImageCarouselProps {
  images: SliderImage[]
  intervalMs: number
  label: string
}

const GAP_PX = 56
const TRANSITION_MS = 500

/** 3 slides per view on tablet/desktop, 1 on phones. */
function usePerView() {
  const [perView, setPerView] = useState(() => (window.matchMedia('(max-width: 639px)').matches ? 1 : 3))
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const onChange = () => setPerView(mq.matches ? 1 : 3)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return perView
}

const arrowClass =
  'absolute top-1/2 z-10 -translate-y-1/2 cursor-pointer p-1 text-black transition hover:scale-110'

/**
 * Infinite multi-slide carousel. The track holds the images plus a copy of the first
 * `perView` ones; after sliding onto the copies it snaps back to the start without animating.
 */
export default function ImageCarousel({ images, intervalMs, label }: ImageCarouselProps) {
  const perView = usePerView()
  const count = images.length
  const track = [...images, ...images.slice(0, perView)]

  const [index, setIndex] = useState(0)
  const [animate, setAnimate] = useState(true)
  const snapping = useRef(false)

  // Jump without animation, then restore animation on the next frames.
  const jumpTo = useCallback((to: number, thenMoveTo?: number) => {
    snapping.current = true
    setAnimate(false)
    setIndex(to)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimate(true)
        if (thenMoveTo !== undefined) setIndex(thenMoveTo)
        snapping.current = false
      }),
    )
  }, [])

  const next = useCallback(() => {
    if (!snapping.current) setIndex((i) => i + 1)
  }, [])
  const prev = () => {
    if (snapping.current) return
    if (index === 0) jumpTo(count, count - 1)
    else setIndex(index - 1)
  }

  const onTransitionEnd = () => {
    if (index >= count) jumpTo(0)
  }

  useEffect(() => {
    const id = window.setInterval(next, intervalMs)
    return () => window.clearInterval(id)
  }, [index, intervalMs, next])

  return (
    <div
      dir="ltr"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="relative mx-auto max-w-[1640px]"
    >
      <div className="overflow-hidden">
        <div
          className="flex"
          onTransitionEnd={onTransitionEnd}
          style={{
            gap: GAP_PX,
            transform: `translateX(calc(${index} * -1 * (100% + ${GAP_PX}px) / ${perView}))`,
            transition: animate ? `transform ${TRANSITION_MS}ms ease` : 'none',
          }}
        >
          {track.map((img, i) => (
            <div
              key={`${img.src}-${i}`}
              className="shrink-0 border border-neutral-200 bg-white p-[2px]"
              style={{ width: `calc((100% - ${(perView - 1) * GAP_PX}px) / ${perView})` }}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                draggable={false}
                className="aspect-[10/7] w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="הקודם"
        className={`${arrowClass} -left-8 max-sm:left-1 max-sm:text-white max-sm:drop-shadow`}
      >
        <ChevronLeft size={26} strokeWidth={1.25} />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="הבא"
        className={`${arrowClass} -right-8 max-sm:right-1 max-sm:text-white max-sm:drop-shadow`}
      >
        <ChevronRight size={26} strokeWidth={1.25} />
      </button>
    </div>
  )
}
