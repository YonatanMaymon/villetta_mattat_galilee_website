import type { SliderImage } from './types'

export interface StoryChapter {
  kicker: string
  title: string
  paragraphs: string[]
  closing?: string
  images: SliderImage[]
  intervalMs: number
}

export const OUR_STORY_HERO = {
  image: '/assets/hello-world-al6-4231.jpg',
  title: 'הסיפור שלנו',
  subtitle: 'תחילתו של סיפור אהבה ממבט ראשון',
}

export const OUR_STORY_CHAPTERS: StoryChapter[] = [
  {
    kicker: 'תחילתו של סיפור',
    title: 'אהבה ממבט ראשון',
    paragraphs: [
      'את מצפה מתת הכרנו בשנת 2005.',
      'הגענו לצימר מקסים ופשוט, ומשם התחיל סיפור אהבה. כל שלושה חודשים הגענו לאותו צימר, לשלושה ימים, התנתקנו מהכול והתחברנו אחד לשני ולטבע.',
      'בשבילנו זה היה הניתוק הכי מחבר שיש. תמיד לחזור למתת. להתנתק כדי להתחבר.',
      'באמצע החיים, עם קריירות וארבעה ילדים נפלאים, "נחתה" עלינו לפתע, האפשרות לקנות חלקה יפה עם צמחיה סבוכה, בית ישן, מתפורר וקסום עליה. נוף שלא ראינו כמותו, בתוך מתת שכבר התאהבנו בה עמוקות.',
    ],
    images: [
      { src: '/assets/gallery-shot12.jpg', alt: 'זוג מתבונן בנוף הגליל בשקיעה' },
      { src: '/assets/background-section.jpg', alt: 'שולחן ושני כיסאות במרפסת מול הנוף' },
      { src: '/assets/gallery-al6-4210.jpg', alt: 'וילטה מתת גליל' },
      { src: '/assets/gallery-al6-3974.jpg', alt: 'וילטה מתת גליל' },
      { src: '/assets/home-al6-4063.jpg', alt: 'נדנדת ערסל מול הנוף' },
    ],
    intervalMs: 10000,
  },
  {
    kicker: 'לחיות קרוב יותר לטבע',
    title: 'בדיוק והרמוניה מופתיים',
    paragraphs: [
      'התחלנו לצייר ולתכנן איך המקום יראה. מצאנו את עצמינו מתמסרים לתהליך ולהר ובמשך ארבע וחצי שנים בנינו ויצרנו את הבית שלנו ואת בית אירוח המיוחד – וילטה מתת גליל .',
      'לצד הבית והוילטה, אנחנו מטפחים משק אוטרקי ובו כמה עיזים, גינת ירק, מטע מגוון עם כרם יפה, תאנים, דובדבנים, זיתים, תפוחים, רימונים, אגסים, עצי הדר ולאחרונה אף זרענו חיטה.',
      'אנחנו משתדלים להכין את כל האוכל מהיבול שגדל אצלינו ושמחים שיכולים להעניק אותו גם לכם.',
    ],
    closing: 'שמחים מכל הלב לארח אתכם במקום שזכינו להתארח בו בחיים האלו.',
    images: [
      { src: '/assets/gallery-11.jpg', alt: 'וילטה מתת גליל' },
      { src: '/assets/gallery-04.jpg', alt: 'וילטה מתת גליל' },
      { src: '/assets/gallery-al6-4233.jpg', alt: 'וילטה מתת גליל' },
      { src: '/assets/gallery-al6-3866.jpg', alt: 'וילטה מתת גליל' },
      { src: '/assets/gallery-al6-4085.jpg', alt: 'וילטה מתת גליל' },
      { src: '/assets/gallery-al6-4201.jpg', alt: 'וילטה מתת גליל' },
      { src: '/assets/gallery-villetapnim5.jpg', alt: 'וילטה מתת גליל' },
    ],
    intervalMs: 5000,
  },
]
