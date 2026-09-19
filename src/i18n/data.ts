import * as heArea from '../data/area'
import * as heContact from '../data/contact'
import * as heContent from '../data/content'
import * as heFood from '../data/food'
import * as heGallery from '../data/gallery'
import * as heOurStory from '../data/ourStory'
import * as hePress from '../data/press'
import * as hePrice from '../data/price'
import * as heVilletta from '../data/villetta'
import * as enArea from '../data/en/area'
import * as enContact from '../data/en/contact'
import * as enContent from '../data/en/content'
import * as enFood from '../data/en/food'
import * as enGallery from '../data/en/gallery'
import * as enOurStory from '../data/en/ourStory'
import * as enPress from '../data/en/press'
import * as enPrice from '../data/en/price'
import * as enVilletta from '../data/en/villetta'

const he = {
  area: heArea,
  contact: heContact,
  content: heContent,
  food: heFood,
  gallery: heGallery,
  ourStory: heOurStory,
  press: hePress,
  price: hePrice,
  villetta: heVilletta,
}

/** Every translatable data module; the English side must match the Hebrew shape. */
export type SiteData = typeof he

const en: SiteData = {
  area: enArea,
  contact: enContact,
  content: enContent,
  food: enFood,
  gallery: enGallery,
  ourStory: enOurStory,
  press: enPress,
  price: enPrice,
  villetta: enVilletta,
}

export const DATA = { he, en }
