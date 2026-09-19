import { useState } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import StorySection from '../components/StorySection'
import FeatureStrip from '../components/FeatureStrip'
import Testimonials from '../components/Testimonials'
import FooterCta from '../components/FooterCta'
import BookingModal from '../components/BookingModal'
import VideoModal from '../components/VideoModal'
import AccessibilityButton from '../components/AccessibilityButton'

export default function HomePage() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const openBooking = () => setBookingOpen(true)

  return (
    <>
      <div className="relative">
        <Header onBook={openBooking} />
        <Hero onWatchVideo={() => setVideoOpen(true)} />
      </div>
      <main>
        <StorySection />
        <FeatureStrip />
        <Testimonials />
      </main>
      <FooterCta onBook={openBooking} />

      <AccessibilityButton />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </>
  )
}
