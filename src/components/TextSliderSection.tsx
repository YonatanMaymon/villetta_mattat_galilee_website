import type { ReactNode } from 'react'
import ImageSlider from './ImageSlider'
import SectionHeading from './SectionHeading'
import type { SliderImage } from '../data/types'

interface TextSliderSectionProps {
  id?: string
  title: string
  subtitle: string
  images: SliderImage[]
  intervalMs: number
  children: ReactNode
}

/** Linen section: heading, then a white card with copy on the right and a fading slider on the left. */
export default function TextSliderSection({
  id,
  title,
  subtitle,
  images,
  intervalMs,
  children,
}: TextSliderSectionProps) {
  return (
    <section id={id} className="scroll-mt-20 bg-linen-texture px-4 py-20 sm:px-[5%] sm:py-[90px]">
      <SectionHeading title={title}>
        <p className="mt-3 text-[22px] font-light">{subtitle}</p>
      </SectionHeading>

      <div className="mx-auto mt-8 max-w-[1400px] border border-neutral-200/80 bg-white p-6 shadow-[0_0_0_3px_rgba(255,255,255,0.55)] sm:p-[42px]">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-[90px]">
          <div className="text-[15px] leading-6 text-neutral-900">{children}</div>
          <ImageSlider
            images={images}
            intervalMs={intervalMs}
            label={title}
            aspectClassName="aspect-[616/500]"
          />
        </div>
      </div>
    </section>
  )
}
