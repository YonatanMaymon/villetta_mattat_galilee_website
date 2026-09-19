import { CirclePlay } from 'lucide-react'
import HeroShell from './HeroShell'
import { useLanguage } from '../i18n/LanguageContext'

interface HeroProps {
  onWatchVideo: () => void
}

export default function Hero({ onWatchVideo }: HeroProps) {
  const {
    t,
    data: {
      content: { HERO },
    },
  } = useLanguage()

  return (
    <HeroShell
      title={HERO.title}
      subtitle={HERO.subtitle}
      background={
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/assets/hero-video.mp4"
          poster="/assets/hero-jacuzzi.jpg"
          autoPlay
          muted
          loop
          playsInline
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
