import { useState } from 'react'
import Carousel, { type Breakpoint } from './Carousel'
import InfoCard from './InfoCard'
import SectionHeading from './SectionHeading'
import type { CardItem } from '../data/types'

interface CardCarouselSectionProps {
  title: string
  subtitle: string
  items: CardItem[]
}

// Mirrors the original: 4 cards from 980px, 2 from 768px, 1 below.
const BREAKPOINTS: Breakpoint[] = [
  { minWidth: 0, perView: 1 },
  { minWidth: 768, perView: 2 },
  { minWidth: 980, perView: 4 },
]

const pad = (n: number) => String(n).padStart(2, '0')

/** White section with a heading and an RTL carousel of cards plus a "01 / 06" counter. */
export default function CardCarouselSection({ title, subtitle, items }: CardCarouselSectionProps) {
  const [current, setCurrent] = useState(0)

  return (
    <section className="bg-white px-10 py-20 sm:px-[8%] sm:py-[120px]">
      <SectionHeading title={title}>
        <p className="mt-3 text-[22px] font-light">{subtitle}</p>
      </SectionHeading>

      <div className="mx-auto mt-10 max-w-[1580px]">
        <Carousel
          items={items}
          breakpoints={BREAKPOINTS}
          gap={25}
          dir="rtl"
          arrowStyle="arrow"
          arrowOutset={44}
          mobileArrows="outside"
          label={title}
          onIndexChange={setCurrent}
          renderItem={(item) => <InfoCard item={item} />}
        />
        {/* Read in RTL, so it shows as "06 / 01" like the original. */}
        <p className="mt-8 text-center text-base" aria-live="polite">
          {pad(current + 1)} / {pad(items.length)}
        </p>
      </div>
    </section>
  )
}
