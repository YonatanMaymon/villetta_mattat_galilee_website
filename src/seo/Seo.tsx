import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { stripLang } from '../i18n/paths'
import { getPageHead } from './meta'

/** Marks head tags this component owns, so the prerendered ones are replaced rather than duplicated. */
const SEO_ATTR = 'data-seo'

/**
 * Keeps the document title and SEO tags in step with client-side navigation. The prerender step
 * writes the same tags (from `getPageHead`) into the static HTML for crawlers.
 */
export default function Seo() {
  const { pathname } = useLocation()
  const { lang } = useLanguage()

  useEffect(() => {
    const { title, tags } = getPageHead(stripLang(pathname), lang)
    document.title = title

    document.head.querySelectorAll(`[${SEO_ATTR}]`).forEach((node) => node.remove())
    for (const { tag, attrs } of tags) {
      const node = document.createElement(tag)
      for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value)
      node.setAttribute(SEO_ATTR, '')
      document.head.appendChild(node)
    }
  }, [pathname, lang])

  return null
}
