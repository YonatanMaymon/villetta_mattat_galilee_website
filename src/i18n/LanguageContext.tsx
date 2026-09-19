import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { STRINGS, type Strings } from './strings'
import { DATA, type SiteData } from './data'

export type Lang = 'he' | 'en'
type Dir = 'rtl' | 'ltr'

const STORAGE_KEY = 'villetta-lang'
const DIRECTIONS: Record<Lang, Dir> = { he: 'rtl', en: 'ltr' }
const TITLES: Record<Lang, string> = {
  he: 'VILLETTA - מתת גליל',
  en: 'VILLETTA - Mattat Galilee',
}

interface LanguageValue {
  lang: Lang
  dir: Dir
  t: Strings
  data: SiteData
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageValue | null>(null)

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'he' || stored === 'en') return stored
  } catch {
    // Storage can be blocked (private mode); fall back to the default.
  }
  return 'he'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readStoredLang)
  const dir = DIRECTIONS[lang]

  // Layout effect so the direction flips before paint (no RTL flash for English visitors).
  useLayoutEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = dir
    document.title = TITLES[lang]
  }, [lang, dir])

  const toggleLang = useCallback(() => {
    setLang((current) => {
      const next: Lang = current === 'he' ? 'en' : 'he'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // Not persisted; the choice still applies for this visit.
      }
      return next
    })
  }, [])

  const value = useMemo<LanguageValue>(
    () => ({ lang, dir, t: STRINGS[lang], data: DATA[lang], toggleLang }),
    [lang, dir, toggleLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return value
}
