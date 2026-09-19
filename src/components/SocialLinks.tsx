import { FaInstagram, FaWaze, FaYoutube } from 'react-icons/fa'
import { SOCIALS } from '../data/content'
import { useLanguage } from '../i18n/LanguageContext'

const socialLinks = [
  { href: SOCIALS.instagram, label: 'Instagram', Icon: FaInstagram },
  { href: SOCIALS.youtube, label: 'Youtube', Icon: FaYoutube },
  { href: SOCIALS.waze, label: 'Waze', Icon: FaWaze },
]

/** "Find us on" label plus the three social icons; inherits the text colour. */
export default function SocialLinks() {
  const {
    data: {
      content: { FOOTER },
    },
  } = useLanguage()

  return (
    <div className="text-center">
      <p className="font-medium">{FOOTER.socialLabel}</p>
      <ul className="mt-3 flex justify-center gap-6">
        {socialLinks.map(({ href, label, Icon }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
              <Icon size={22} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
