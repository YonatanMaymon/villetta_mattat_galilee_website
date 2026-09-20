import { useEffect, useState } from 'react'
import { ApiRequestError, fetchQuote } from '../lib/api'

type QuoteState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; amount: number; currency: string }
  | { status: 'error'; code: ApiRequestError['code'] }

/** Asks the server for the price whenever both dates are chosen. Nothing is reserved by asking. */
export function useQuote(arrival: string | null, departure: string | null, enabled: boolean): QuoteState {
  const [state, setState] = useState<QuoteState>({ status: 'idle' })

  useEffect(() => {
    if (!enabled || !arrival || !departure) {
      setState({ status: 'idle' })
      return
    }
    const controller = new AbortController()
    setState({ status: 'loading' })
    fetchQuote(arrival, departure, controller.signal)
      .then((quote) => setState({ status: 'ready', amount: quote.amount, currency: quote.currency }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setState({ status: 'error', code: error instanceof ApiRequestError ? error.code : 'network' })
      })
    return () => controller.abort()
  }, [enabled, arrival, departure])

  return state
}
