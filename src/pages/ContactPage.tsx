import PageHero from '../components/PageHero'
import ContactSection from '../components/ContactSection'
import { CONTACT_HERO } from '../data/contact'

export default function ContactPage() {
  return (
    <>
      <PageHero {...CONTACT_HERO} />
      <main>
        <ContactSection />
      </main>
    </>
  )
}
