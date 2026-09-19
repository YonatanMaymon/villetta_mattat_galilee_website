import ImageSlider from './ImageSlider'
import type { StoryChapter as StoryChapterData } from '../data/ourStory'

interface StoryChapterProps {
  chapter: StoryChapterData
  /** Put the slider on the right (first in RTL) and the copy on the left. */
  imageFirst?: boolean
  className?: string
  panelClassName?: string
}

export default function StoryChapter({
  chapter,
  imageFirst = false,
  className = '',
  panelClassName = '',
}: StoryChapterProps) {
  // Copy sits in a 40% column, inset 10% on the side facing the slider.
  const text = (
    <div className={`text-neutral-800 ${imageFirst ? 'lg:pr-[10%]' : 'lg:pl-[10%]'}`}>
      <p className="text-[22px] font-normal leading-tight text-neutral-700">{chapter.kicker}</p>
      <h2 className="text-[34px] font-normal leading-tight text-neutral-900">{chapter.title}</h2>
      <div className="mt-5 space-y-4 text-[15px] leading-6">
        {chapter.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        {chapter.closing && <p className="text-lg font-medium leading-7">{chapter.closing}</p>}
      </div>
    </div>
  )

  const slider = (
    <ImageSlider images={chapter.images} intervalMs={chapter.intervalMs} label={chapter.title} />
  )

  return (
    <section className={`relative px-4 sm:px-[5%] ${className}`}>
      {/* Faint pane at the page edge, purely decorative. */}
      <div
        aria-hidden
        className={`absolute hidden bg-white/45 lg:block ${panelClassName}`}
      />
      <div
        className={`relative mx-auto grid max-w-[1800px] items-center gap-10 lg:gap-0 ${
          imageFirst ? 'lg:grid-cols-[3fr_2fr]' : 'lg:grid-cols-[2fr_3fr]'
        }`}
      >
        {imageFirst ? slider : text}
        {imageFirst ? text : slider}
      </div>
    </section>
  )
}
