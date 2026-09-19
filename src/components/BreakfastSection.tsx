import { Fragment } from 'react'
import TextSliderSection from './TextSliderSection'
import { BREAKFAST } from '../data/food'

export default function BreakfastSection() {
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
