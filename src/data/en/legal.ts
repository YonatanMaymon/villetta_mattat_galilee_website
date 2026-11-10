import {
  ACCESSIBILITY as HE_ACCESSIBILITY,
  PRIVACY_POLICY as HE_PRIVACY,
  TERMS as HE_TERMS,
  type LegalPage,
} from '../legal'

export const ACCESSIBILITY: LegalPage = {
  hero: {
    image: HE_ACCESSIBILITY.hero.image,
    title: 'Accessibility Statement',
    subtitle: 'We want everyone to feel at home here, on the website too',
  },
  updated: '1 October 2026',
  sections: [
    {
      title: 'Our commitment',
      paragraphs: [
        'We want every guest, including people with disabilities, to be able to read about the Villetta, ' +
          'check free dates and book with ease. So we built the website to work with a keyboard, with a ' +
          'screen reader and on all kinds of devices.',
      ],
    },
    {
      title: 'Accessibility settings',
      paragraphs: [
        'The video at the top of the home page, the photo galleries and the testimonials move by ' +
          'themselves. Tick the box to always show a pause button on them. Your choice is saved in this ' +
          'browser only.',
      ],
      setting: 'pauseButtons',
    },
    {
      title: 'Accessibility level',
      paragraphs: [
        'The website aims to meet the Israeli Equal Rights for Persons with Disabilities (Service ' +
          'Accessibility Adjustments) Regulations, 2013, and Israeli Standard 5568, which is based on the ' +
          'WCAG 2.0 guidelines at level AA.',
      ],
    },
    {
      title: 'What we have done',
      paragraphs: [],
      items: [
        'The whole site can be used with a keyboard, with a clear mark on the element in focus.',
        'Everything that moves by itself, such as the video at the top of the home page, the photo ' +
          'galleries and the testimonials, has a pause button. The button appears when you reach it with ' +
          'the keyboard, and the accessibility settings on this page can show it at all times. The ' +
          'galleries and testimonials also pause while the pointer is over them, and if you have asked ' +
          'your device to reduce motion, all of them start paused.',
        'Pop-up windows such as the booking form keep the keyboard inside them, close with the Esc key, ' +
          'and return focus to where they were opened from.',
        'Photos that carry information have text alternatives, and every button has a name a screen ' +
          'reader can read out.',
        'Pages have an orderly heading structure, and read right to left in Hebrew and left to right in ' +
          'English.',
        "The layout adapts to the screen size, and text can be enlarged with the browser's zoom.",
      ],
    },
    {
      title: 'What is not fully accessible yet',
      paragraphs: [
        'The security check on the booking form (Cloudflare Turnstile) and the full video (YouTube) come ' +
          'from outside providers, and their accessibility is not in our hands. If anything on the site ' +
          'is hard to use, including the date calendar, you can always book or ask by phone or WhatsApp.',
      ],
    },
    {
      title: 'Accessibility at the Villetta',
      paragraphs: [
        'The Villetta is partly accessible. Before booking, call us and we will gladly describe the ' +
          'access to the parking, the entrance, the bathroom and the bedroom, and see how to fit your ' +
          'stay to your needs.',
      ],
    },
    {
      title: 'Contact us about accessibility',
      paragraphs: [
        'Found a problem, or have a suggestion? We would be glad to hear it and put it right. Please ' +
          'get in touch:',
      ],
      contact: true,
    },
  ],
}

