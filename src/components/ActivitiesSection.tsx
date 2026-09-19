import CardCarouselSection from './CardCarouselSection'
import { ACTIVITIES, ACTIVITY_CARDS } from '../data/area'

export default function ActivitiesSection() {
  return (
    <CardCarouselSection title={ACTIVITIES.title} subtitle={ACTIVITIES.subtitle} items={ACTIVITY_CARDS} />
  )
}
