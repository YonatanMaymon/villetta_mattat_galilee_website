import { useCallback, useEffect, useState } from 'react'
import { fetchAvailability } from '../lib/api'

type Availability =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; busy: ReadonlySet<string>; canBook: boolean }

/** Loads the booked nights each time `active` turns true (the booking modal opens). */
export function useAvailability(active: boolean) {
  const [state, setState] = useState<Availability>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!active) return
    const controller = new AbortController()
    setState({ status: 'loading' })
    fetchAvailability({ signal: controller.signal })
      .then((data) => setState({ status: 'ready', busy: new Set(data.busyNights), canBook: data.canBook }))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setState({ status: 'error' })
      })
    return () => controller.abort()
  }, [active, attempt])

  /** Fetches again. */
  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  return { ...state, reload }
}
