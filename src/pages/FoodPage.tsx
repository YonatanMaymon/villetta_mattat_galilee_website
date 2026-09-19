import PageHero from '../components/PageHero'
import BreakfastSection from '../components/BreakfastSection'
import DinnerSection from '../components/DinnerSection'
import { useLanguage } from '../i18n/LanguageContext'

export default function FoodPage() {
  const {
    data: {
      food: { FOOD_HERO },
    },
  } = useLanguage()

  return (
    <>
      <PageHero {...FOOD_HERO} />
      <main>
        <BreakfastSection />
        <DinnerSection />
      </main>
    </>
  )
}
