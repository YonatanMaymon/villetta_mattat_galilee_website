import { useEffect, useState } from 'react'

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * True when the visitor has asked their device for less motion. Starts false, as on the server, so the
 * first render matches the prerendered HTML; the real setting is read once mounted.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY)
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}
