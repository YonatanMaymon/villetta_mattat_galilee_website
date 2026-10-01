import type { PageSeo } from '../data/seo'
import { DATA } from '../i18n/data'
import { localizePath, type Lang } from '../i18n/paths'
import { STRINGS } from '../i18n/strings'

/** Production origin, set with VITE_SITE_URL at build time (see .env.example). */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://example.com').replace(/\/$/, '')

const LANGS: Lang[] = ['he', 'en']
const OG_LOCALES: Record<Lang, string> = { he: 'he_IL', en: 'en_US' }
const NOT_FOUND_TITLES: Record<Lang, string> = { he: 'העמוד לא נמצא', en: 'Page not found' }
const HOME_IMAGE = '/assets/hero-jacuzzi.jpg'

const { NAV_LINKS, FOOTER_LINKS } = DATA.he.content

/** Language-neutral paths of every real page, menu and footer; also what the prerender step generates. */
export const PAGE_PATHS = [...NAV_LINKS, ...FOOTER_LINKS].map((link) => link.href)

interface PageCopy extends PageSeo {
  image: string
}

function pageCopy(path: string, lang: Lang): PageCopy | null {
  const { area, contact, food, gallery, legal, ourStory, press, price, seo, villetta } = DATA[lang]
  const pages: Record<string, PageSeo> = seo.PAGE_SEO
  if (!Object.hasOwn(pages, path)) return null
  // Title and description are the SEO copy; the picture shown when the link is shared is the page's hero.
  const page = (image: string): PageCopy => ({ ...pages[path], image })

  switch (path) {
    case '/':
      return page(HOME_IMAGE)
    case '/our-story':
      return page(ourStory.OUR_STORY_HERO.image)
    case '/villetta':
      return page(villetta.VILLETTA_HERO.image)
    case '/culinary':
      return page(food.FOOD_HERO.image)
    case '/the-area':
      return page(area.AREA_HERO.image)
    case '/gallery':
      return page(gallery.GALLERY_HERO.image)
    case '/written-about-us':
      return page(press.PRESS_HERO.image)
    case '/price':
      return page(price.PRICE_HERO.image)
    case '/contact':
      return page(contact.CONTACT_HERO.image)
    case '/accessibility':
      return page(legal.ACCESSIBILITY.hero.image)
    case '/privacy':
      return page(legal.PRIVACY_POLICY.hero.image)
    default:
      return null
  }
}

/**
 * The business facts Google reads (schema.org JSON-LD), for the home pages. Built from the site's own data so
 * it never disagrees with the pages. No ratings from the testimonials: Google treats reviews a business
 * publishes about itself as spam; stars come from its Business Profile.
 */
function structuredData(lang: Lang) {
  const { contact, content, food, gallery, price, seo } = DATA[lang]
  const { money } = STRINGS[lang]
  const nights = price.PRICE_NIGHTS.map((night) => night.price)

  const business = {
    '@type': 'LodgingBusiness',
    '@id': `${SITE_URL}/#villetta`,
    name: seo.SITE_NAME,
    description: seo.PAGE_SEO['/'].description,
    url: SITE_URL + localizePath('/', lang),
    image: [HOME_IMAGE, gallery.GALLERY_HERO.image, food.FOOD_HERO.image].map((src) => SITE_URL + src),
    telephone: content.PHONE_HREF.replace('tel:', ''),
    email: contact.CONTACT_DETAILS.email.value,
    address: { '@type': 'PostalAddress', addressLocality: seo.LOCALITY, addressCountry: 'IL' },
    priceRange: `${money(Math.min(...nights))}–${money(Math.max(...nights))}`,
    sameAs: [content.SOCIALS.instagram, content.SOCIALS.facebook, content.SOCIALS.youtube],
  }

  // The name Google shows above each result. It reads it only from the root home page.
  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: DATA.he.seo.SITE_NAME,
    alternateName: DATA.en.seo.SITE_NAME,
    url: `${SITE_URL}/`,
  }

  return { '@context': 'https://schema.org', '@graph': lang === 'he' ? [website, business] : [business] }
}

/** JSON for inside a <script> tag: with no `<` in it, the text can't close the tag early. */
export const inlineJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')

export interface HeadTag {
  tag: 'meta' | 'link' | 'script'
  attrs: Record<string, string>
  /** A script tag's contents, already safe to place inside it. */
  text?: string
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
  const { SITE_NAME } = DATA[lang].seo

  if (!copy) {
    const title = `${NOT_FOUND_TITLES[lang]} | ${SITE_NAME}`
    return { title, tags: [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } }] }
  }

  const canonical = SITE_URL + localizePath(path, lang)
  const meta = (attrs: Record<string, string>): HeadTag => ({ tag: 'meta', attrs })

  const tags: HeadTag[] = [
    meta({ name: 'description', content: copy.description }),
    { tag: 'link', attrs: { rel: 'canonical', href: canonical } },
    ...alternatesFor(path).map(({ hreflang, href }): HeadTag => ({
      tag: 'link',
      attrs: { rel: 'alternate', hreflang, href },
    })),
    meta({ property: 'og:type', content: 'website' }),
    meta({ property: 'og:site_name', content: SITE_NAME }),
    meta({ property: 'og:locale', content: OG_LOCALES[lang] }),
    meta({ property: 'og:title', content: copy.title }),
    meta({ property: 'og:description', content: copy.description }),
    meta({ property: 'og:url', content: canonical }),
    meta({ property: 'og:image', content: SITE_URL + copy.image }),
    meta({ name: 'twitter:card', content: 'summary_large_image' }),
  ]
  if (path === '/') {
    tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, text: inlineJson(structuredData(lang)) })
  }

  return { title: copy.title, tags }
}
