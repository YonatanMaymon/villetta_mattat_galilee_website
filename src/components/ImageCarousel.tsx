import Carousel, { type Breakpoint } from './Carousel'
import type { SliderImage } from '../data/types'

interface ImageCarouselProps {
  images: SliderImage[]
  intervalMs: number
  label: string
}

// 3 framed photos per view on tablet/desktop, 1 on phones.
const BREAKPOINTS: Breakpoint[] = [
  { minWidth: 0, perView: 1 },
  { minWidth: 640, perView: 3 },
]

export default function ImageCarousel({ images, intervalMs, label }: ImageCarouselProps) {
  return (
    <div className="mx-auto max-w-[1640px]">
      <Carousel
        items={images}
        breakpoints={BREAKPOINTS}
        gap={56}
        intervalMs={intervalMs}
        label={label}
        renderItem={(img) => (
          <div className="border border-neutral-200 bg-white p-[2px]">
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              draggable={false}
              className="aspect-[10/7] w-full object-cover"
            />
          </div>
        )}
      />
    </div>
  )
}
