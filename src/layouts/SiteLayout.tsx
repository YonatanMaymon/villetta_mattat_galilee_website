import { useEffect, useState } from 'react'
import { Outlet, useLocation, useOutletContext } from 'react-router-dom'
import Header from '../components/Header'
import FooterCta from '../components/FooterCta'
import BookingModal from '../components/BookingModal'
import VideoModal from '../components/VideoModal'
import AccessibilityButton from '../components/AccessibilityButton'

export interface SiteContext {
  openVideo: () => void
}

export const useSite = () => useOutletContext<SiteContext>()

/** Start each page at the top (unless the URL targets a #hash). */
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

/** Chrome shared by every page: header, footer CTA, floating button and modals. */
export default function SiteLayout() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const openBooking = () => setBookingOpen(true)
  const context: SiteContext = { openVideo: () => setVideoOpen(true) }

  return (
    <>
      <ScrollToTop />
      <Header onBook={openBooking} />
      <Outlet context={context} />
      <FooterCta onBook={openBooking} />

      <AccessibilityButton />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </>
  )
}
