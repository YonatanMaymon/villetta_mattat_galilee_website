import { FaWhatsapp } from 'react-icons/fa'
import { useLanguage } from '../i18n/LanguageContext'

/**
 * Floating WhatsApp chat with Sharon, on the side opposite the accessibility link in both languages and at
 * its height. Any lower, it would cover the start of the footer's copyright line on phones.
 */
export default function WhatsAppButton() {
  const {
    t,
    data: {
      content: { WHATSAPP_HREF },
    },
  } = useLanguage()

  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp}
      className="fixed bottom-16 start-4 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition hover:scale-105"
    >
      <FaWhatsapp size={32} aria-hidden />
    </a>
  )
}
