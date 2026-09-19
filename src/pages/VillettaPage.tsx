import PageHero from '../components/PageHero'
import AmenitiesSection from '../components/AmenitiesSection'
import PrivacySection from '../components/PrivacySection'
import { useLanguage } from '../i18n/LanguageContext'

export default function VillettaPage() {
  const {
    data: {
      villetta: { VILLETTA_HERO },
    },
  } = useLanguage()

  return (
    <>
      <PageHero {...VILLETTA_HERO} />
      <main>
        <AmenitiesSection />
        <PrivacySection />
      </main>
    </>
  )
}
