import PageHero from '../components/PageHero'
import TripsSection from '../components/TripsSection'
import ActivitiesSection from '../components/ActivitiesSection'
import { useLanguage } from '../i18n/LanguageContext'

export default function AreaPage() {
  const {
    data: {
      area: { AREA_HERO },
    },
  } = useLanguage()

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
