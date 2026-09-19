import CardCarouselSection from './CardCarouselSection'
import { useLanguage } from '../i18n/LanguageContext'

export default function ActivitiesSection() {
  const {
    data: {
      area: { ACTIVITIES, ACTIVITY_CARDS },
    },
  } = useLanguage()

  return (
    <CardCarouselSection title={ACTIVITIES.title} subtitle={ACTIVITIES.subtitle} items={ACTIVITY_CARDS} />
  )
}
