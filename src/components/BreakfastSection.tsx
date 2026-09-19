import { Fragment } from 'react'
import TextSliderSection from './TextSliderSection'
import { useLanguage } from '../i18n/LanguageContext'

export default function BreakfastSection() {
  const {
    data: {
      food: { BREAKFAST },
    },
  } = useLanguage()

  return (
    <TextSliderSection
      id="content"
      title={BREAKFAST.title}
      subtitle={BREAKFAST.subtitle}
      images={BREAKFAST.images}
      intervalMs={BREAKFAST.intervalMs}
    >
      <div className="space-y-[14px]">
        {BREAKFAST.paragraphs.map((lines) => (
          <p key={lines[0]}>
            {lines.map((line, i) => (
              <Fragment key={line}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </p>
        ))}
      </div>
    </TextSliderSection>
  )
}
