import { PRICE_HERO as HE_HERO, PRICE_ROWS as HE_ROWS, type PriceRow } from '../price'
import { translateItems } from './util'

export const PRICE_HERO = {
  image: HE_HERO.image,
  title: 'Prices',
  subtitle: 'We are happy to host you in a place where we were fortunate to be guests',
}

export const PRICE_COLUMNS = 'Midweek / Weekend'

export const PRICE_ROWS: PriceRow[] = translateItems(HE_ROWS, [
  { label: 'One night' },
  { label: '2 nights' },
  { label: '3 nights' },
  { label: 'Each additional night' },
])

export const PRICE_NOTE = '*Price per couple only'
