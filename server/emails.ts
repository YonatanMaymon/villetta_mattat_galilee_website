import { nightsBetween } from '../shared/dates'
import { formatShekels } from '../shared/money'
import { PHONE_DISPLAY, PHONE_HREF } from '../src/data/content'
import type { BookingRequest, ContactRequest, Lang } from '../shared/reservation'
import type { CardResult } from './cardcom'
import type { Hold } from './holds'
import type { OutgoingMail } from './mail'

// Owner emails are in Hebrew whatever language the guest used. The guest's own copy follows their language.

export const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Guest text must never break the subject line or the HTML. */
export const oneLine = (value: string) => value.replace(/[\r\n\t]+/g, ' ').trim()

const LANG_NAMES: Record<Lang, string> = { he: 'עברית', en: 'אנגלית' }

export function formatDate(iso: string, lang: Lang = 'he'): string {
  return new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`))
}

const nightsHe = (n: number) => (n === 1 ? 'לילה אחד' : `${n} לילות`)
const nightsEn = (n: number) => (n === 1 ? '1 night' : `${n} nights`)
const shekels = (amount: number) => `₪${formatShekels(amount)}`

export interface Row {
  label: string
  value: string
  /** Turns the value into a link in the HTML version. */
  href?: string
}

export function render(
  title: string,
  rows: Row[],
  footer: string,
  dir: 'rtl' | 'ltr' = 'rtl',
  /** Paragraphs shown between the title and the table. */
  intro: string[] = [],
): Pick<OutgoingMail, 'html' | 'text'> {
  const text = [title, '', ...intro.flatMap((p) => [p, '']), ...rows.map((r) => `${r.label}: ${r.value}`), '', footer]
    .join('\n')
  const htmlIntro = intro.map((p) => `<p style="margin:0 0 12px">${escapeHtml(p)}</p>`).join('')
  const htmlRows = rows
    .map((r) => {
      const value = escapeHtml(r.value).replace(/\n/g, '<br>')
      const cell = r.href ? `<a href="${escapeHtml(r.href)}">${value}</a>` : value
      return `<tr><td style="padding:4px 16px;color:#666;vertical-align:top">${escapeHtml(r.label)}</td><td style="padding:4px 0">${cell}</td></tr>`
    })
    .join('')
  const html = `<div dir="${dir}" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111"><h2 style="margin:0 0 12px">${escapeHtml(title)}</h2>${htmlIntro}<table style="border-collapse:collapse">${htmlRows}</table><p style="margin-top:20px;color:#666">${escapeHtml(footer)}</p></div>`
  return { text, html }
}

function guestRows(request: { name: string; phone: string; email?: string; lang: Lang }): Row[] {
  const rows: Row[] = [
    { label: 'שם', value: request.name },
    { label: 'טלפון', value: request.phone, href: `tel:${request.phone.replace(/[^\d+]/g, '')}` },
  ]
  if (request.email) rows.push({ label: 'אימייל', value: request.email, href: `mailto:${request.email}` })
  rows.push({ label: 'שפת האתר', value: LANG_NAMES[request.lang] })
  return rows
}

type SavedCard = Extract<CardResult, { saved: true }>

/** The card Cardcom saved, or `unavailable`: Cardcom failed, so the booking went ahead without a card. */
export type CardStatus = Pick<SavedCard, 'holder' | 'expiry'> | 'unavailable'

export interface BookingMailInput {
  request: Pick<BookingRequest, 'name' | 'email' | 'phone' | 'arrival' | 'departure' | 'lang'>
  ref: string
  amount: number
  /** Absent when Cardcom is not set up. */
  card?: CardStatus
}

function cardRow(card: CardStatus): string {
  if (card === 'unavailable') return 'טופס הכרטיס של Cardcom לא נפתח (תקלה). יש לקבל את פרטי הכרטיס טלפונית.'
  const owner = card.holder.name || '-'
  return `נשמר ב-Cardcom כטוקן (בעל הכרטיס: ${owner}, תוקף: ${card.expiry}). לא בוצע חיוב; אפשר לחייב מממשק Cardcom לפי מספר ההזמנה.`
}

/** To the owner, once the reservation is in Smoobu and the dates are blocked: nothing to enter by hand. */
export function ownerBookingMail({ request, ref, amount, card }: BookingMailInput): OutgoingMail {
  const nights = nightsBetween(request.arrival, request.departure)
  const rows: Row[] = [
    ...guestRows(request),
    { label: 'הגעה', value: formatDate(request.arrival) },
    { label: 'עזיבה', value: formatDate(request.departure) },
    { label: 'לילות', value: nightsHe(nights) },
    { label: 'מחיר', value: shekels(amount) },
    { label: 'מספר הזמנה', value: ref },
  ]
  if (card) rows.push({ label: 'כרטיס אשראי', value: cardRow(card) })

  return {
    subject: oneLine(`הזמנה חדשה: ${request.name}, ${request.arrival} עד ${request.departure}`),
    ...render(
      'הזמנה חדשה מהאתר',
      rows,
      'ההזמנה נרשמה ב-Smoobu והתאריכים חסומים. אם ההזמנה לא יוצאת לפועל, מחקו אותה ב-Smoobu כדי לפנות את התאריכים.',
    ),
    replyTo: request.email || undefined,
  }
}

