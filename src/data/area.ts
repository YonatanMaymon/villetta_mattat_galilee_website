import type { CardItem, SliderImage } from './types'

export const AREA_HERO = {
  image: '/assets/home-villetanot8.jpg',
  title: 'מה באזור',
  subtitle: 'טיולים וסדנאות מומלצות באזור',
}

export const TRIPS = {
  title: 'טיולים מומלצים',
  subtitle: 'מסלולים לטיול, קרוב אלינו',
  intervalMs: 10000,
  images: [
    { src: '/assets/the-area-katlav.jpg', alt: 'עץ קטלב גדול בהר מתת' },
    { src: '/assets/the-area-nof2.jpg', alt: 'נוף הגליל' },
    { src: '/assets/the-area-villetanof.jpg', alt: 'נוף הגליל' },
    { src: '/assets/home-villetanot8.jpg', alt: 'נוף אווירי של הגליל בשקיעה' },
  ] satisfies SliderImage[],
  nearby: {
    heading: 'כאן במתת ישנם מספר מסלולים רגליים יפים שניתן לצאת ממש מהוילטה (ללא רכב) :',
    items: [
      'המסלול לקטלב הגדול ומסלול בהר מתת',
      // The original says "(קישור)" here but has no actual link.
      'כרמית ארבל רומבק, מורת דרך נפלאה פרטית וקבוצתית (קישור)',
    ],
  },
  further: {
    heading: 'מסלולים מומלצים לטיול, קרוב אלינו:',
    items: [
      'יער בירייה-פשוט להיכנס בשבילים',
      "נחל דישון – מתאים גם לטיול ג'יפים",
      'מערת פער – מסלול קצר ונחמד עשר דקות נסיעה מרוחק.',
      'שביל הפסגה – הר מירון טיול מעגלי של שעה וחצי',
      'מצפה הר אדיר – 5 דקות נסיעה מהוילטה',
      '"קירות מדברים" בשתולה (קישור)',
    ],
  },
}

export const ACTIVITIES = {
  title: 'פעילויות מומלצות',
  subtitle: 'אישיות לזוגות ולמשפחות',
}

export const ACTIVITY_CARDS: CardItem[] = [
  {
    title: "סטודיו לקרמיקה זיוה ג'וליוס",
    description: 'סדנאות חד פעמיות אישיות לזוגות ומשפחות, גלריה לקרמיקה, כלים שימושיים למכירה. לתאום בוואצאפ בלבד.',
    image: '/assets/the-area-facebook-photo-1.jpg',
    cta: { label: '052-637-7041', href: 'https://api.whatsapp.com/send?phone=+972526377041' },
  },
  {
    title: 'יובל תלם חרש ברזל',
    description: 'סדנת נפחות במתת מתאימה ליחידים, לזוגות ולקבוצות קטנות עד ארבעה אנשים.',
    image: '/assets/the-area-telem.jpg',
    cta: { label: 'פרטים נוספים', href: 'https://www.yuvaltelem.com/' },
  },
  {
    title: 'טיולי סוסים בחוות בת יער',
    description: 'אנו מזמינים אתכם לצאת לטיולי הרכיבה של חוות בת יער בנופי עמוקה המדהימים.',
    image: '/assets/the-area-wix-photo.webp',
    cta: { label: 'פרטים נוספים', href: 'https://www.batyaar.co.il/horses' },
  },
  {
    title: 'דבש ניחוח הגליל',
    description: 'במכוורת אנו מייצרים דבש טבעי באיכות מעולה, ובנוסף מגדלים דובדבנים אורגניים, אשר מחלקם מופק שיכר (יין) דובדבנים אורגני.',
    image: '/assets/the-area-facebook-photo-2.jpg',
    cta: { label: 'פרטים נוספים', href: 'https://www.facebook.com/GalileeAromaHoney/?locale=he_IL' },
  },
]
