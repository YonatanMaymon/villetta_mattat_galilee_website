import PageHero from '../components/PageHero'
import PressSection from '../components/PressSection'
import { PRESS_HERO } from '../data/press'

export default function PressPage() {
  return (
    <>
      <PageHero {...PRESS_HERO} />
      <main>
        <PressSection />
      </main>
    </>
  )
}
