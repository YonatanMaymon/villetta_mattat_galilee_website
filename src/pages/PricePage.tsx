import PageHero from '../components/PageHero'
import PriceSection from '../components/PriceSection'
import { PRICE_HERO } from '../data/price'

export default function PricePage() {
  return (
    <>
      <PageHero {...PRICE_HERO} />
      <main>
        <PriceSection />
      </main>
    </>
  )
}
