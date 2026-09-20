import { useEffect, useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let scriptPromise: Promise<void> | undefined

/** Loads Cloudflare's script once per page, however many widgets ask for it. */
function loadScript(): Promise<void> {
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    if (window.turnstile) return resolve()
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      // Let a later attempt retry rather than caching the failure forever.
      scriptPromise = undefined
      reject(new Error('Turnstile script failed to load'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

interface TurnstileProps {
  /** Called with a token once the visitor passes, and with null when it expires or errors. */
  onToken: (token: string | null) => void
}

/**
 * The bot check on the confirm step. Usually invisible: most visitors see a brief box and never
 * interact with it.
 *
 * With no VITE_TURNSTILE_SITE_KEY (local development) it renders nothing and reports a null token; the
 * API skips the check in that case too, so the flow still works end to end.
 */
export default function Turnstile({ onToken }: TurnstileProps) {
  const { lang } = useLanguage()
  const holder = useRef<HTMLDivElement>(null)
  // Kept in a ref so re-renders from a new token do not tear down and rebuild the widget.
  const report = useRef(onToken)
  report.current = onToken

  useEffect(() => {
    if (!SITE_KEY || !holder.current) return
    const el = holder.current
    let widgetId: string | undefined
    let cancelled = false

    loadScript()
      .then(() => {
        if (cancelled || !window.turnstile) return
        widgetId = window.turnstile.render(el, {
          sitekey: SITE_KEY,
          language: lang,
          callback: (token: string) => report.current(token),
          'expired-callback': () => report.current(null),
          'error-callback': () => report.current(null),
        })
      })
      .catch(() => report.current(null))

    return () => {
      cancelled = true
      if (widgetId) window.turnstile?.remove(widgetId)
    }
  }, [lang])

  if (!SITE_KEY) return null
  return <div ref={holder} className="flex justify-center" />
}
