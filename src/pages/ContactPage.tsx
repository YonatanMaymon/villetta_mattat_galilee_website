import PageHero from '../components/PageHero'
import ContactSection from '../components/ContactSection'
import { useLanguage } from '../i18n/LanguageContext'

export default function ContactPage() {
  const {
    data: {
      contact: { CONTACT_HERO },
    },
  } = useLanguage()

  return (
    <>
      <PageHero {...CONTACT_HERO} />
      <main>
        <ContactSection />
      </main>
    </>
  )
}
