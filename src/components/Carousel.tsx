import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

export interface Breakpoint {
  /** Viewport width (px) from which `perView` applies. First entry should be 0. */
  minWidth: number
  perView: number
}

interface CarouselProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  breakpoints: Breakpoint[]
  gap: number
  /** 'rtl' lays the first item on the right and advances leftwards. */
  dir?: 'ltr' | 'rtl'
  /** Autoplay delay; omit to disable. */
  intervalMs?: number
  label: string
  arrowStyle?: 'chevron' | 'arrow'
  /** How far (px) the arrows sit outside the track on wide screens. */
  arrowOutset?: number
  mobileArrows?: 'overlay' | 'outside'
  /** Called with the logical (wrapped) index of the first visible item. */
  onIndexChange?: (index: number) => void
}

const TRANSITION_MS = 500

function usePerView(breakpoints: Breakpoint[]) {
  const read = useCallback(() => {
    const width = window.innerWidth
    let perView = breakpoints[0].perView
    for (const bp of breakpoints) if (width >= bp.minWidth) perView = bp.perView
    return perView
  }, [breakpoints])

  // No window on the server: start from the smallest layout and read the real width before paint.
  const [perView, setPerView] = useState(breakpoints[0].perView)
  useLayoutEffect(() => {
    setPerView(read())
    const onResize = () => setPerView(read())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [read])
  return perView
}

const arrowBase =
  'absolute top-1/2 z-10 -translate-y-1/2 cursor-pointer p-1 text-black transition hover:scale-110'
// 'overlay': on phones the arrows move onto the content in white (for photo slides).
// 'outside': they stay in the side margin, dark (for cards on a white background).
const arrowClasses = {
  overlay: {
    left: `${arrowBase} -left-[var(--outset)] max-sm:left-1 max-sm:text-white max-sm:drop-shadow`,
    right: `${arrowBase} -right-[var(--outset)] max-sm:right-1 max-sm:text-white max-sm:drop-shadow`,
  },
  outside: {
    left: `${arrowBase} -left-[var(--outset)] max-sm:-left-[34px]`,
    right: `${arrowBase} -right-[var(--outset)] max-sm:-right-[34px]`,
  },
}

/**
 * Infinite multi-slide carousel. The track holds the items plus a copy of the first
 * `perView` ones; after sliding onto the copies it snaps back to the start without animating.
 */
export default function Carousel<T>({
  items,
  renderItem,
  breakpoints,
  gap,
  dir = 'ltr',
  intervalMs,
  label,
  arrowStyle = 'chevron',
  arrowOutset = 32,
  mobileArrows = 'overlay',
  onIndexChange,
}: CarouselProps<T>) {
  const { t } = useLanguage()
  const perView = usePerView(breakpoints)
  const count = items.length
  const track = [...items, ...items.slice(0, perView)]

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
    if (!intervalMs) return
    const id = window.setInterval(next, intervalMs)
    return () => window.clearInterval(id)
  }, [index, intervalMs, next])

  useEffect(() => {
    onIndexChange?.(index % count)
  }, [index, count, onIndexChange])

  // In RTL the track starts on the right, so advancing shifts it towards +x.
  const sign = dir === 'rtl' ? 1 : -1
  const rtl = dir === 'rtl'
  const NextIcon = arrowStyle === 'arrow' ? (rtl ? ArrowLeft : ArrowRight) : rtl ? ChevronLeft : ChevronRight
  const PrevIcon = arrowStyle === 'arrow' ? (rtl ? ArrowRight : ArrowLeft) : rtl ? ChevronRight : ChevronLeft
  const iconProps = { size: arrowStyle === 'arrow' ? 24 : 26, strokeWidth: 1.25 }

  // Physical sides: the button on the left goes "forward" in RTL, "back" in LTR.
  const leftButton = rtl
    ? { onClick: next, label: t.next, Icon: NextIcon }
    : { onClick: prev, label: t.previous, Icon: PrevIcon }
  const rightButton = rtl
    ? { onClick: prev, label: t.previous, Icon: PrevIcon }
    : { onClick: next, label: t.next, Icon: NextIcon }

  return (
    <div
      dir={dir}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="relative mx-auto"
      style={{ '--outset': `${arrowOutset}px` } as CSSProperties}
    >
      <div className="overflow-hidden">
        <div
          className="flex"
          onTransitionEnd={onTransitionEnd}
          style={{
            gap,
            transform: `translateX(calc(${sign * index} * (100% + ${gap}px) / ${perView}))`,
            transition: animate ? `transform ${TRANSITION_MS}ms ease` : 'none',
          }}
        >
          {track.map((item, i) => (
            <div
              key={i}
              className="shrink-0"
              style={{ width: `calc((100% - ${(perView - 1) * gap}px) / ${perView})` }}
            >
              {renderItem(item, i % count)}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={leftButton.onClick}
        aria-label={leftButton.label}
        className={arrowClasses[mobileArrows].left}
      >
        <leftButton.Icon {...iconProps} />
      </button>
      <button
        type="button"
        onClick={rightButton.onClick}
        aria-label={rightButton.label}
        className={arrowClasses[mobileArrows].right}
      >
        <rightButton.Icon {...iconProps} />
      </button>
    </div>
  )
}
