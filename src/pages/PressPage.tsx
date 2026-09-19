import PageHero from '../components/PageHero'
import PressSection from '../components/PressSection'
import { useLanguage } from '../i18n/LanguageContext'

export default function PressPage() {
  const {
    data: {
      press: { PRESS_HERO },
    },
  } = useLanguage()

  return (
    <>
      <PageHero {...PRESS_HERO} />
      <main>
        <PressSection />
      </main>
    </>
  )
}
