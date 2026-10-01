import { formatShekels } from '../../../shared/money'
import type { PageSeo } from '../seo'
import { CONTACT_DETAILS } from './contact'
import { PHONE_DISPLAY } from './content'
import { PRICE_DISCOUNTS, PRICE_NIGHTS } from './price'

export const SITE_NAME = 'Villetta Mattat Galilee'

export const LOCALITY = 'Mattat'

const nights = PRICE_NIGHTS.map((night) => night.price)
const money = (amount: number) => `₪${formatShekels(amount)}`
const discounts = PRICE_DISCOUNTS.map((discount) => `${discount.percent}% off ${discount.label}`).join(' and ')

export const PAGE_SEO = {
  '/': {
    title: "Villetta Mattat Galilee | Couples' Guesthouse in the Galilee",
    description:
      "A secluded couples' guesthouse on Mount Mattat, Western Galilee: a jacuzzi-spa facing the view, sauna, " +
      'treatment room and breakfast from our own produce.',
  },
  '/our-story': {
    title: 'Our Story on Mount Mattat | Villetta Mattat Galilee',
    description:
      'We got to know Mattat in 2005, then spent four and a half years building our home and the Villetta ' +
      'here, beside our small farm of goats, vines and fruit trees.',
  },
  '/villetta': {
    title: 'Jacuzzi-Spa, Sauna and Treatment Room | Villetta Mattat Galilee',
    description:
      'A large bed with Egyptian cotton sheets, living room, kitchenette, a private outdoor area with ' +
      'jacuzzi-spa and dry sauna, a treatment room and a gym.',
  },
  '/culinary': {
    title: 'Breakfast From Our Own Produce | Villetta Mattat Galilee',
    description:
      'Breakfast made with love from what we grow in our vegetable garden and orchard, plus recommended ' +
      'chefs and restaurants nearby for dinner.',
  },
  '/the-area': {
    title: 'Hikes and Workshops Near Mattat | Villetta Mattat Galilee',
    description:
      'Trails close to us and recommended activities around Mattat: a ceramics studio, a blacksmith, ' +
      'horseback riding at Bat Yaar Ranch and Galilee Aroma Honey.',
  },
  '/gallery': {
    title: 'Photos: Jacuzzi, View and Interiors | Villetta Mattat Galilee',
    description:
      "Photos of the Villetta: the jacuzzi-spa, the view, the interiors and breakfast. A couples' retreat in " +
      'the Galilee waiting to host you.',
  },
  '/written-about-us': {
    title: 'In the Press: mako and D+A | Villetta Mattat Galilee',
    description:
      'mako and D+A wrote about the Villetta: "the most beautiful guest villas in Israel" and "a guesthouse ' +
      'in Mattat: the outside is the inside".',
  },
  '/price': {
    title: 'Prices per Night and Discounts | Villetta Mattat Galilee',
    description:
      `Price per night for a couple: ${money(Math.min(...nights))} to ${money(Math.max(...nights))}. ` +
      `Longer stays: ${discounts}. Check free dates and book online.`,
  },
  '/contact': {
    title: 'Contact and Directions on Waze | Villetta Mattat Galilee',
    description:
      `Phone ${PHONE_DISPLAY}, email ${CONTACT_DETAILS.email.value}, or navigate on Waze to ` +
      `"Villetta Mattat Galilee". We're happy to answer any question.`,
  },
  '/accessibility': {
    title: 'Accessibility Statement | Villetta Mattat Galilee',
    description:
      'How the Villetta Mattat Galilee website is made accessible, what is not fully accessible yet, ' +
      'access at the Villetta itself, and whom to contact.',
  },
  '/privacy': {
    title: 'Privacy Policy | Villetta Mattat Galilee',
    description:
      'What the booking and contact forms collect, why, who receives it, and how to see, correct or ' +
      'delete your details.',
  },
} satisfies Record<string, PageSeo>
