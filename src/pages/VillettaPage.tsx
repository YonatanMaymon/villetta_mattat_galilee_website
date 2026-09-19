import PageHero from '../components/PageHero'
import AmenitiesSection from '../components/AmenitiesSection'
import PrivacySection from '../components/PrivacySection'
import { VILLETTA_HERO } from '../data/villetta'

export default function VillettaPage() {
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
