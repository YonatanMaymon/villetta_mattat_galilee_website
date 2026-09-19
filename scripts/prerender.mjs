// Turns the client build into static HTML: one file per page and language, with the rendered
// content and SEO tags already inside. Also writes sitemap.xml, robots.txt and 404.html.
// Runs after `vite build` and `vite build --ssr` (see the "build" script in package.json).
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const DIST = 'dist'
const SSR_ENTRY = path.resolve('dist-ssr', 'entry-server.js')

const { render, getHead, PAGE_PATHS, SITE_URL, alternatesFor, localizePath } = await import(
  pathToFileURL(SSR_ENTRY).href
)

if (SITE_URL === 'https://example.com') {
  console.warn('! VITE_SITE_URL is not set: canonical, hreflang and sitemap URLs use https://example.com')
}

const template = await readFile(path.join(DIST, 'index.html'), 'utf8')

const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const headTag = ({ tag, attrs }) =>
  `<${tag} ${Object.entries(attrs)
    .map(([name, value]) => `${name}="${escapeHtml(value)}"`)
    .join(' ')} data-seo>`

// Replacers are functions so `$` sequences in the content are never treated as patterns.
function buildPage(url) {
  const { lang, title, tags } = getHead(url)
  const dir = lang === 'he' ? 'rtl' : 'ltr'
  const html = template
    .replace(/<html[^>]*>/, () => `<html lang="${lang}" dir="${dir}">`)
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeHtml(title)}</title>`)
    .replace('</head>', () => `    ${tags.map(headTag).join('\n    ')}\n  </head>`)
    .replace('<div id="root"></div>', () => `<div id="root">${render(url)}</div>`)
  if (!html.includes('<div id="root"><')) throw new Error(`Prerender produced no content for ${url}`)
  return html
}

async function write(file, contents) {
  const target = path.join(DIST, file)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, contents)
  console.log(`  ${file}`)
}

const urls = PAGE_PATHS.flatMap((page) => [localizePath(page, 'he'), localizePath(page, 'en')])

console.log(`Prerendering ${urls.length} pages + 404:`)
for (const url of urls) {
  await write(url === '/' ? 'index.html' : `${url.slice(1)}/index.html`, buildPage(url))
}
// Any URL that matches no page renders the not-found page (with a noindex tag).
await write('404.html', buildPage('/page-not-found'))

const sitemapEntries = PAGE_PATHS.flatMap((page) => {
  const alternates = alternatesFor(page)
    .map(({ hreflang, href }) => `      <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`)
    .join('\n')
  return ['he', 'en'].map((lang) => {
    const loc = alternates && alternatesFor(page).find((a) => a.hreflang === lang).href
    return `  <url>\n    <loc>${loc}</loc>\n${alternates}\n  </url>`
  })
})

await write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemapEntries.join('\n')}\n</urlset>\n`,
)
await write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
