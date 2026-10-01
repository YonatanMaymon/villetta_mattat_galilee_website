import { Link } from 'react-router-dom'
import SocialLinks from './SocialLinks'
import { useLanguage } from '../i18n/LanguageContext'
import { largestWebp } from '../lib/images'

interface FooterCtaProps {
  onBook: () => void
}

const BACKGROUND = largestWebp('/assets/background-section.jpg')

export default function FooterCta({ onBook }: FooterCtaProps) {
  const {
    t,
    localize,
    data: {
      content: { FOOTER, FOOTER_LINKS },
    },
  } = useLanguage()

  return (
    <footer
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center px-4 text-center text-white"
      style={{ backgroundImage: `url(${BACKGROUND})` }}
    >
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10">
        <p dir="ltr" className="font-script text-[76px] leading-[0.8] sm:text-[155px]">
          {FOOTER.script}
        </p>
        <h2 className="mt-7 text-4xl font-normal sm:mt-14 sm:text-5xl">{FOOTER.title}</h2>
        <p className="mt-6 text-xl">{FOOTER.subtitle}</p>
        <button
          type="button"
          onClick={onBook}
          className="mt-8 cursor-pointer border-2 border-white px-6 py-2 text-lg transition hover:bg-white hover:text-black"
        >
          {t.book}
        </button>

        <div className="mt-10">
          <SocialLinks />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 pb-3 text-xs sm:px-6">
        {/* The prerendered page carries the build year; in a new year before the next deploy, the browser's
            would differ, and React would otherwise report a hydration mismatch. */}
        <p suppressHydrationWarning>{FOOTER.copyright}</p>
        {FOOTER_LINKS.map((link) => (
          <Link key={link.href} to={localize(link.href)} className="cursor-pointer underline-offset-2 hover:underline">
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  )
}
