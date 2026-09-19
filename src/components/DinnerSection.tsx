import CardCarouselSection from './CardCarouselSection'
import { useLanguage } from '../i18n/LanguageContext'

export default function DinnerSection() {
  const {
    data: {
      food: { DINNER, RESTAURANTS },
    },
  } = useLanguage()

  return <CardCarouselSection title={DINNER.title} subtitle={DINNER.subtitle} items={RESTAURANTS} />
}
