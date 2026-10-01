import { Accessibility } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

/**
 * Floating link to the accessibility statement. The site is made accessible in its own markup rather than
 * by an overlay widget, so this only leads to the statement and the contact for accessibility issues.
 */
export default function AccessibilityButton() {
  const { t, localize } = useLanguage()

  return (
    <Link
      to={localize('/accessibility')}
      aria-label={t.accessibility}
      className="fixed bottom-16 end-0 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-s-full bg-[#1a1a2e] text-white shadow-lg"
    >
      <Accessibility size={28} strokeWidth={1.5} aria-hidden />
    </Link>
  )
}
