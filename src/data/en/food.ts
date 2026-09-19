import { BREAKFAST as HE_BREAKFAST, FOOD_HERO as HE_HERO, RESTAURANTS as HE_RESTAURANTS } from '../food'
import type { CardItem } from '../types'
import { translateItems } from './util'

export const FOOD_HERO = {
  image: HE_HERO.image,
  title: 'Food',
  subtitle: "We do our best to prepare all our food from the produce grown here with us, and we're happy to be able to share it with you too",
}

const BREAKFAST_ALT = 'Breakfast at the Villetta'
const KITCHEN_ALT = 'The kitchen at the Villetta'
const GARDEN_ALT = 'The vegetable garden'

export const BREAKFAST = {
  title: 'Breakfast',
  subtitle: 'The breakfast served to you was prepared with love in my kitchen',
  intervalMs: HE_BREAKFAST.intervalMs,
  images: translateItems(
    HE_BREAKFAST.images,
    [
      BREAKFAST_ALT,
      BREAKFAST_ALT,
      BREAKFAST_ALT,
      BREAKFAST_ALT,
      KITCHEN_ALT,
      GARDEN_ALT,
      BREAKFAST_ALT,
      BREAKFAST_ALT,
      BREAKFAST_ALT,
      GARDEN_ALT,
      GARDEN_ALT,
    ].map((alt) => ({ alt })),
  ),
  // Each paragraph is a list of lines (the original breaks lines inside paragraphs).
  paragraphs: [
    [
      'Most of the ingredients in your breakfast grow here with us, in the garden, the orchard or in the wild.',
      '(At some times of year I go out foraging and prepare food from what I find)',
    ],
    ['The pastries are mine, or made by wonderful women from Mattat who bake (Orit and Maayan).'],
    [
      'I make the cheeses myself from the milk of a few good goats who provide us with their milk; from the milk I also make yoghurt and labneh.',
    ],
    [
      'In our orchard we grow grapevines, from which we make the wine that was served to you.',
      'Olives, which we harvest and turn into olive oil and table olives.',
      'Figs, cherries, apples, pears, pomegranates, apricots (coming soon :))',
      'Everything is grown organically, using traditional farming.',
    ],
    [
      'In my garden we sow, according to the season, the vegetables that suit it,',
      'and from them I prepare what reaches you.',
    ],
    ['And on the mountain, I forage whatever grows in season and is good to eat.'],
    [
      'I still have a lot to learn, but what I have learned so far, I prepare,',
      'and I am so happy to serve it to you!',
      'Bon appétit',
    ],
  ],
}

const BADGE_NEARBY = 'Restaurant nearby'
const BADGE_DELIVERS = 'Delivers to the Villetta'

export const DINNER = {
  title: 'Dinner',
  subtitle: 'Recommended chefs and restaurants in the area',
}

const VIEW_MENU = 'View menu'
const MORE_DETAILS = 'More details'

export const RESTAURANTS: CardItem[] = translateItems(HE_RESTAURANTS, [
  {
    title: 'Aluma Bistro',
    description: "Modern cuisine with traditional touches is the living spirit of Aluma's bustling kitchen.",
    badge: BADGE_NEARBY,
    cta: { ...HE_RESTAURANTS[0].cta, label: VIEW_MENU },
  },
  {
    title: 'Moniv and Hadia',
    description: 'Typical, tasty, homestyle Galilean Druze food.',
    badge: BADGE_DELIVERS,
    cta: { ...HE_RESTAURANTS[1].cta, label: VIEW_MENU },
  },
  {
    title: 'Baladna in Gush Halav',
    description:
      "A Galilean-spirited restaurant with a rich bar and a selection of some of the world's best beers, serving authentic, modern Galilean food that creates an experience with a different way of thinking and unforgettable flavors.",
    badge: BADGE_NEARBY,
    cta: { ...HE_RESTAURANTS[2].cta, label: VIEW_MENU },
  },
  {
    title: 'Wood Grill',
    description: 'A gourmet restaurant specializing in fresh, high-quality meats, in the enchanting landscape of the Upper Galilee',
    badge: BADGE_NEARBY,
    cta: { ...HE_RESTAURANTS[3].cta, label: VIEW_MENU },
  },
  {
    title: 'Bat Yaar',
    description: "The long-established meat restaurant (Biriya Forest, half an hour's drive)",
    badge: BADGE_NEARBY,
    cta: { ...HE_RESTAURANTS[4].cta, label: MORE_DETAILS },
  },
  {
    title: 'Adelina',
    description: "A Mediterranean chef's restaurant (Kabri Junction, half an hour away)",
    badge: BADGE_NEARBY,
    cta: { ...HE_RESTAURANTS[5].cta, label: MORE_DETAILS },
  },
])
