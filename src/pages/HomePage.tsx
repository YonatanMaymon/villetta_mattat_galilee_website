import Hero from '../components/Hero'
import StorySection from '../components/StorySection'
import FeatureStrip from '../components/FeatureStrip'
import Testimonials from '../components/Testimonials'
import { useSite } from '../layouts/SiteLayout'

export default function HomePage() {
  const { openVideo } = useSite()

  return (
    <>
      <Hero onWatchVideo={openVideo} />
      <main>
        <StorySection />
        <FeatureStrip />
        <Testimonials />
      </main>
    </>
  )
}
