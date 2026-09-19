import SocialLinks from './SocialLinks'
import { useLanguage } from '../i18n/LanguageContext'

interface FooterCtaProps {
  onBook: () => void
}

export default function FooterCta({ onBook }: FooterCtaProps) {
  const {
    t,
    data: {
      content: { FOOTER },
    },
  } = useLanguage()

  return (
    <footer
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center px-4 text-center text-white"
      style={{ backgroundImage: 'url(/assets/background-section.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10">
        <p dir="ltr" className="font-script text-[76px] leading-[0.8] sm:text-[155px]">
          {FOOTER.script}
        </p>
        <h2 className="-mt-2 text-4xl font-normal sm:mt-14 sm:text-5xl">{FOOTER.title}</h2>
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

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center justify-between gap-1 px-4 pb-3 text-xs sm:flex-row sm:px-6">
        <p>{FOOTER.copyright}</p>
        <a href={FOOTER.credit.href} target="_blank" rel="noopener noreferrer" dir="ltr">
          {FOOTER.credit.text}
        </a>
      </div>
    </footer>
  )
}
