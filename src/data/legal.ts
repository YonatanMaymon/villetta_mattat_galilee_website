export interface LegalSection {
  title: string
  paragraphs: string[]
  /** A bulleted list, after the paragraphs. */
  items?: string[]
  /** A control the visitor can change, shown after the text (see src/pages/LegalPage.tsx). */
  setting?: 'pauseButtons'
  /** Ends the section with the contact name, phone and email (from CONTACT_DETAILS in ./contact). */
  contact?: boolean
}

export interface LegalPage {
  hero: { image: string; title: string; subtitle: string }
  /** When the text was last checked. Update it with every change to the page. */
  updated: string
  sections: LegalSection[]
}

/**
 * The accessibility statement that Israeli accessibility regulations require of a business website: what
 * was done, what is not accessible yet, the place itself, and whom to contact.
 */
export const ACCESSIBILITY: LegalPage = {
  hero: {
    image: '/assets/gallery-al6-4085.jpg',
    title: 'הצהרת נגישות',
    subtitle: 'רוצים שכל אחד ואחת ירגישו כאן בבית, גם באתר',
  },
  updated: '1 באוקטובר 2026',
  sections: [
    {
      title: 'המחויבות שלנו',
      paragraphs: [
        'חשוב לנו שכל אורח ואורחת, כולל אנשים עם מוגבלות, יוכלו לקרוא על הוילטה, לבדוק תאריכים פנויים ' +
          'ולהזמין בקלות. לכן בנינו את האתר כך שיהיה נוח לשימוש גם במקלדת, גם עם קורא מסך וגם ' +
          'במכשירים שונים.',
      ],
    },
    {
      title: 'הגדרות נגישות',
      paragraphs: [
        'הסרטון בראש העמוד הראשי, גלריות התמונות וההמלצות זזים מעצמם. סמנו כאן כדי להציג עליהם תמיד ' +
          'כפתור עצירה. הבחירה נשמרת בדפדפן הזה בלבד.',
      ],
      setting: 'pauseButtons',
    },
    {
      title: 'רמת הנגישות',
      paragraphs: [
        'האתר נבנה בשאיפה לעמוד בתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), ' +
          'התשע"ג-2013, ובתקן הישראלי ת"י 5568, המבוסס על הנחיות WCAG 2.0 ברמה AA.',
      ],
    },
    {
      title: 'מה עשינו באתר',
      paragraphs: [],
      items: [
        'אפשר לנווט בכל האתר במקלדת, ורואים בבירור על איזה רכיב נמצאים.',
        'לכל תוכן שזז מעצמו, כמו הסרטון בראש העמוד הראשי, גלריות התמונות וההמלצות, יש כפתור עצירה. ' +
          'הכפתור מופיע כשמגיעים אליו במקלדת, ואפשר להציג אותו תמיד בהגדרות הנגישות שבעמוד זה. ' +
          'הגלריות וההמלצות נעצרות גם כשמצביעים עליהן, ומי שביקשו מהמכשיר להפחית תנועה יקבלו את כולם ' +
          'עצורים מלכתחילה.',
        'חלונות קופצים, כמו טופס ההזמנה, שומרים את המקלדת בתוכם, נסגרים במקש Esc ומחזירים אותה למקום שממנו ' +
          'נפתחו.',
        'לתמונות שמוסרות מידע יש טקסט חלופי, ולכל כפתור יש שם שקורא מסך יכול להקריא.',
        'לעמודים מבנה כותרות מסודר, והם מוצגים מימין לשמאל בעברית ומשמאל לימין באנגלית.',
        'האתר מתאים את עצמו לגודל המסך, ואפשר להגדיל בו את הטקסט בכלי הדפדפן.',
      ],
    },
    {
      title: 'מה עוד לא נגיש במלואו',
      paragraphs: [
        'בדיקת האבטחה בטופס ההזמנה (Cloudflare Turnstile) והסרטון המלא (YouTube) מגיעים מספקים חיצוניים, ' +
          'והנגישות שלהם אינה בשליטתנו. אם משהו באתר אינו נוח לכם, כולל יומן התאריכים, אפשר תמיד להזמין ' +
          'ולשאול בטלפון או בוואטסאפ.',
      ],
    },
    {
      title: 'נגישות הוילטה',
      paragraphs: [
        // The owner prefers to give the details by phone, fitted to each guest.
        'הוילטה נגישה באופן חלקי. לפני ההזמנה, התקשרו אלינו ונשמח לפרט על הגישה לחניה, לכניסה, לחדר הרחצה ' +
          'ולחדר השינה, ולבדוק איך להתאים את השהייה לצרכים שלכם.',
      ],
    },
    {
      title: 'פנייה בנושא נגישות',
      paragraphs: ['נתקלתם בבעיה, או שיש לכם הצעה לשיפור? נשמח לשמוע ולתקן. לפניות בנושא נגישות:'],
      contact: true,
    },
  ],
}

