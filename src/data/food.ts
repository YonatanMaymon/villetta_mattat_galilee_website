import type { CardItem, SliderImage } from './types'

export const FOOD_HERO = {
  image: '/assets/culinary-food-2.jpg',
  title: 'האוכל',
  subtitle: 'אנחנו משתדלים להכין את כל האוכל מהיבול שגדל אצלינו ושמחים שיכולים להעניק אותו גם לכם',
}

export const BREAKFAST = {
  title: 'ארוחת הבוקר',
  subtitle: 'ארוחת הבוקר המוגשת לכם, הוכנה באהבה במטבחי',
  intervalMs: 10000,
  images: [
    { src: '/assets/culinary-food-1.jpg', alt: 'ארוחת הבוקר בוילטה' },
    { src: '/assets/culinary-al6-3863.jpg', alt: 'ארוחת הבוקר בוילטה' },
    { src: '/assets/gallery-shulahan-1.jpg', alt: 'ארוחת הבוקר בוילטה' },
    { src: '/assets/gallery-07.jpg', alt: 'ארוחת הבוקר בוילטה' },
    { src: '/assets/gallery-mitbah12.jpg', alt: 'המטבח בוילטה' },
    { src: '/assets/gallery-ginatyarak4.jpg', alt: 'גינת הירק' },
    { src: '/assets/culinary-al6-3948.jpg', alt: 'ארוחת הבוקר בוילטה' },
    { src: '/assets/gallery-10-breakfast.jpg', alt: 'ארוחת הבוקר בוילטה' },
    { src: '/assets/gallery-aruha.jpg', alt: 'ארוחת הבוקר בוילטה' },
    { src: '/assets/gallery-ginatyarak7.jpg', alt: 'גינת הירק' },
    { src: '/assets/gallery-ginatyarak8.jpg', alt: 'גינת הירק' },
  ] satisfies SliderImage[],
  // Each paragraph is a list of lines (the original breaks lines inside paragraphs).
  paragraphs: [
    ['רוב המוצרים שמהם הוכנה ארוחת הבוקר, גדלים אצלינו בגינה, במטע או בטבע.', '(יש תקופות שאני יוצאת ללקט ומהם מכינה)'],
    ['המאפים הם שלי או של נשים מהממות ממתת שאופות ( אורית ומעיין).'],
    ['את הגבינות אני מגבנת מחלב של כמה עיזים טובות אשר מספקות לנו מהחלב שלהן, מהחלב אני גם מכינה יוגורט ולבאנה.'],
    [
      'במטע שלנו גדלים גפנים- מהם אנחנו מכינים את היין שהוגש לכם.',
      'זיתים – שאותם אנחנו מוסקים ומכינים שמן זית וזיתי מאכל.',
      'תאנים, דובדבנים, תפוחים, אגסים, רימונים, מישמש ( בקרוב:))',
      'הכול גדל אורגני ובחקלאות מסורתית.',
    ],
    ['אצלי בגינה אנחנו זורעים לפי עונות השנה את הירק המתאים לעונה', 'ומהם אני מכינה את מה שמגיע אליכם.'],
    ['ובהר – אני מלקטת מה שצומח לפי העונה ומתאים לאכילה.'],
    ['יש לי עוד הרבה ללמוד, אבל את מה שלמדתי עד כה ואותו אני מכינה,', 'שמחה כל כך להגיש אותו לכם !', 'בתיאבון'],
  ],
}

const BADGE_NEARBY = 'המסעדה בסביבה'
const BADGE_DELIVERS = 'מגיע עד לוילטה'

export const DINNER = {
  title: 'ארוחות ערב',
  subtitle: 'שפים ומסעדות מומלצות באזור',
}

// Listed in reading order (first card is the rightmost in RTL).
export const RESTAURANTS: CardItem[] = [
  {
    title: 'ביסטרו "אלומה"',
    description: "קולינאריה מודרנית עם נגיעות מסורתיות הם הרוח החיה שבמטבח הסוער של 'אלומה'.",
    image: '/assets/culinary-stock-photo.jpg',
    badge: BADGE_NEARBY,
    cta: { label: 'לצפייה בתפריט', href: 'https://alumabistro.co.il/' },
  },
  {
    title: 'מוניב והדיה',
    description: 'אוכל דרוזי גלילי טיפיקלי טעים וביתי.',
    image: '/assets/culinary-dolma.jpg',
    badge: BADGE_DELIVERS,
    cta: { label: 'לצפייה בתפריט', href: '/assets/moniv-hadia-menu.pdf' },
  },
  {
    title: 'בלדנא בגוש חלב',
    description:
      'מסעדה ברוח גלילית בשילוב בר עשיר ומבחר בירה מהטובים בעולם עם אוכל גלילי אוטנתי ומודרני שמייצר חוויה בחשיבה אחרת וטעמים שכוחים.',
    image: '/assets/culinary-blanda.jpg',
    badge: BADGE_NEARBY,
    // NOTE: the live site links this card to woodgrill.co.il (the גריל עץ site) - likely a slip.
    cta: { label: 'לצפייה בתפריט', href: 'https://www.woodgrill.co.il/' },
  },
  {
    title: 'גריל עץ',
    description: 'מסעדת גורמה המתמחה בבשרים איכותיים וטריים, בנוף הקסום של הגליל העליון',
    image: '/assets/culinary-wix-photo.webp',
    badge: BADGE_NEARBY,
    cta: { label: 'לצפייה בתפריט', href: 'https://www.woodgrill.co.il/' },
  },
  {
    title: 'בת יער',
    description: 'מסעדת הבשרים הוותיקה (יער בירייה, מרחק חצי שעה נסיעה)',
    image: '/assets/culinary-facebook-photo-1.jpg',
    badge: BADGE_NEARBY,
    cta: { label: 'פרטים נוספים', href: 'https://www.batyaar.co.il/' },
  },
  {
    title: 'אדלינה',
    description: 'מסעדת שף ים תיכוני (צומת כברי, מרחק חצי שעה)',
    image: '/assets/culinary-facebook-photo-2.jpg',
    badge: BADGE_NEARBY,
    cta: { label: 'פרטים נוספים', href: 'https://www.adelina.org.il/' },
  },
]
