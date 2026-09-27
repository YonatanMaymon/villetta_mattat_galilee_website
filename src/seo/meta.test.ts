import { describe, expect, it } from 'vitest'
import type { Lang } from '../i18n/paths'
import { PAGE_PATHS, getPageHead, inlineJson } from './meta'

const LANGS: Lang[] = ['he', 'en']

const descriptionOf = (path: string, lang: Lang) =>
  getPageHead(path, lang).tags.find((tag) => tag.attrs.name === 'description')?.attrs.content ?? ''

const scriptsOf = (path: string, lang: Lang) => getPageHead(path, lang).tags.filter((tag) => tag.tag === 'script')

const jsonLdTypes = (lang: Lang): string[] =>
  JSON.parse(scriptsOf('/', lang)[0]?.text ?? '{}')['@graph'].map((node: { '@type': string }) => node['@type'])

describe.each(LANGS)('page titles and descriptions (%s)', (lang) => {
  const titles = PAGE_PATHS.map((path) => getPageHead(path, lang).title)
  const descriptions = PAGE_PATHS.map((path) => descriptionOf(path, lang))

  it('fit in a Google result, which cuts longer ones short', () => {
    for (const title of titles) expect(title.length, title).toBeLessThanOrEqual(65)
    for (const description of descriptions) {
      expect(description.length, description).toBeGreaterThan(50)
      expect(description.length, description).toBeLessThanOrEqual(160)
    }
  })

  it('differ on every page', () => {
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(descriptions).size).toBe(descriptions.length)
  })
})

describe('structured data', () => {
  it('is on the home pages only', () => {
    for (const lang of LANGS) {
      for (const path of PAGE_PATHS) expect(scriptsOf(path, lang), path).toHaveLength(path === '/' ? 1 : 0)
    }
  })

  it('gives the site name only on the Hebrew home page, the root Google reads it from', () => {
    expect(jsonLdTypes('he')).toEqual(['WebSite', 'LodgingBusiness'])
    expect(jsonLdTypes('en')).toEqual(['LodgingBusiness'])
  })

  it('cannot close its script tag early, and still parses to the same data', () => {
    const data = { name: '</script><script>alert(1)</script>' }
    expect(inlineJson(data)).not.toContain('<')
    expect(JSON.parse(inlineJson(data))).toEqual(data)
  })
})
