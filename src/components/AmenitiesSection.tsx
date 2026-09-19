import Accordion, { type AccordionItem } from './Accordion'
import SectionHeading from './SectionHeading'
import { useLanguage } from '../i18n/LanguageContext'

export default function AmenitiesSection() {
  const {
    data: {
      villetta: { AMENITIES_HEADING, AMENITY_GROUPS },
    },
  } = useLanguage()

  const items: AccordionItem[] = AMENITY_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    content: (
      <ul className="space-y-0">
        {group.items.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2 text-[15px] leading-[30px] text-neutral-700">
            <Icon size={15} strokeWidth={1.25} aria-hidden className="shrink-0" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    ),
  }))

  return (
    <section id="content" className="scroll-mt-20 bg-linen-texture px-4 py-20 sm:py-24">
      <SectionHeading title={AMENITIES_HEADING.title}>
        <p className="mt-3 text-[22px] font-light">{AMENITIES_HEADING.subtitle}</p>
      </SectionHeading>

      <div className="mx-auto mt-8 max-w-[900px] border border-neutral-200/80 bg-white p-6 shadow-[0_0_0_3px_rgba(255,255,255,0.55)] sm:px-12 sm:pb-[52px] sm:pt-[44px]">
        <Accordion items={items} defaultOpenId={AMENITY_GROUPS[0].id} />
      </div>
    </section>
  )
}
