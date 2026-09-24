import {
  PRICE_DISCOUNTS as HE_DISCOUNTS,
  PRICE_HERO as HE_HERO,
  PRICE_NIGHTS as HE_NIGHTS,
  type NightPrice,
  type StayDiscount,
} from '../price'
import { translateItems } from './util'

export const PRICE_HERO = {
  image: HE_HERO.image,
  title: 'Prices',
  subtitle: 'We are happy to host you in a place where we were fortunate to be guests',
}

export const PRICE_NIGHTS_TITLE = 'Price per night'

export const PRICE_NIGHTS: NightPrice[] = translateItems(HE_NIGHTS, [
  { label: 'Weeknight (Sun–Thu)' },
  { label: 'Weekend night (Fri & Sat)' },
])

export const PRICE_DISCOUNTS_TITLE = 'Longer stay discount'

export const PRICE_DISCOUNTS: StayDiscount[] = translateItems(HE_DISCOUNTS, [
  { label: '2 nights' },
  { label: '3 nights or more' },
])

export const PRICE_NOTE = '*Price per couple only. The discount applies to every night of the stay.'
