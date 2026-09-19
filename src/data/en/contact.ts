import { CONTACT_DETAILS as HE_DETAILS, CONTACT_HERO as HE_HERO } from '../contact'

export const CONTACT_HERO = {
  image: HE_HERO.image,
  title: 'Contact Us',
  subtitle: 'We are happy to host you in a place where we were fortunate to be guests',
}

export const CONTACT_DETAILS = {
  phone: { ...HE_DETAILS.phone, label: 'Phone', note: 'Sharon Mimon' },
  email: { ...HE_DETAILS.email, label: 'Email' },
  address: { ...HE_DETAILS.address, label: 'Our Address', value: '"Villetta Mattat Galilee" on Waze' },
}

export const CONTACT_FORM = {
  title: 'Send Us an Email',
  subtitle: "Fill in your details and we'll get back to you shortly",
}