export const PRIVACY_POLICY: LegalPage = {
  hero: {
    image: HE_PRIVACY.hero.image,
    title: 'Privacy Policy',
    subtitle: 'What happens to the details you leave with us',
  },
  updated: '10 November 2026',
  sections: [
    {
      title: 'In short',
      paragraphs: [
        'We collect only what we need to handle your booking or message, and use it only for that. Your ' +
          'details are not passed on to any third party, except the service providers that run the site for ' +
          'us (see "Who receives it"), or where the law requires it. We never sell them. You are not legally required to give us any details, but without your name ' +
          'and a way to reach you we cannot handle a booking or get back to you.',
      ],
    },
    {
      title: 'What we collect',
      paragraphs: [],
      items: [
        'Bookings: full name, phone, email and the dates of the stay.',
        "A credit card for the deposit, at the end of a booking: typed straight into Cardcom's secure " +
          "form, never passing through the site. We see only the cardholder's name and the expiry date.",
        'The contact form: full name, phone, email (optional) and your message.',
        'Aggregate browsing data: which pages were viewed, from what kind of device and from which ' +
          'country. It is collected without cookies and without identifying you.',
      ],
    },
    {
      title: 'Why we use it',
      paragraphs: [
        'To record your booking, email you about its status and arrange your stay, answer messages, ' +
          'and see which pages of the site are useful. If you start a booking but do not enter a credit ' +
          'card, the details you filled in are kept for 15 minutes and then sent to us, so we can get back ' +
          'to you about the booking, and we email you that it was not completed. We will not send you ' +
          'marketing email without your consent.',
      ],
    },
    {
      title: 'Who receives it',
      paragraphs: [
        'The service providers the site runs on, each only as far as it needs. Some of them keep data ' +
          'on servers outside Israel.',
      ],
      items: [
        'Smoobu, our booking system: keeps the booking.',
        'Resend, an email service: sends us your booking or message, and sends you emails about your ' +
          'booking (confirmed, not completed, or that there was a problem with it).',
        'Cardcom, an Israeli card processor: checks the credit card and keeps it for the deposit, so we ' +
          'can charge it only for damage or a late cancellation. It also receives the name, phone and ' +
          'email you entered, so they are filled in on the card form.',
        'Cloudflare: hosts the site, runs the security check on the forms (Turnstile) and measures ' +
          'aggregate browsing (Web Analytics).',
      ],
    },
    {
      title: 'Cookies and browser storage',
      paragraphs: [
        'The site does not use cookies for advertising or tracking. If you choose to show the pause ' +
          'buttons (in the settings in the accessibility statement), that choice is saved in your browser ' +
          'only and is never sent to us.',
      ],
    },
    {
      title: 'How long we keep it',
      paragraphs: [
        'Booking details stay in our booking system for as long as we need them to manage the stay and ' +
          'for our accounting obligations. Messages from the contact form stay in our email inbox.',
      ],
    },
    {
      title: 'Your rights',
      paragraphs: [
        'Under the Israeli Protection of Privacy Law, you may see the information we hold about you and ' +
          'ask us to correct or delete it. For such a request, or any question about this policy, ' +
          'contact us:',
      ],
      contact: true,
    },
  ],
}

export const TERMS: LegalPage = {
  hero: {
    image: HE_TERMS.hero.image,
    title: 'Terms and Conditions',
    subtitle: 'The terms of booking and staying at the Villetta',
  },
  updated: '10 November 2026',
  sections: [
    {
      title: 'General',
      paragraphs: [
        'This website and its bookings are run by Sharon Mimon, a registered business (osek murshe) trading ' +
          'as "Villa Mattat Galil" ("the Villetta"), Mattat, Western Galilee.',
        'These terms are an integral part of every booking made on the site. Before confirming a booking ' +
          'you will be asked to confirm that you have read and accept them.',
      ],
    },
    {
      title: 'The service and booking',
      paragraphs: [
        'The Villetta offers a stay in a private villa, as described on this site. In the booking form you ' +
          'pick free dates on the calendar and leave your name, phone and email. The total price of the ' +
          'stay, according to the price list on the site, is shown before you confirm.',
        'Payment for the stay is made on arrival. To secure the booking we ask for credit card details as ' +
          "a deposit, in the secure form of the card processor Cardcom or by phone. The card is not charged " +
          'when you book, and is charged only if the Villetta is damaged, or for a late cancellation under ' +
          'the cancellation policy below.',
      ],
    },
    {
      title: 'Service delivery policy',
      paragraphs: [
        'The booking confirmation, with your reference number and the details of the stay, is emailed to ' +
          'you as soon as the booking is received, within minutes.',
        'The service is given on the dates booked: from the day of arrival until the day of departure, which ' +
          'is the day after the last night. Arrival and departure times are arranged with you before you ' +
          'arrive.',
        'If the dates were taken while you were booking, for example through another booking site, the ' +
          'booking is not made, nothing is charged, and we let you know by email.',
      ],
    },
    {
      title: 'Who can stay: age limit',
      paragraphs: [
        'The Villetta is for couples only: two guests, aged 18 or over. We do not host children or babies, ' +
          'and pets are not allowed.',
      ],
    },
    {
      title: 'Cancellation policy',
      paragraphs: [
        'Cancellations are governed by the Israeli Consumer Protection Law, 5741-1981, and the Consumer ' +
          'Protection (Cancellation of Transaction) Regulations, 5771-2010, and nothing here limits your ' +
          'rights under them. You can cancel by phone, WhatsApp or email (details at the end of these terms).',
        'Cancellation charges:',
      ],
      items: [
        'Cancel up to 8 days before arrival: no charge.',
        'Cancel 4 to 7 days before arrival: 50% of the price of the stay.',
        'Cancel 3 days or less before arrival, or no-show: the full price.',
        'If other guests rebook the dates, the charge is cancelled or refunded in full.',
        'If Home Front Command instructions or the security situation prevent the stay, cancellation is free.',
      ],
    },
    {
      title: 'Privacy',
      paragraphs: [
        'Your personal details are not passed on to any third party, except the service providers that run ' +
          'bookings for us (the booking system, the email service, the card processor and the site host), ' +
          'each only as far as it needs to handle the booking, or where the law requires it. We never sell ' +
          'your details, and we will not send you marketing email without your consent.',
      ],
      link: { label: 'Read the full privacy policy', href: '/privacy' },
    },
    {
      title: 'Contact',
      paragraphs: ['For questions, or to change or cancel a booking:'],
      contact: true,
    },
  ],
}