function stayRows({ request, ref, amount }: BookingMailInput): Row[] {
  const nights = nightsBetween(request.arrival, request.departure)
  return request.lang === 'he'
    ? [
        { label: 'הגעה', value: formatDate(request.arrival, 'he') },
        { label: 'עזיבה', value: formatDate(request.departure, 'he') },
        { label: 'לילות', value: nightsHe(nights) },
        { label: 'מחיר', value: shekels(amount) },
        { label: 'מספר הזמנה', value: ref },
      ]
    : [
        { label: 'Arrival', value: formatDate(request.arrival, 'en') },
        { label: 'Departure', value: formatDate(request.departure, 'en') },
        { label: 'Nights', value: nightsEn(nights) },
        { label: 'Price', value: shekels(amount) },
        { label: 'Reference', value: ref },
      ]
}

const DEPOSIT_HE =
  'כרטיס האשראי משמש כפיקדון לביטחון בלבד, ולא יחויב אלא במקרה של נזק או ביטול מאוחר לפי מדיניות הביטול.'
const DEPOSIT_EN =
  'The credit card is a security deposit only, and is not charged unless there is damage or a late ' +
  'cancellation under the cancellation policy.'

/**
 * To the guest, in their language, when the hold runs out without a card: nothing was booked. Their only
 * email about a booking they did not finish.
 */
export function guestUnfinishedMail({ guest, arrival, departure, ref }: Hold): OutgoingMail {
  const he = guest.lang === 'he'
  const phone = { value: PHONE_DISPLAY, href: PHONE_HREF }
  const rows: Row[] = he
    ? [
        { label: 'הגעה', value: formatDate(arrival, 'he') },
        { label: 'עזיבה', value: formatDate(departure, 'he') },
        { label: 'טלפון שלנו', ...phone },
      ]
    : [
        { label: 'Arrival', value: formatDate(arrival, 'en') },
        { label: 'Departure', value: formatDate(departure, 'en') },
        { label: 'Our phone', ...phone },
      ]
  return {
    to: guest.email,
    subject: he
      ? oneLine(`ההזמנה שלכם לא הושלמה (${ref})`)
      : oneLine(`Your booking was not completed (${ref})`),
    ...render(
      he ? 'ההזמנה שלכם לא הושלמה' : 'Your booking was not completed',
      rows,
      he ? 'מקווים לראות אתכם בקרוב.' : 'We hope to see you soon.',
      he ? 'rtl' : 'ltr',
      he
        ? [
            'התחלתם להזמין אצלנו, אבל לא הזנתם כרטיס אשראי, ולכן ההזמנה לא נקלטה והתאריכים לא שמורים לכם. ' +
              'לא בוצע חיוב.',
            'אם אתם עדיין רוצים להגיע, אפשר להזמין שוב באתר, או להתקשר אלינו ונשמח לעזור.',
          ]
        : [
            "You started a booking with us but didn't enter a credit card, so nothing was booked and the " +
              'dates are not held for you. Nothing has been charged.',
            'If you would still like to come, you can book again on the site, or call us and we will gladly ' +
              'help.',
          ],
    ),
  }
}

/**
 * To the owner, in plain Hebrew: a guest got as far as the card page and left without a card, so nothing
 * was booked. Sent when the hold runs out, so she can call them if she wants.
 */
export function unfinishedBookingMail({ guest, arrival, departure, ref }: Hold): OutgoingMail {
  const rows: Row[] = [
    ...guestRows(guest),
    { label: 'הגעה', value: formatDate(arrival) },
    { label: 'עזיבה', value: formatDate(departure) },
    { label: 'לילות', value: nightsHe(nightsBetween(arrival, departure)) },
    { label: 'מחיר', value: shekels(guest.amount) },
    { label: 'מספר הזמנה', value: ref },
  ]
  return {
    subject: oneLine(`אורח התחיל הזמנה באתר ולא סיים: ${guest.name}`),
    ...render(
      'אורח התחיל הזמנה באתר ולא סיים',
      rows,
      'הודעה זו נשלחה אוטומטית מהאתר.',
      'rtl',
      [
        'מה קרה: האורח בחר תאריכים ומילא את הפרטים שלו, אבל לא הזין כרטיס אשראי. לכן ההזמנה לא נקלטה, לא ' +
          'נרשמה ביומן, והתאריכים לא נשמרו עבורו.',
        'מה לעשות: אם תרצו, התקשרו לאורח ושאלו אם הוא עדיין מעוניין. אפשר לעזור לו לסיים את ההזמנה באתר, ' +
          'או לרשום אותה בטלפון.',
      ],
    ),
    replyTo: guest.email || undefined,
  }
}

