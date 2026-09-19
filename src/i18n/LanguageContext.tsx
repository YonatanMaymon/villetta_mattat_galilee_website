import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { STRINGS, type Strings } from './strings'
import { DATA, type SiteData } from './data'
import { langFromPath, localizePath, otherLang, stripLang, type Lang } from './paths'

export type { Lang } from './paths'
type Dir = 'rtl' | 'ltr'

const DIRECTIONS: Record<Lang, Dir> = { he: 'rtl', en: 'ltr' }

interface LanguageValue {
  lang: Lang
  dir: Dir
  t: Strings
  data: SiteData
  /** Adds the `/en` prefix when the site is English: `localize('/gallery')`. */
  localize: (path: string) => string
  /** The current page (with query and hash) in the other language. */
  otherLangPath: string
}

const LanguageContext = createContext<LanguageValue | null>(null)

/** The language comes from the URL: `/en/...` is English, everything else Hebrew. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { pathname, search, hash } = useLocation()
  const lang = langFromPath(pathname)
  const dir = DIRECTIONS[lang]

  // The prerendered HTML already carries lang/dir; this keeps them right after client-side navigation.
  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = dir
  }, [lang, dir])

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      dir,
      t: STRINGS[lang],
      data: DATA[lang],
      localize: (path) => localizePath(path, lang),
      otherLangPath: localizePath(stripLang(pathname), otherLang(lang)) + search + hash,
    }),
    [lang, dir, pathname, search, hash],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return value
}
