export const PRICE_HERO = {
  image: '/assets/gallery-04.jpg',
  title: 'מחירון',
  subtitle: 'שמחים לארח אתכם במקום שזכינו להתארח בו',
}

export interface NightPrice {
  label: string
  /** Price of one night, in ₪. */
  price: number
}

export interface StayDiscount {
  label: string
  /** Discount on every night of the stay, in percent. */
  percent: number
}

/*
 * These must match the rates in Smoobu, which decides the price actually charged. Smoobu gives the discount
 * on every night of the stay, so the note below says so.
 */

export const PRICE_NIGHTS_TITLE: string = 'מחיר ללילה'

export const PRICE_NIGHTS: NightPrice[] = [
  { label: 'אמצע השבוע (א׳–ה׳)', price: 4200 },
  { label: 'סוף השבוע (שישי ושבת)', price: 4500 },
]

export const PRICE_DISCOUNTS_TITLE: string = 'הנחה לשהייה ארוכה'

export const PRICE_DISCOUNTS: StayDiscount[] = [
  { label: '2 לילות', percent: 25 },
  { label: '3 לילות ומעלה', percent: 35 },
]

export const PRICE_NOTE: string = '*המחיר לזוג בלבד. ההנחה חלה על כל לילות השהייה.'
