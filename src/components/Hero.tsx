import { useEffect, useRef, useState } from 'react'
import { CirclePlay } from 'lucide-react'
import AutoplayToggle from './AutoplayToggle'
import HeroShell from './HeroShell'
import { REDUCED_MOTION_QUERY } from '../hooks/useReducedMotion'
import { useLanguage } from '../i18n/LanguageContext'
import { largestWebp } from '../lib/images'

interface HeroProps {
  onWatchVideo: () => void
}

const VIDEO = '/assets/hero-video.mp4'
const POSTER = '/assets/hero-jacuzzi.jpg'

export default function Hero({ onWatchVideo }: HeroProps) {
  const {
    t,
    data: {
      content: { HERO },
    },
  } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  // Started from here rather than by an autoplay attribute, so that visitors who asked their device for
  // reduced motion see only the still photo, and with preload="none" don't download the video either.
  useEffect(() => {
    const video = videoRef.current
    if (!video || window.matchMedia(REDUCED_MOTION_QUERY).matches) return
    // Browsers autoplay only muted video, and React doesn't reliably set `muted` on prerendered markup.
    video.muted = true
    video.play().catch(() => {
      // Refused (low-power mode on iPhones does this): the photo stays, and the button can still start it.
    })
  }, [])

  const toggleVideo = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play().catch(() => {})
    else video.pause()
  }

  return (
    <HeroShell
      title={HERO.title}
      subtitle={HERO.subtitle}
      background={
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={VIDEO}
          poster={largestWebp(POSTER)}
          preload="none"
          muted
          loop
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      }
      corner={
        <AutoplayToggle
          playing={playing}
          onToggle={toggleVideo}
          labels={{ pause: t.pauseVideo, play: t.playVideo }}
          // Clear of the floating accessibility link, which sits on the same side just above.
          className="absolute bottom-6 end-16 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 text-white transition hover:bg-white hover:text-black"
        />
      }
    >
      <button
        type="button"
        onClick={onWatchVideo}
        className="mt-6 inline-flex cursor-pointer items-center gap-2 text-base"
      >
        <CirclePlay size={26} strokeWidth={1.5} />
        {t.watchVideo}
      </button>
    </HeroShell>
  )
}
