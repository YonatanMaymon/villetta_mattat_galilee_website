import PageHero from '../components/PageHero'
import PriceSection from '../components/PriceSection'
import { useLanguage } from '../i18n/LanguageContext'

export default function PricePage() {
  const {
    data: {
      price: { PRICE_HERO },
    },
  } = useLanguage()

  return (
    <>
      <PageHero {...PRICE_HERO} />
      <main>
        <PriceSection />
      </main>
    </>
  )
}
