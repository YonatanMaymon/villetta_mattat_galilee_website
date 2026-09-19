import PageHero from '../components/PageHero'
import TripsSection from '../components/TripsSection'
import ActivitiesSection from '../components/ActivitiesSection'
import { AREA_HERO } from '../data/area'

export default function AreaPage() {
  return (
    <>
      <PageHero {...AREA_HERO} />
      <main>
        <TripsSection />
        <ActivitiesSection />
      </main>
    </>
  )
}
