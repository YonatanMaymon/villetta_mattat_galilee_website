import { formatShekels } from '../../shared/money'
import { PHONE_DISPLAY } from './content'
import { CONTACT_DETAILS } from './contact'
import { PRICE_DISCOUNTS, PRICE_NIGHTS } from './price'

/** The business name, as Google should show it. */
export const SITE_NAME: string = 'וילטה מתת גליל'

/** The village, for the address in the business data Google reads (src/seo/meta.ts). */
export const LOCALITY: string = 'מתת'

export interface PageSeo {
  /** The link text in Google's results. Keep it under about 60 characters; Google cuts longer ones short. */
  title: string
  /** The text under the link. Keep it under about 155 characters. */
  description: string
}

const nights = PRICE_NIGHTS.map((night) => night.price)
const money = (amount: number) => `${formatShekels(amount)}₪`
const discounts = PRICE_DISCOUNTS.map((discount) => `${discount.percent}% על ${discount.label}`).join(' ו-')

/**
 * What Google shows for each page, by path. Written with the words people search for (צימר זוגי, ג'קוזי,
 * סאונה, גליל), and using only facts the page itself states. The headings on the pages are separate.
 */
export const PAGE_SEO = {
  '/': {
    title: "וילטה מתת גליל | צימר זוגי עם ג'קוזי וסאונה בגליל",
    description:
      "צימר זוגי מבודד בפסגת הר מתת בגליל המערבי, בתוך חורש טבעי: ג'קוזי-ספא מול הנוף, סאונה, חדר טיפולים " +
      'וארוחת בוקר מהיבול שגדל אצלנו.',
  },
  '/our-story': {
    title: 'הסיפור שלנו: איך נבנתה הוילטה בהר מתת | וילטה מתת גליל',
    description:
      'הכרנו את מתת ב-2005, ובמשך ארבע וחצי שנים בנינו כאן את ביתנו ואת הוילטה, לצד משק קטן עם עיזים, ' +
      'גינת ירק, כרם ומטע פירות.',
  },
  '/villetta': {
    title: "הצימר: ג'קוזי-ספא, סאונה וחדר טיפולים | וילטה מתת גליל",
    description:
      "מה יש בצימר: מיטה גדולה עם מצעי כותנה מצרית, סלון, מטבחון, מתחם חוץ פרטי עם ג'קוזי-ספא וסאונה יבשה, " +
      'חדר טיפולים וחדר כושר. פרטיות מלאה מול הנוף.',
  },
  '/culinary': {
    title: 'ארוחת בוקר מהיבול שלנו ומסעדות באזור | וילטה מתת גליל',
    description:
      'ארוחת בוקר שמוכנה באהבה מהיבול שגדל אצלנו, מגינת הירק ומהמטע, והמלצות לארוחות ערב אצל שפים ' +
      'ובמסעדות באזור.',
  },
  '/the-area': {
    title: 'טיולים ופעילויות ליד מתת בגליל | וילטה מתת גליל',
    description:
      'מסלולי טיול קרובים ופעילויות מומלצות ליד מתת: סטודיו לקרמיקה, חרש ברזל, טיולי סוסים בחוות בת יער ' +
      'ודבש ניחוח הגליל.',
  },
  '/gallery': {
    title: "תמונות הצימר, הנוף והג'קוזי | וילטה מתת גליל",
    description: "תמונות של הוילטה: הג'קוזי-ספא, הנוף, העיצוב וארוחת הבוקר. בית זוגי בגליל הממתין לארח אתכם.",
  },
  '/written-about-us': {
    title: 'כתבו עלינו: mako ו-D+A | וילטה מתת גליל',
    description:
      'mako ו-D+A כתבו על הוילטה: מ"וילות האירוח הכי יפות בישראל" ועד "צימר במתת: החוץ הוא הפנים". ' +
      'קראו את הכתבות.',
  },
  // Built from the price list, so it changes with it.
  '/price': {
    title: 'מחירון: מחיר ללילה והנחות לזוג | וילטה מתת גליל',
    description:
      `מחיר ללילה לזוג: ${money(Math.min(...nights))} עד ${money(Math.max(...nights))}. ` +
      `הנחה לשהייה ארוכה: ${discounts}. בדקו תאריכים פנויים והזמינו אונליין.`,
  },
  '/contact': {
    title: 'צור קשר והגעה בוויז | וילטה מתת גליל',
    description:
      `טלפון: ${PHONE_DISPLAY}, מייל: ${CONTACT_DETAILS.email.value}, או ניווט בוויז ל"וילטה מתת גליל". ` +
      'זמינים לכל שאלה ושמחים לארח אתכם.',
  },
  '/accessibility': {
    title: 'הצהרת נגישות | וילטה מתת גליל',
    description:
      'הצהרת הנגישות של אתר וילטה מתת גליל: מה עשינו כדי שהאתר יהיה נגיש, מה עדיין אינו נגיש במלואו, ' +
      'נגישות הוילטה עצמה ולמי לפנות.',
  },
  '/privacy': {
    title: 'מדיניות פרטיות | וילטה מתת גליל',
    description:
      'איזה מידע נאסף בטופס ההזמנה ובטופס יצירת הקשר, למה, למי הוא מועבר, ואיך לעיין בו, לתקן אותו או ' +
      'למחוק אותו.',
  },
} satisfies Record<string, PageSeo>
