export const PRESS_HERO = {
  image: '/assets/gallery-al6-4202.jpg',
  title: 'כתבו עלינו',
  subtitle: 'ראו מה כותבים עלינו',
}

export interface PressArticle {
  outlet: string
  published: string
  title: string
  excerpt: string
  image: string
  href: string
}

// First article is on the right in RTL.
export const PRESS_ARTICLES: PressArticle[] = [
  {
    outlet: 'MAKO LIVING',
    published: 'פורסם 19/01/23',
    title: '"מלון בתוך וילה": וילות האירוח הכי יפות בישראל',
    excerpt:
      'מווילה אורבנית במרומי הגליל דרך מבנה צלבני מהמאה ה-11 ועד פנטזיה מדברית פראית – חמש וילות שמביאות בשורה עיצובית מרעננת, נוף מושלם ושקט חלומי',
    image: '/assets/gallery-al6-4034.jpg',
    href: 'https://www.mako.co.il/living-architecture/local/Article-eef60f9a841c581027.htm?Partner=makoApp',
  },
  {
    outlet: 'D+A',
    published: 'פורסם 02/23',
    title: 'צימר במתת: החוץ הוא הפנים',
    excerpt:
      "על רכס הר בהתמזגות עם נוף מרהיב, נמצא צימר 'וילטה' שהמשחק בין החוץ לפנים הוא כל מהותו. מפתחי ברזל גדולים מכניסים את הטבע פנימה ויחד עם תקרת עץ גבוהה יוצרים הרגשה פראית בחלל קטן.",
    image: '/assets/gallery-al6-3963.jpg',
    href: 'https://www.da-magazine.co.il/exterior-design/%D7%A2%D7%99%D7%A6%D7%95%D7%91-%D7%A4%D7%A0%D7%99%D7%9D-%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99/%D7%A6%D7%99%D7%9E%D7%A8-%D7%91%D7%9E%D7%AA%D7%AA-%D7%94%D7%97%D7%95%D7%A5-%D7%94%D7%95%D7%90-%D7%94%D7%A4%D7%A0%D7%99%D7%9D/',
  },
]
