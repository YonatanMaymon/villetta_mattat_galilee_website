import CardCarouselSection from './CardCarouselSection'
import { DINNER, RESTAURANTS } from '../data/food'

export default function DinnerSection() {
  return <CardCarouselSection title={DINNER.title} subtitle={DINNER.subtitle} items={RESTAURANTS} />
}
