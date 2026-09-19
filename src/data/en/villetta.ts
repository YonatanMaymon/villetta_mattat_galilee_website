import { AMENITY_GROUPS as HE_GROUPS, PRIVACY as HE_PRIVACY, VILLETTA_HERO as HE_HERO, type AmenityGroup } from '../villetta'
import { translateItems } from './util'

export const VILLETTA_HERO = {
  image: HE_HERO.image,
  title: 'The Villetta',
  subtitle: 'You will enjoy a healing stay, full of every good thing.',
}

export const AMENITIES_HEADING = {
  title: "What's in the Villetta?",
  subtitle: 'Please find the following areas:',
}

const TV = 'Smart OLED TV connected to Netflix and YouTube.'

// Same order and icons as the Hebrew groups; only the text differs.
const AMENITY_TEXT: Record<string, { title: string; items: string[] }> = {
  bedroom: {
    title: 'Bedroom',
    items: [
      'A large, pampering bed with dense Egyptian cotton sheets',
      'Wardrobe + hanging space',
      TV,
      'Air conditioning',
      'Chest of drawers',
      'Blackout curtains',
      'A bottle of wine grown and made here with us',
    ],
  },
  'living-room': {
    title: 'Living Room',
    items: [TV, 'Sofa', 'Seating area', 'Air conditioning', 'Hammock swing'],
  },
  kitchen: {
    title: 'Kitchen',
    items: [
      'Electric cooktop',
      'Small refrigerator',
      'Coffee machine',
      'Cookware',
      'Microwave',
      'Coffee and tea corner',
      'Dining area',
      'Kitchen suitable for light cooking',
      'Electric kettle',
    ],
  },
  'private-outdoor': {
    title: 'Private Outdoor Area',
    items: [
      'Attached balcony',
      'Dry sauna',
      'Attached bathroom',
      'Jacuzzi-spa, 2x2 meters',
      'Covered seating area',
      'Seating area',
    ],
  },
  spa: {
    title: 'Treatment and Wellness Room',
    items: ['Two treatment beds', 'Gym', 'Guest toilet'],
  },
}

export const AMENITY_GROUPS: AmenityGroup[] = HE_GROUPS.map((group) => {
  const text = AMENITY_TEXT[group.id]
  return { ...group, title: text.title, items: translateItems(group.items, text.items.map((t) => ({ text: t }))) }
})

const VILLETTA_ALT = 'Villetta Mattat Galilee'

export const PRIVACY = {
  title: 'And above all... privacy,',
  subtitle: 'Just you and the nature that surrounds and embraces you.',
  intervalMs: HE_PRIVACY.intervalMs,
  images: HE_PRIVACY.images.map((img) => ({
    ...img,
    alt: img.src.includes('breakfast') ? 'Breakfast at the Villetta' : VILLETTA_ALT,
  })),
}
