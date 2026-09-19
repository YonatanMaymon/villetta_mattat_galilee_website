import { ACTIVITY_CARDS as HE_ACTIVITY_CARDS, TRIPS as HE_TRIPS } from '../area'
import { translateItems } from './util'

export const AREA_HERO = {
  image: '/assets/home-villetanot8.jpg',
  title: "What's Nearby",
  subtitle: 'Recommended hikes and workshops in the area',
}

export const TRIPS = {
  title: 'Recommended Hikes',
  subtitle: 'Trails close to us',
  intervalMs: HE_TRIPS.intervalMs,
  images: translateItems(HE_TRIPS.images, [
    { alt: 'A large katlav (strawberry tree) on Mount Mattat' },
    { alt: 'A view of the Galilee' },
    { alt: 'A view of the Galilee' },
    { alt: 'An aerial view of the Galilee at sunset' },
  ]),
  nearby: {
    heading: 'Here in Mattat there are several lovely walking trails that start right from the Villetta (no car needed):',
    items: [
      'The trail to the Great Katlav and a trail on Mount Mattat',
      // The original says "(link)" here but has no actual link.
      'Carmit Arbel Rombeck, a wonderful private and group tour guide (link)',
    ],
  },
  further: {
    heading: 'Recommended hikes close to us:',
    items: [
      'Biriya Forest – just head onto the paths',
      'Nahal Dishon – also suitable for jeep tours',
      "Pe'er Cave – a short, pleasant trail, a ten-minute drive away.",
      'Summit Trail – Mount Meron, a circular hike of an hour and a half',
      'Har Adir Lookout – 5 minutes\' drive from the Villetta',
      '"Talking Walls" in Shatula (link)',
    ],
  },
}

export const ACTIVITIES = {
  title: 'Recommended Activities',
  subtitle: 'Personal experiences for couples and families',
}

export const ACTIVITY_CARDS = translateItems(HE_ACTIVITY_CARDS, [
  {
    title: 'Ziva Julius Ceramics Studio',
    description:
      'One-time private workshops for couples and families, a ceramics gallery, and useful handmade pieces for sale. By WhatsApp appointment only.',
  },
  {
    title: 'Yuval Telem, Blacksmith',
    description: 'A blacksmithing workshop in Mattat, suitable for individuals, couples and small groups of up to four people.',
    cta: { ...HE_ACTIVITY_CARDS[1].cta, label: 'More details' },
  },
  {
    title: 'Horseback Riding at Bat Yaar Ranch',
    description: 'We invite you to go on the riding tours of Bat Yaar Ranch, in the stunning landscapes of Amuka.',
    cta: { ...HE_ACTIVITY_CARDS[2].cta, label: 'More details' },
  },
  {
    title: 'Galilee Aroma Honey',
    description:
      'At our apiary we produce top-quality natural honey, and we also grow organic cherries, some of which are made into organic cherry wine.',
    cta: { ...HE_ACTIVITY_CARDS[3].cta, label: 'More details' },
  },
])
