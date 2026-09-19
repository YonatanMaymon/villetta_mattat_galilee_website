import PageHero from '../components/PageHero'
import StoryChapter from '../components/StoryChapter'
import { OUR_STORY_CHAPTERS, OUR_STORY_HERO } from '../data/ourStory'

export default function OurStoryPage() {
  const [first, second] = OUR_STORY_CHAPTERS

  return (
    <>
      <PageHero {...OUR_STORY_HERO} />
      <main id="content" className="scroll-mt-20 overflow-hidden bg-linen-texture">
        {/* Copy on the right, slider on the left. */}
        <StoryChapter
          chapter={first}
          className="pb-16 pt-16 lg:pb-[70px] lg:pt-[120px]"
          panelClassName="start-0 top-[272px] h-[514px] w-[286px]"
        />
        {/* Slider on the right, copy on the left. */}
        <StoryChapter
          chapter={second}
          imageFirst
          className="pb-16 pt-6 lg:pb-[120px] lg:pt-[80px]"
          panelClassName="end-0 top-[120px] h-[310px] w-[170px]"
        />
      </main>
    </>
  )
}
