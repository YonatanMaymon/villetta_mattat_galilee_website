export const PHONE_DISPLAY = '052-4560554'
export const PHONE_HREF = 'tel:+972524560554'
export const YOUTUBE_VIDEO_ID = '3tZoOpgGw4Q'

export interface NavLink {
  label: string
  href: string
}

export const NAV_LINKS: NavLink[] = [
  { label: 'ראשי', href: '/' },
  { label: 'הסיפור שלנו', href: '/our-story' },
  { label: 'על הוילטה', href: '/villetta' },
  { label: 'האוכל', href: '/culinary' },
  { label: 'מה באזור', href: '/the-area' },
  { label: 'גלריה', href: '/gallery' },
  { label: 'כתבו עלינו', href: '/written-about-us' },
  { label: 'מחירון', href: '/price' },
  { label: 'צור קשר', href: '/contact' },
]

export const HERO = {
  title: 'מקום כה קסום ומיוחד!',
  subtitle: 'פיסת גן עדן שמימית בה הכול קיים, לא חסר דבר, בדיוק והרמוניה מופתיים',
}

export const STORY = {
  title: 'הסיפור שלנו',
  lead: 'מקום כה קסום ומיוחד! פיסת גן עדן שמימית בה הכול קיים, לא חסר דבר, בדיוק והרמוניה מופתיים.',
  body: [
    'בפסגת הר מתת, בתוך שמורת טבע של חורש ים תיכוני טבעי ופראי בגליל המערבי, נבנתה, בהקפדה אומנותית ובשמירה יתירה על הטבע, ריצפה מרחפת מעל צמרות העצים, ממש "שטיח של אלאדין"',
    'הריצפה הזאת היוותה כן ציור למספר אומנים, בעלי מקצוע ש"עבודתם היא אומנותם", שחברו יחד למשחק נשמה, לתכנן, לצייר ולבנות את בית האירוח הזוגי הזה, "וילטה מתת גליל".',
  ],
  href: '/our-story',
}

export interface FeatureTile {
  label: string
  title: string
  image: string
  href: string
}

// Listed in reading order (right → left in RTL).
export const FEATURE_TILES: FeatureTile[] = [
  { label: 'Villetta', title: 'על הוילטה', image: '/assets/hero-jacuzzi.jpg', href: '/villetta' },
  { label: 'Culinary', title: 'האוכל', image: '/assets/culinary-food-2.jpg', href: '/culinary' },
  { label: 'Explore', title: 'מה באזור', image: '/assets/home-villetanot8.jpg', href: '/the-area' },
  { label: 'Gallery', title: 'גלריה', image: '/assets/home-al6-4063.jpg', href: '/gallery' },
]

export interface Testimonial {
  title: string
  body: string
  author: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    title: 'גן עדן נקודה',
    body: 'שלושה ימים בגן עדן. לא תמונות ולא מילים יסבירו את המקום. ללא ספק המקום לאירוח הכי יפה בארץ. שרון וכפיר חשבו על כל פרט, מסבונים לריחות ועד לכל הפינוקים שמפתיעים בכל מקום שנוגעים. הוילטה מבודדת מהכל. מקום להתנתק ולהתמלא באנרגיות. ארוחת בוקר קסומה וטעימה מול הנוף עוצר הנשימה. שרון וכפיר תודה על האירוח המדהים, ועל כל שניה בחופשה. ניפגש בקרוב .',
    author: 'עמרי ועמית',
  },
  {
    title: 'הכי מושלם בעולם!',
    body: 'המקום אירוח הכי מהמם שהיינו בו בארץ ובעולם! הוילה פשוט יפייפה, מושקעת ומוקפדת מאוד… חשיבה על הפרטים הקטנים - החל מהעיצוב ועד למשחקים, הנשנושים, המצעים והמגבות. הכל באמת ברמה מאוד גבוהה. הארוחת בוקר הייתה פשוט מעולה! טעים וטרי - הכל גדל והוכן בידי המארחת המקסימה שרון… פרטיות מקסימלית, נוף עוצר נשימה, חימום תת רצפתי שעושה את האירוח החורפי למושלם. לא יכולים לחכות להגיע שוב בקרוב מאוד!',
    author: 'יפית עובדיה',
  },
  {
    title: 'וואו אין לתאר!',
    body: 'הבקתה המופלאה הזו, נבנתה תוך תכנון ועיצוב מוקפד ברמות הגבוהות ביותר שניתן למצוא בארץ. תחושה מתמשכת של יופי, פינוק, טוב טעם, השקעה ומחשבה על כל פרט. החיבור לטבע, הנוף המהפנט והאינטימיות המוחלטת יוצאי דופן. חוויה חושית מענגת ונדירה! התאהבנו!',
    author: 'ורד אלקבץ',
  },
  {
    title: 'אין יותר טוב מזה',
    body: 'איזה מקום קסום. מרחיב את הלב, נעים, מרגיע. הכל ברמה ממש גבוהה ונעשה מתוך אכפתיות אמיתית, וזה כל כך מורגש. הנוף היפהפה שרואים מכל מקום, מצעים רכים ומפנקים, וילונות מחשיכים, סבונים בריח מדהים, עיצוב מושלם, חדר כושר, סאונה, ג׳קוזי שמשקיף על הנוף, ארוחת בוקר נפלאה, ועוד ועוד ועוד עד הפרטים הכי קטנים.. איזה כיף שיש מקום כזה, אנחנו בטוח נחזור. תודה לכם!',
    author: 'טל רתם',
  },
]

export const FOOTER = {
  script: 'Perfect Experience',
  title: 'לחוויה מושלמת בגליל',
  subtitle: 'זמינים לכל שאלה! לשירותכם!',
  socialLabel: 'חפשו אותנו גם ב',
  copyright: '© כל הזכויות שמורות, וילטה מתת גליל 2023',
  credit: { text: 'created by | HD', href: 'https://www.hakerdesign.co.il' },
}

export const SOCIALS = {
  instagram: 'https://www.instagram.com/viletamatatgalil/',
  youtube: 'https://www.youtube.com/@villettamattatgalilee',
  waze: 'https://waze.com/ul?q=%D7%95%D7%99%D7%9C%D7%98%D7%94%20%D7%9E%D7%AA%D7%AA%20%D7%92%D7%9C%D7%99%D7%9C&z=10&navigate=yes',
}

export const BOOKING = {
  title: 'הזמנת מקום',
  /** The cancellation policy, shown on the last screen of the booking dialog above the confirm button. */
  terms:
    'ההזמנה ממתינה לאישור טלפוני מצדנו ואינה סופית עד לאישור זה. התשלום על השהייה מתבצע בהגעה. ' +
    'ביטול עד 8 ימים לפני ההגעה: ללא חיוב. ביטול 4 עד 7 ימים לפני ההגעה: חיוב של 50% ממחיר השהייה. ' +
    'ביטול 3 ימים לפני ההגעה או פחות, או אי-הגעה: חיוב מלא. ' +
    'אם התאריכים יוזמנו מחדש על ידי אורחים אחרים, החיוב יבוטל או יוחזר במלואו. ' +
    'אם הנחיות פיקוד העורף או המצב הביטחוני מונעים את השהייה, הביטול ללא חיוב.',
}
