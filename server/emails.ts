import { nightsBetween } from '../shared/dates'
import type { BookingRequest, ContactRequest, Lang } from '../shared/reservation'
import type { OutgoingMail } from './mail'

// Owner emails are in Hebrew whatever language the guest used. The guest's own copy follows their language.

export const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Guest text must never break the subject line or the HTML. */
export const oneLine = (value: string) => value.replace(/[\r\n\t]+/g, ' ').trim()

const LANG_NAMES: Record<Lang, string> = { he: 'עברית', en: 'English' }

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
const shekels = (amount: number) => `₪${amount.toLocaleString('en-US')}`

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
): Pick<OutgoingMail, 'html' | 'text'> {
  const text = [title, '', ...rows.map((r) => `${r.label}: ${r.value}`), '', footer].join('\n')
  const htmlRows = rows
    .map((r) => {
      const value = escapeHtml(r.value).replace(/\n/g, '<br>')
      const cell = r.href ? `<a href="${escapeHtml(r.href)}">${value}</a>` : value
      return `<tr><td style="padding:4px 16px;color:#666;vertical-align:top">${escapeHtml(r.label)}</td><td style="padding:4px 0">${cell}</td></tr>`
    })
    .join('')
  const html = `<div dir="${dir}" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111"><h2 style="margin:0 0 12px">${escapeHtml(title)}</h2><table style="border-collapse:collapse">${htmlRows}</table><p style="margin-top:20px;color:#666">${escapeHtml(footer)}</p></div>`
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

export interface BookingMailInput {
  request: BookingRequest
  ref: string
  amount: number
}

/**
 * To the owner. The reservation is already in Smoobu and the dates are blocked, so this is a prompt to
 * phone the guest and confirm, not a request to enter anything by hand.
 */
export function ownerBookingMail({ request, ref, amount }: BookingMailInput): OutgoingMail {
  const nights = nightsBetween(request.arrival, request.departure)
  const rows: Row[] = [
    ...guestRows(request),
    { label: 'הגעה', value: formatDate(request.arrival) },
    { label: 'עזיבה', value: formatDate(request.departure) },
    { label: 'לילות', value: nightsHe(nights) },
    { label: 'מחיר', value: shekels(amount) },
    { label: 'מספר בקשה', value: ref },
  ]

  return {
    subject: oneLine(`בקשת הזמנה חדשה: ${request.name}, ${request.arrival} עד ${request.departure}`),
    ...render(
      'בקשת הזמנה חדשה מהאתר',
      rows,
      'ההזמנה כבר נרשמה ב-Smoobu והתאריכים חסומים, מסומנת "ממתין לאישור". התקשרו לאורח לאישור סופי, ואם ההזמנה לא יוצאת לפועל — מחקו אותה ב-Smoobu כדי לפנות את התאריכים.',
    ),
    replyTo: request.email || undefined,
  }
}

/** To the guest: their reference, and a clear statement that nothing is final and nothing was charged. */
export function guestBookingMail({ request, ref, amount }: BookingMailInput): OutgoingMail {
  const nights = nightsBetween(request.arrival, request.departure)
  const he = request.lang === 'he'

  const rows: Row[] = he
    ? [
        { label: 'הגעה', value: formatDate(request.arrival, 'he') },
        { label: 'עזיבה', value: formatDate(request.departure, 'he') },
        { label: 'לילות', value: nightsHe(nights) },
        { label: 'מחיר', value: shekels(amount) },
        { label: 'מספר בקשה', value: ref },
      ]
    : [
        { label: 'Arrival', value: formatDate(request.arrival, 'en') },
        { label: 'Departure', value: formatDate(request.departure, 'en') },
        { label: 'Nights', value: nightsEn(nights) },
        { label: 'Price', value: shekels(amount) },
        { label: 'Reference', value: ref },
      ]

  return {
    to: request.email,
    subject: he ? oneLine(`בקשת ההזמנה שלכם בוילטה מתת (${ref})`) : oneLine(`Your booking request at Villetta Mattat (${ref})`),
    ...render(
      he ? 'קיבלנו את בקשת ההזמנה' : 'We received your booking request',
      rows,
      he
        ? 'התאריכים שמורים עבורכם ונחזור אליכם טלפונית לאישור סופי. לא בוצע חיוב. כרטיס אשראי יתבקש לפני ההגעה כפיקדון לביטחון בלבד, ולא יחויב אלא במקרה של נזק.'
        : 'Your dates are held and we will call you to confirm. Nothing has been charged. A credit card will be requested before arrival as a security deposit only, and is not charged unless there is damage.',
      he ? 'rtl' : 'ltr',
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