/**
 * What the forms collect and where it goes, as the Privacy Protection Law asks for where personal details
 * are collected. The booking and contact forms link here. Keep the list of services in step with the code:
 * Smoobu (server/smoobu.ts), Resend (server/mail.ts), Cloudflare (hosting, Turnstile, Web Analytics).
 */
export const PRIVACY_POLICY: LegalPage = {
  hero: {
    image: '/assets/gallery-al6-4049.jpg',
    title: 'מדיניות פרטיות',
    subtitle: 'מה קורה עם הפרטים שאתם משאירים אצלנו',
  },
  updated: '1 באוקטובר 2026',
  sections: [
    {
      title: 'בקצרה',
      paragraphs: [
        'אנחנו אוספים רק את מה שנחוץ כדי לטפל בהזמנה או בפנייה שלכם, משתמשים בזה רק לשם כך, ולא מוכרים את ' +
          'זה לאף אחד. אין חובה חוקית למסור לנו פרטים, אבל בלי שם ודרך ליצור איתכם קשר לא נוכל לטפל בהזמנה ' +
          'או לחזור אליכם.',
      ],
    },
    {
      title: 'איזה מידע נאסף',
      paragraphs: [],
      items: [
        'בקשת הזמנה: שם מלא, טלפון, אימייל ותאריכי השהייה.',
        'טופס יצירת הקשר: שם מלא, טלפון, אימייל (לא חובה) וההודעה שכתבתם.',
        'נתוני גלישה מצטברים: אילו עמודים נצפו, מאיזה סוג מכשיר ומאיזו מדינה. הם נאספים בלי עוגיות ובלי ' +
          'לזהות אתכם אישית.',
      ],
    },
    {
      title: 'למה אנחנו משתמשים בו',
      paragraphs: [
        'כדי לרשום את בקשת ההזמנה, לחזור אליכם לאישורה ולתאם את השהייה, לענות על פניות, ולהבין אילו עמודים ' +
          'באתר שימושיים. לא נשלח לכם דיוור שיווקי בלי הסכמתכם.',
      ],
    },
    {
      title: 'למי המידע מועבר',
      paragraphs: [
        'לספקי השירות שהאתר פועל בעזרתם, לכל אחד רק מה שהוא צריך. חלקם שומרים מידע בשרתים מחוץ לישראל.',
      ],
      items: [
        'Smoobu, מערכת ניהול ההזמנות שלנו: שומרת את בקשת ההזמנה.',
        'Resend, שירות שליחת אימיילים: שולח אלינו את הבקשה או ההודעה, ואליכם את האישור שקיבלנו את הבקשה.',
        'Cloudflare: מארחת את האתר, מפעילה את בדיקת האבטחה בטפסים (Turnstile) ומודדת את הגלישה המצטברת ' +
          '(Web Analytics).',
      ],
    },
    {
      title: 'עוגיות ושמירה בדפדפן',
      paragraphs: [
        'האתר אינו משתמש בעוגיות לפרסום או למעקב. אם תבחרו להציג כפתורי עצירה (בהגדרות שבהצהרת ' +
          'הנגישות), הבחירה נשמרת בדפדפן שלכם בלבד ואינה נשלחת אלינו.',
      ],
    },
    {
      title: 'כמה זמן המידע נשמר',
      paragraphs: [
        'פרטי ההזמנה נשמרים במערכת ההזמנות כל עוד הם נחוצים לניהול השהייה ולחובות החשבונאיות שלנו. הודעות ' +
          'מטופס יצירת הקשר נשמרות בתיבת האימייל שלנו.',
      ],
    },
    {
      title: 'הזכויות שלכם',
      paragraphs: [
        'לפי חוק הגנת הפרטיות, אתם רשאים לעיין במידע שנשמר עליכם ולבקש לתקן אותו או למחוק אותו. לבקשה כזו, ' +
          'או לכל שאלה על מדיניות זו, פנו אלינו:',
      ],
      contact: true,
    },
  ],
}
