import MasonryGallery from './MasonryGallery'
import SectionHeading from './SectionHeading'
import { GALLERY_HEADING, GALLERY_PHOTOS } from '../data/gallery'

export default function GallerySection() {
  return (
    <section id="content" className="scroll-mt-20 bg-linen-texture px-4 py-20 sm:px-[5%] sm:py-[100px]">
      <SectionHeading title={GALLERY_HEADING.title}>
        <p className="mt-3 text-[22px] font-light">{GALLERY_HEADING.subtitle}</p>
      </SectionHeading>
      <div className="mx-auto mt-10 max-w-[1705px]">
        <MasonryGallery photos={GALLERY_PHOTOS} />
      </div>
    </section>
  )
}
