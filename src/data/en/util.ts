/**
 * Copies `items` (the Hebrew source of truth) and overlays the translated fields, so images,
 * links and icons stay defined in one place. Throws on a length mismatch to catch drift early.
 */
export function translateItems<T extends object>(items: readonly T[], translations: readonly Partial<T>[]): T[] {
  if (items.length !== translations.length) {
    throw new Error(`Translation count (${translations.length}) does not match source (${items.length})`)
  }
  return items.map((item, i) => ({ ...item, ...translations[i] }))
}
