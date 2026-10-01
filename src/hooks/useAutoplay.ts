import { useEffect, useRef, useState, type FocusEvent } from 'react'
import { useReducedMotion } from './useReducedMotion'

/** Put on the pause/play button: focusing it doesn't count as reading the slides. */
export const AUTOPLAY_TOGGLE_ATTR = 'data-autoplay-toggle'

/**
 * Timed advance for carousels and sliders. Motion that goes on for more than five seconds needs a way to
 * stop it (WCAG 2.2.2), so the caller shows a pause/play button wired to `toggle`. It also holds still
 * while the pointer is over it or keyboard focus is inside it, and starts paused for visitors who asked
 * their device for reduced motion.
 *
 * `resetKey` restarts the wait whenever it changes (pass the current slide), so a slide the visitor has
 * just moved to gets the full interval.
 */
export function useAutoplay(intervalMs: number | undefined, advance: () => void, resetKey?: unknown) {
  const reducedMotion = useReducedMotion()
  // null: nobody pressed the button yet, so follow the device setting.
  const [choice, setChoice] = useState<boolean | null>(null)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  const enabled = Boolean(intervalMs)
  const playing = choice ?? !reducedMotion
  const running = enabled && playing && !hovered && !focused

  // The interval calls whatever `advance` is current, without restarting on every render.
  const advanceRef = useRef(advance)
  useEffect(() => {
    advanceRef.current = advance
  })

  useEffect(() => {
    if (!running || !intervalMs) return
    const id = window.setInterval(() => advanceRef.current(), intervalMs)
    return () => window.clearInterval(id)
  }, [running, intervalMs, resetKey])

  return {
    enabled,
    playing,
    toggle: () => setChoice(!playing),
    /** Spread on the carousel's outer element. */
    regionProps: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      // Only keyboard focus pauses: a mouse click on an arrow already pauses through hover, and would
      // otherwise keep the slides still after the pointer has left.
      onFocus: (e: FocusEvent<HTMLElement>) =>
        setFocused(e.target.matches(':focus-visible') && !e.target.hasAttribute(AUTOPLAY_TOGGLE_ATTR)),
      onBlur: (e: FocusEvent<HTMLElement>) => {
        if (!(e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget))) setFocused(false)
      },
    },
  }
}
