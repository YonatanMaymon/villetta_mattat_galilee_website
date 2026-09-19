import { DATA } from '../i18n/data'
import { localizePath, type Lang } from '../i18n/paths'

/** Production origin, set with VITE_SITE_URL at build time (see .env.example). */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://example.com').replace(/\/$/, '')

const LANGS: Lang[] = ['he', 'en']
const OG_LOCALES: Record<Lang, string> = { he: 'he_IL', en: 'en_US' }
const SITE_NAMES: Record<Lang, string> = { he: 'וילטה מתת גליל', en: 'Villetta Mattat Galilee' }
const HOME_TITLES: Record<Lang, string> = { he: 'VILLETTA - מתת גליל', en: 'VILLETTA - Mattat Galilee' }
const NOT_FOUND_TITLES: Record<Lang, string> = { he: 'העמוד לא נמצא', en: 'Page not found' }

/** Language-neutral paths of every real page; also what the prerender step generates. */
export const PAGE_PATHS = DATA.he.content.NAV_LINKS.map((link) => link.href)

interface PageCopy {
  title: string
  description: string
  image: string
}

function pageCopy(path: string, lang: Lang): PageCopy | null {
  const { area, contact, content, food, gallery, ourStory, press, price, villetta } = DATA[lang]
  const hero = (h: { title: string; subtitle: string; image: string }): PageCopy => ({
    title: `${h.title} | ${SITE_NAMES[lang]}`,
    description: h.subtitle,
    image: h.image,
  })

  switch (path) {
    case '/':
      return { title: HOME_TITLES[lang], description: content.STORY.lead, image: '/assets/hero-jacuzzi.jpg' }
    case '/our-story':
      return hero(ourStory.OUR_STORY_HERO)
    case '/villetta':
      return hero(villetta.VILLETTA_HERO)
    case '/culinary':
      return hero(food.FOOD_HERO)
    case '/the-area':
      return hero(area.AREA_HERO)
    case '/gallery':
      return hero(gallery.GALLERY_HERO)
    case '/written-about-us':
      return hero(press.PRESS_HERO)
    case '/price':
      return hero(price.PRICE_HERO)
    case '/contact':
      return hero(contact.CONTACT_HERO)
    default:
      return null
  }
}

export interface HeadTag {
  tag: 'meta' | 'link'
  attrs: Record<string, string>
}

export interface PageHead {
  title: string
  tags: HeadTag[]
}

/** Absolute `hreflang` alternates for a language-neutral path (Hebrew doubles as `x-default`). */
export function alternatesFor(path: string): { hreflang: string; href: string }[] {
  const url = (lang: Lang) => SITE_URL + localizePath(path, lang)
  return [...LANGS.map((lang) => ({ hreflang: lang, href: url(lang) })), { hreflang: 'x-default', href: url('he') }]
}

/** Title and head tags for a language-neutral path. Unknown paths get a noindex "not found" head. */
export function getPageHead(path: string, lang: Lang): PageHead {
  const copy = pageCopy(path, lang)

  if (!copy) {
    const title = `${NOT_FOUND_TITLES[lang]} | ${SITE_NAMES[lang]}`
    return { title, tags: [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } }] }
  }

  const canonical = SITE_URL + localizePath(path, lang)
  const meta = (attrs: Record<string, string>): HeadTag => ({ tag: 'meta', attrs })

  return {
    title: copy.title,
    tags: [
      meta({ name: 'description', content: copy.description }),
      { tag: 'link', attrs: { rel: 'canonical', href: canonical } },
      ...alternatesFor(path).map(({ hreflang, href }): HeadTag => ({
        tag: 'link',
        attrs: { rel: 'alternate', hreflang, href },
      })),
      meta({ property: 'og:type', content: 'website' }),
      meta({ property: 'og:site_name', content: SITE_NAMES[lang] }),
      meta({ property: 'og:locale', content: OG_LOCALES[lang] }),
      meta({ property: 'og:title', content: copy.title }),
      meta({ property: 'og:description', content: copy.description }),
      meta({ property: 'og:url', content: canonical }),
      meta({ property: 'og:image', content: SITE_URL + copy.image }),
      meta({ name: 'twitter:card', content: 'summary_large_image' }),
    ],
  }
}
