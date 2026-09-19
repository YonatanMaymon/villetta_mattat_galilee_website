import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { useLanguage } from '../i18n/LanguageContext'

const AUTOPLAY_MS = 7000

const arrowClass =
  'mt-24 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-black text-white transition hover:bg-neutral-700'

export default function Testimonials() {
  const {
    t,
    dir,
    data: {
      content: { TESTIMONIALS },
    },
  } = useLanguage()
  const COUNT = TESTIMONIALS.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = () => setIndex((i) => (i + 1) % COUNT)
  const prev = () => setIndex((i) => (i - 1 + COUNT) % COUNT)

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % COUNT), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [paused, index, COUNT])

  // Kept as on the original for Hebrew; English follows the usual left = back, right = forward.
  const startArrow =
    dir === 'rtl'
      ? { onClick: next, label: t.previous, Icon: ChevronRight }
      : { onClick: prev, label: t.previous, Icon: ChevronLeft }
  const endArrow =
    dir === 'rtl'
      ? { onClick: prev, label: t.next, Icon: ChevronLeft }
      : { onClick: next, label: t.next, Icon: ChevronRight }

  return (
    <section
      className="bg-paper px-4 py-24"
      aria-roledescription="carousel"
      aria-label={t.testimonials}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <SectionHeading title={t.testimonials} />

      <div className="mx-auto mt-8 flex max-w-[1360px] items-start gap-4 sm:gap-8">
        <button type="button" onClick={startArrow.onClick} aria-label={startArrow.label} className={arrowClass}>
          <startArrow.Icon size={22} strokeWidth={1.5} />
        </button>

        <div className="grid flex-1 [&>*]:col-start-1 [&>*]:row-start-1">
          {TESTIMONIALS.map((item, i) => (
            <figure
              key={item.author}
              aria-hidden={i !== index}
              className={`mx-auto max-w-2xl text-center transition-opacity duration-500 ${i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
            >
              <h3 className="text-2xl font-light">{item.title}</h3>
              <blockquote className="mt-3 text-[15px] leading-6 text-neutral-800">{item.body}</blockquote>
              <figcaption className="mt-5 font-medium">{item.author}</figcaption>
            </figure>
          ))}
        </div>

        <button type="button" onClick={endArrow.onClick} aria-label={endArrow.label} className={arrowClass}>
          <endArrow.Icon size={22} strokeWidth={1.5} />
        </button>
      </div>

      <div dir="ltr" className="mt-12 flex justify-center gap-2" role="tablist" aria-label={t.chooseTestimonial}>
        {TESTIMONIALS.map((item, i) => (
          <button
            key={item.author}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={t.testimonialN(i + 1)}
            onClick={() => setIndex(i)}
            className="cursor-pointer py-2"
          >
            <span
              className={`block h-0.5 transition-all ${i === index ? 'w-10 bg-black' : 'w-5 bg-neutral-300'}`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