/** To the guest, once the reservation is in Smoobu. */
export function guestConfirmedMail(mail: BookingMailInput): OutgoingMail {
  const { request, ref } = mail
  const he = request.lang === 'he'
  return {
    to: request.email,
    subject: he ? oneLine(`ההזמנה שלכם אושרה (${ref})`) : oneLine(`Your reservation is confirmed (${ref})`),
    ...render(
      he ? 'ההזמנה שלכם אושרה' : 'Your reservation is confirmed',
      stayRows(mail),
      he
        ? `התאריכים שמורים עבורכם. לא בוצע חיוב. ${DEPOSIT_HE}`
        : `Your dates are booked. Nothing has been charged. ${DEPOSIT_EN}`,
      he ? 'rtl' : 'ltr',
    ),
  }
}

/**
 * To the owner: the guest saved a card, but by then the dates had gone elsewhere (another booking site, or
 * a block in the calendar), so nothing was booked. All in plain Hebrew, ending with what to do.
 */
export function cardWithoutBookingMail({ booking, holder }: SavedCard): OutgoingMail {
  const rows: Row[] = [
    ...guestRows({ ...holder, lang: booking.lang }),
    { label: 'הגעה', value: formatDate(booking.arrival) },
    { label: 'עזיבה', value: formatDate(booking.departure) },
    { label: 'מספר הזמנה', value: booking.ref },
  ]
  return {
    subject: oneLine(`הזמנה מהאתר לא נקלטה, התאריכים נתפסו: ${holder.name || booking.ref}`),
    ...render(
      'הזמנה מהאתר לא נקלטה: התאריכים נתפסו',
      rows,
      'הודעה זו נשלחה אוטומטית מהאתר.',
      'rtl',
      [
        'מה קרה: האורח בחר תאריכים באתר והזין כרטיס אשראי. בדיוק באותן דקות התאריכים נתפסו: מישהו הזמין ' +
          'אותם דרך אתר הזמנות אחר, או שהם נחסמו ביומן. לכן ההזמנה של האורח לא נקלטה ולא נרשמה ביומן. ' +
          'לא ירד ממנו כסף.',
        'מה לעשות: התקשרו לאורח, הסבירו שהתאריכים שבחר נתפסו, ועזרו לו להזמין תאריכים אחרים.',
      ],
    ),
    replyTo: holder.email || undefined,
  }
}

/**
 * To the guest, in their language: the dates went to someone else while they typed their card, so the
 * booking did not go through. Nothing was charged; they are asked to get in touch.
 */
export function guestDatesTakenMail({ booking }: SavedCard, email: string): OutgoingMail {
  const he = booking.lang === 'he'
  const phone = { value: PHONE_DISPLAY, href: PHONE_HREF }
  const rows: Row[] = he
    ? [
        { label: 'הגעה', value: formatDate(booking.arrival, 'he') },
        { label: 'עזיבה', value: formatDate(booking.departure, 'he') },
        { label: 'מספר הזמנה', value: booking.ref },
        { label: 'טלפון שלנו', ...phone },
      ]
    : [
        { label: 'Arrival', value: formatDate(booking.arrival, 'en') },
        { label: 'Departure', value: formatDate(booking.departure, 'en') },
        { label: 'Reference', value: booking.ref },
        { label: 'Our phone', ...phone },
      ]
  return {
    to: email,
    subject: he
      ? oneLine(`הייתה בעיה בהזמנה שלכם (${booking.ref})`)
      : oneLine(`There was a problem with your booking (${booking.ref})`),
    ...render(
      he ? 'הייתה בעיה בהזמנה שלכם' : 'There was a problem with your booking',
      rows,
      he ? 'מצטערים על אי-הנעימות.' : 'We are sorry for the trouble.',
      he ? 'rtl' : 'ltr',
      he
        ? [
            'בזמן שהזנתם את פרטי הכרטיס, התאריכים שבחרתם הוזמנו על ידי מישהו אחר, ולכן ההזמנה לא נקלטה. ' +
              'לא בוצע חיוב.',
            'צרו איתנו קשר ונשמח לעזור לכם למצוא תאריכים אחרים.',
          ]
        : [
            'While you were entering your card details, the dates you chose were booked by someone else, so ' +
              'your booking did not go through. Nothing has been charged.',
            'Please contact us and we will gladly help you find other dates.',
          ],
    ),
  }
}

export function contactMail(request: ContactRequest): OutgoingMail {
  const rows: Row[] = [...guestRows(request), { label: 'הודעה', value: request.message }]
  return {
    subject: oneLine(`הודעה חדשה מהאתר: ${request.name}`),
    ...render('הודעה חדשה מטופס יצירת הקשר', rows, 'נשלח מהאתר.'),
    replyTo: request.email || undefined,
  }
}
