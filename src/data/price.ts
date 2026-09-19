export const PRICE_HERO = {
  image: '/assets/gallery-04.jpg',
  title: 'מחירון',
  subtitle: 'שמחים לארח אתכם במקום שזכינו להתארח בו',
}

export interface PriceRow {
  label: string
  /** Sunday-Thursday price, in ₪. */
  midweek: number
  /** Weekend price, in ₪. */
  weekend: number
}

export const PRICE_COLUMNS = 'אמצ"ש/סופ"ש'

export const PRICE_ROWS: PriceRow[] = [
  { label: 'לילה אחד', midweek: 4200, weekend: 4500 },
  { label: '2 לילות', midweek: 6400, weekend: 7600 },
  { label: '3 לילות', midweek: 8600, weekend: 9900 },
  { label: 'כל לילה נוסף', midweek: 2200, weekend: 2300 },
]

export const PRICE_NOTE = '*המחיר לזוג בלבד'
