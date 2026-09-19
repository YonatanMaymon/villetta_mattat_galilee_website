import PageHero from '../components/PageHero'
import GallerySection from '../components/GallerySection'
import { GALLERY_HERO } from '../data/gallery'

export default function GalleryPage() {
  return (
    <>
      <PageHero {...GALLERY_HERO} />
      <main>
        <GallerySection />
      </main>
    </>
  )
}
