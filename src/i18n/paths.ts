export type Lang = 'he' | 'en'

const EN_PREFIX = '/en'

/** Removes a trailing slash (static hosts may serve `/en/gallery/`), keeping the root as `/`. */
function trimSlash(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

export function langFromPath(pathname: string): Lang {
  const path = trimSlash(pathname)
  return path === EN_PREFIX || path.startsWith(`${EN_PREFIX}/`) ? 'en' : 'he'
}

/** `/en/gallery` -> `/gallery`, `/en` -> `/`; Hebrew paths are returned as they are. */
export function stripLang(pathname: string): string {
  const path = trimSlash(pathname)
  if (langFromPath(path) === 'he') return path
  return path.slice(EN_PREFIX.length) || '/'
}

/** Hebrew lives at the site root, English under `/en`. Expects a language-neutral path (`/gallery`). */
export function localizePath(path: string, lang: Lang): string {
  if (lang === 'he') return path
  return path === '/' ? EN_PREFIX : `${EN_PREFIX}${path}`
}

export const otherLang = (lang: Lang): Lang => (lang === 'he' ? 'en' : 'he')
