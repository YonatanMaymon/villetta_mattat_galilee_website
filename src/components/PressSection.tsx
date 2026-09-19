import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

export default function PressSection() {
  const {
    t,
    dir,
    data: {
      press: { PRESS_ARTICLES },
    },
  } = useLanguage()
  const rtl = dir === 'rtl'
  const Arrow = rtl ? ArrowLeft : ArrowRight

  return (
    <section id="content" className="scroll-mt-20 bg-linen-texture px-4 py-20 sm:px-[7%] sm:py-[90px]">
      <div className="mx-auto grid max-w-[1710px] gap-14 lg:grid-cols-2 lg:gap-[90px]">
        {PRESS_ARTICLES.map((a) => (
          <article key={a.href}>
            <img src={a.image} alt="" loading="lazy" className="aspect-[16/10.4] w-full object-cover" />
            <p className="mt-[18px] text-[13px] leading-5">
              {a.outlet} | {a.published}
            </p>
            <h2 className="mt-2 text-[26px] font-normal leading-tight">{a.title}</h2>
            <p className="mt-3 text-[15px] leading-6 text-neutral-700">{a.excerpt}</p>
            <a
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-5 inline-flex items-center gap-3 border-b border-black pb-1.5 text-base ${
                rtl ? '' : 'flex-row-reverse'
              }`}
            >
              <Arrow size={16} strokeWidth={1.5} aria-hidden />
              {t.readMore}
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
