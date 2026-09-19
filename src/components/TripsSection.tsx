import TextSliderSection from './TextSliderSection'
import { useLanguage } from '../i18n/LanguageContext'

function BulletList({ heading, items }: { heading: string; items: string[] }) {
  return (
    <div>
      <p className="font-bold">{heading}</p>
      <ul className="mt-3 list-disc ps-10 marker:text-[0.8em]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default function TripsSection() {
  const {
    data: {
      area: { TRIPS },
    },
  } = useLanguage()

  return (
    <TextSliderSection
      id="content"
      title={TRIPS.title}
      subtitle={TRIPS.subtitle}
      images={TRIPS.images}
      intervalMs={TRIPS.intervalMs}
    >
      <div className="space-y-9">
        <BulletList heading={TRIPS.nearby.heading} items={TRIPS.nearby.items} />
        <BulletList heading={TRIPS.further.heading} items={TRIPS.further.items} />
      </div>
    </TextSliderSection>
  )
}
