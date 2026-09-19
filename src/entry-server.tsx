import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { LanguageProvider } from './i18n/LanguageContext'
import { langFromPath, localizePath, stripLang, type Lang } from './i18n/paths'
import { PAGE_PATHS, SITE_URL, alternatesFor, getPageHead, type PageHead } from './seo/meta'

export { PAGE_PATHS, SITE_URL, alternatesFor, localizePath }
export type { Lang }

/** Server entry used by scripts/prerender.mjs: renders one URL to an HTML string. */
export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </StaticRouter>
    </StrictMode>,
  )
}

export function getHead(url: string): PageHead & { lang: Lang } {
  const lang = langFromPath(url)
  return { lang, ...getPageHead(stripLang(url), lang) }
}
