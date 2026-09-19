import { SOCIALS } from './content'

export const CONTACT_HERO = {
  image: '/assets/gallery-al6-4126.jpg',
  title: 'צור קשר',
  subtitle: 'שמחים לארח אתכם במקום שזכינו להתארח בו',
}

export const CONTACT_DETAILS = {
  phone: { label: 'טלפון', value: '052-4560554', href: 'tel:+972524560554', note: 'שרון מימון' },
  email: {
    label: 'אימייל',
    value: 'villetta@mattat-galilee.co.il',
    href: 'mailto:villetta@mattat-galilee.co.il',
  },
  // The original's link is malformed ("mailto:https://www.waze..."); this points straight at Waze.
  address: { label: 'כתובתנו', value: '"וילטה מתת גליל" בוויז', href: SOCIALS.waze },
}

export const CONTACT_FORM = {
  title: 'שלחו לנו מייל',
  subtitle: 'מלאו את הפרטים ונחזור אליכם בהקדם',
}
