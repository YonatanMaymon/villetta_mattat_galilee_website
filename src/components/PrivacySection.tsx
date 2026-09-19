import ImageCarousel from './ImageCarousel'
import SectionHeading from './SectionHeading'
import { PRIVACY } from '../data/villetta'

export default function PrivacySection() {
  return (
    <section className="bg-white px-10 py-20 sm:px-14 sm:py-[120px]">
      <SectionHeading title={PRIVACY.title}>
        <p className="mt-3 text-[22px] font-light">{PRIVACY.subtitle}</p>
      </SectionHeading>
      <div className="mt-10">
        <ImageCarousel images={PRIVACY.images} intervalMs={PRIVACY.intervalMs} label={PRIVACY.title} />
      </div>
    </section>
  )
}
