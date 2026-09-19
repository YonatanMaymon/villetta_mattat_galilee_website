import { OUR_STORY_CHAPTERS as HE_CHAPTERS, OUR_STORY_HERO as HE_HERO, type StoryChapter } from '../ourStory'
import { translateItems } from './util'

export const OUR_STORY_HERO = {
  image: HE_HERO.image,
  title: 'Our Story',
  subtitle: 'The beginning of a love story at first sight',
}

const VILLETTA_ALT = 'Villetta Mattat Galilee'

export const OUR_STORY_CHAPTERS: StoryChapter[] = translateItems(HE_CHAPTERS, [
  {
    kicker: 'The beginning of a story',
    title: 'Love at first sight',
    paragraphs: [
      'We got to know the Mattat lookout in 2005.',
      'We arrived at a lovely, simple guesthouse, and from there a love story began. Every three months we came to the same guesthouse for three days, disconnected from everything and connected with each other and with nature.',
      'For us it was the most connecting disconnection there is. Always returning to Mattat. Disconnecting in order to connect.',
      'In the middle of life, with careers and four wonderful children, we were suddenly "dropped" the opportunity to buy a beautiful plot with tangled vegetation and an old, crumbling, enchanting house on it. A view like none we had ever seen, in Mattat, which we had already fallen deeply in love with.',
    ],
    images: translateItems(HE_CHAPTERS[0].images, [
      { alt: 'A couple gazing at the Galilee view at sunset' },
      { alt: 'A table and two chairs on the porch facing the view' },
      { alt: VILLETTA_ALT },
      { alt: VILLETTA_ALT },
      { alt: 'A hammock swing facing the view' },
    ]),
  },
  {
    kicker: 'Living closer to nature',
    title: 'Exquisite precision and harmony',
    paragraphs: [
      'We began to draw and plan how the place would look. We found ourselves surrendering to the process and to the mountain, and for four and a half years we built and created our home and our special guesthouse – Villetta Mattat Galilee.',
      'Alongside the house and the Villetta, we cultivate a self-sufficient farm with a few goats, a vegetable garden, a diverse orchard with a beautiful vineyard, figs, cherries, olives, apples, pomegranates, pears, citrus trees, and lately we even sowed wheat.',
      "We do our best to prepare all our food from the produce grown here with us, and we're happy to be able to share it with you too.",
    ],
    closing: 'We are delighted from the bottom of our hearts to host you in a place where we were privileged to be guests in this lifetime.',
    images: HE_CHAPTERS[1].images.map((img) => ({ ...img, alt: VILLETTA_ALT })),
  },
])
