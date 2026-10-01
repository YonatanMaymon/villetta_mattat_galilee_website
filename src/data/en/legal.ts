import { ACCESSIBILITY as HE_ACCESSIBILITY, PRIVACY_POLICY as HE_PRIVACY, type LegalPage } from '../legal'

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
  updated: '1 October 2026',
  sections: [
    {
      title: 'In short',
      paragraphs: [
        'We collect only what we need to handle your booking or message, use it only for that, and ' +
          'never sell it. You are not legally required to give us any details, but without your name ' +
          'and a way to reach you we cannot handle a booking or get back to you.',
      ],
    },
    {
      title: 'What we collect',
      paragraphs: [],
      items: [
        'Booking requests: full name, phone, email and the dates of the stay.',
        'The contact form: full name, phone, email (optional) and your message.',
        'Aggregate browsing data: which pages were viewed, from what kind of device and from which ' +
          'country. It is collected without cookies and without identifying you.',
      ],
    },
    {
      title: 'Why we use it',
      paragraphs: [
        'To record your booking request, call you to confirm it and arrange your stay, answer messages, ' +
          'and see which pages of the site are useful. We will not send you marketing email without ' +
          'your consent.',
      ],
    },
    {
      title: 'Who receives it',
      paragraphs: [
        'The service providers the site runs on, each only as far as it needs. Some of them keep data ' +
          'on servers outside Israel.',
      ],
      items: [
        'Smoobu, our booking system: keeps the booking request.',
        'Resend, an email service: sends us your request or message, and sends you the confirmation ' +
          'that we received your request.',
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
