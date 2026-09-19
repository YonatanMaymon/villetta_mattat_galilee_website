export interface SliderImage {
  src: string
  alt: string
}

export interface CardItem {
  title: string
  description: string
  image: string
  /** Small round label over the image (e.g. "המסעדה בסביבה"). */
  badge?: string
  cta: { label: string; href: string }
}
