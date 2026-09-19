import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { useLanguage } from '../i18n/LanguageContext'

export default function StorySection() {
  const {
    t,
    dir,
    localize,
    data: {
      content: { STORY },
    },
  } = useLanguage()
  const rtl = dir === 'rtl'
  const Arrow = rtl ? ArrowLeft : ArrowRight

  return (
    <section id="content" className="scroll-mt-20 bg-linen-texture px-4 py-24">
      <SectionHeading title={STORY.title}>
        <p className="mx-auto mt-4 max-w-2xl text-2xl font-light leading-snug">{STORY.lead}</p>
      </SectionHeading>
      <p className="mx-auto mt-6 max-w-[640px] text-center text-[15px] leading-6 text-neutral-700">
        {STORY.body.join(' ')}
      </p>
      <div className="mt-6 text-center">
        <Link
          to={localize(STORY.href)}
          className={`inline-flex items-center gap-3 border-b border-black pb-1 text-base ${rtl ? '' : 'flex-row-reverse'}`}
        >
          <Arrow size={16} strokeWidth={1.5} />
          {t.readMore}
        </Link>
      </div>
    </section>
  )
}
