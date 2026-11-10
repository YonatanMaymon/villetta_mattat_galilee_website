import { SOCIALS, WHATSAPP_HREF } from './content'

export const CONTACT_HERO = {
  image: '/assets/gallery-al6-4126.jpg',
  title: 'צור קשר',
  subtitle: 'שמחים לארח אתכם במקום שזכינו להתארח בו',
}

export const CONTACT_DETAILS = {
  phone: { label: 'טלפון', value: '052-4560554', href: 'tel:+972524560554', note: 'שרון מימון' },
  whatsapp: { label: 'וואטסאפ', value: 'שלחו לנו הודעה', href: WHATSAPP_HREF },
  email: {
    label: 'אימייל',
    value: 'villetta@mattat-galilee.co.il',
    href: 'mailto:villetta@mattat-galilee.co.il',
  },
  // The card acquirer asks for the business's name and address on the contact page (as registered for VAT).
  business: { label: 'בית העסק', value: 'שרון מימון, עוסק מורשה ("וילה מתת גליל")' },
  // The village has no street addresses, so Waze is how guests find the way.
  address: { label: 'כתובתנו', value: 'מתת, הגליל המערבי', href: SOCIALS.waze, linkText: 'ניווט בוויז' },
}

export const CONTACT_FORM = {
  title: 'שלחו לנו מייל',
  subtitle: 'מלאו את הפרטים ונחזור אליכם בהקדם',
}
