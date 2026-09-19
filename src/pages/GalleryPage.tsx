import PageHero from '../components/PageHero'
import GallerySection from '../components/GallerySection'
import { useLanguage } from '../i18n/LanguageContext'

export default function GalleryPage() {
  const {
    data: {
      gallery: { GALLERY_HERO },
    },
  } = useLanguage()

  return (
    <>
      <PageHero {...GALLERY_HERO} />
      <main>
        <GallerySection />
      </main>
    </>
  )
}
