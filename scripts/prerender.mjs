// Turns the client build into static HTML: one file per page and language, with the rendered
// content and SEO tags already inside. Also writes sitemap.xml, robots.txt, 404.html, and the
// Cloudflare _redirects and _headers files.
// Runs after `vite build` and `vite build --ssr` (see the "build" script in package.json).
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const DIST = 'dist'
const SSR_ENTRY = path.resolve('dist-ssr', 'entry-server.js')

const { render, getHead, PAGE_PATHS, SITE_URL, alternatesFor, localizePath, imageCount } = await import(
  pathToFileURL(SSR_ENTRY).href
)

// Without it every canonical, hreflang and sitemap URL would tell Google the site is example.com.
if (SITE_URL === 'https://example.com') {
  throw new Error('VITE_SITE_URL is not set (see .env.production)')
}
// Without the manifest every page would quietly fall back to the full-size photos.
if (imageCount === 0) {
  throw new Error('No resized photos: run `node scripts/images.mjs` (the prebuild script does)')
}

const template = await readFile(path.join(DIST, 'index.html'), 'utf8')

const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// A script tag (the JSON-LD) carries its contents in `text`, already safe to inline (see src/seo/meta.ts).
const headTag = ({ tag, attrs, text }) => {
  const open = `<${tag} ${Object.entries(attrs)
    .map(([name, value]) => `${name}="${escapeHtml(value)}"`)
    .join(' ')} data-seo>`
  return text === undefined ? open : `${open}${text}</${tag}>`
}

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

// Cloudflare applies these before serving files. Its own trailing-slash handling answers 307 (temporary);
// a permanent 301 tells search engines that `/villetta/` and `/villetta` are one page, the one without.
const slashRedirects = urls.filter((url) => url !== '/').map((url) => [`${url}/`, url])

// The press page's address before the redesign. Articles about the villa may still link to it; the
// redirect keeps those visitors, and the credit Google gives for the links. Can go once Google has
// long since dropped the old address (well into 2027).
const movedPages = [
  ['/כתבו-עלינו/', '/written-about-us'],
  ['/כתבו-עלינו', '/written-about-us'],
]

await write(
  '_redirects',
  [...slashRedirects, ...movedPages].map(([from, to]) => `${from} ${to} 301`).join('\n') + '\n',
)

// The resized photos (scripts/images.mjs) never change under the same name, since each name carries a hash
// of its original, so browsers may keep them for a year without asking again.
await write('_headers', '/assets/img/*\n  Cache-Control: public, max-age=31536000, immutable\n')
