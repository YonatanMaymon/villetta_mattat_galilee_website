import PageHero from '../components/PageHero'
import BreakfastSection from '../components/BreakfastSection'
import DinnerSection from '../components/DinnerSection'
import { FOOD_HERO } from '../data/food'

export default function FoodPage() {
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
