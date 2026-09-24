import { FEATURE_TILES as HE_FEATURE_TILES, type FeatureTile, type NavLink, type Testimonial } from '../content'
import { translateItems } from './util'

export { PHONE_DISPLAY, PHONE_HREF, YOUTUBE_VIDEO_ID, SOCIALS } from '../content'

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'The Villetta', href: '/villetta' },
  { label: 'Food', href: '/culinary' },
  { label: "What's Nearby", href: '/the-area' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Written About Us', href: '/written-about-us' },
  { label: 'Prices', href: '/price' },
  { label: 'Contact', href: '/contact' },
]

export const HERO = {
  title: 'Such a magical and special place!',
  subtitle: 'A slice of heavenly paradise where everything exists and nothing is missing, in exquisite precision and harmony',
}

export const STORY = {
  title: 'Our Story',
  lead: 'Such a magical and special place! A slice of heavenly paradise where everything exists, nothing is missing, in exquisite precision and harmony.',
  body: [
    'At the summit of Mount Mattat, inside a nature reserve of wild, natural Mediterranean woodland in the Western Galilee, a floor was built with artistic care and great respect for nature, floating above the treetops: a true "Aladdin\'s carpet".',
    'This floor was also a canvas for several artists and craftspeople whose "work is their art", who came together with heart and soul to plan, draw and build this couples\' guesthouse, "Villetta Mattat Galilee".',
  ],
  href: '/our-story',
}

export const FEATURE_TILES: FeatureTile[] = translateItems(HE_FEATURE_TILES, [
  { title: 'The Villetta' },
  { title: 'Food' },
  { title: "What's Nearby" },
  { title: 'Gallery' },
])

export const TESTIMONIALS: Testimonial[] = [
  {
    title: 'Paradise, period',
    body: "Three days in paradise. Neither pictures nor words can explain the place. Without a doubt the most beautiful guesthouse in the country. Sharon and Kfir thought of every detail, from the soaps and scents to all the little treats that surprise you wherever you touch. The Villetta is isolated from everything. A place to disconnect and recharge. A magical, delicious breakfast facing the breathtaking view. Sharon and Kfir, thank you for the amazing hospitality, and for every second of the vacation. See you soon.",
    author: 'Omri and Amit',
  },
  {
    title: 'The most perfect in the world!',
    body: "The most stunning guesthouse we have been to, in Israel or anywhere in the world! The villa is simply gorgeous, lovingly and meticulously done… thought went into the smallest details, from the design to the games, the snacks, the sheets and the towels. Everything is truly of a very high standard. The breakfast was simply excellent! Tasty and fresh, all grown and prepared by the lovely host Sharon… maximum privacy, a breathtaking view, and underfloor heating that makes a winter stay perfect. We can't wait to come again very soon!",
    author: 'Yafit Ovadia',
  },
  {
    title: 'Wow, indescribable!',
    body: 'This wonderful cabin was built with careful planning and design at the highest levels you can find in Israel. A lasting sense of beauty, pampering, good taste, investment and thought put into every detail. The connection to nature, the mesmerizing view and the complete intimacy are exceptional. A delightful, rare sensory experience! We fell in love!',
    author: 'Vered Elkabetz',
  },
  {
    title: 'It does not get better than this',
    body: 'What a magical place. It opens the heart, pleasant, calming. Everything is of a really high standard and done out of genuine care, and you can feel it so much. The beautiful view you see from everywhere, soft and pampering sheets, blackout curtains, soaps with an amazing scent, perfect design, gym, sauna, a jacuzzi overlooking the view, a wonderful breakfast, and more and more, down to the smallest details.. How nice that such a place exists, we will definitely be back. Thank you!',
    author: 'Tal Rotem',
  },
]

export const FOOTER = {
  script: 'Perfect Experience',
  title: 'For a perfect experience in the Galilee',
  subtitle: 'Available for any question! At your service!',
  socialLabel: 'Find us also on',
  copyright: '© All rights reserved, Villetta Mattat Galilee 2023',
  credit: { text: 'created by | HD', href: 'https://www.hakerdesign.co.il' },
}

export const BOOKING = {
  title: 'Book Your Stay',
  terms:
    'Your booking is pending our telephone confirmation and is not final until then. ' +
    'Payment for the stay is made on arrival. Cancel up to 8 days before arrival: no charge. ' +
    'Cancel 4 to 7 days before: 50% of the price. Cancel 3 days or less before, or no-show: full price. ' +
    'If other guests rebook the dates, the charge is cancelled or refunded in full. ' +
    'If Home Front Command instructions or the security situation prevent the stay, cancellation is free.',
}
