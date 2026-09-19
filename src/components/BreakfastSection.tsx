import { Fragment } from 'react'
import ImageSlider from './ImageSlider'
import SectionHeading from './SectionHeading'
import { BREAKFAST } from '../data/food'

export default function BreakfastSection() {
  return (
    <section id="content" className="scroll-mt-20 bg-linen-texture px-4 py-20 sm:px-[5%] sm:py-[90px]">
      <SectionHeading title={BREAKFAST.title}>
        <p className="mt-3 text-[22px] font-light">{BREAKFAST.subtitle}</p>
      </SectionHeading>

      <div className="mx-auto mt-8 max-w-[1400px] border border-neutral-200/80 bg-white p-6 shadow-[0_0_0_3px_rgba(255,255,255,0.55)] sm:p-[42px]">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-[90px]">
          {/* Copy on the right, slider on the left (RTL). */}
          <div className="space-y-[14px] text-[15px] leading-6 text-neutral-900">
            {BREAKFAST.paragraphs.map((lines) => (
              <p key={lines[0]}>
                {lines.map((line, i) => (
                  <Fragment key={line}>
                    {i > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </p>
            ))}
          </div>
          <ImageSlider
            images={BREAKFAST.images}
            intervalMs={BREAKFAST.intervalMs}
            label={BREAKFAST.title}
            aspectClassName="aspect-[616/500]"
          />
        </div>
      </div>
    </section>
  )
}
