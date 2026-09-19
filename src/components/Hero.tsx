import { ArrowDown, CirclePlay } from 'lucide-react'
import { HERO } from '../data/content'

interface HeroProps {
  onWatchVideo: () => void
}

export default function Hero({ onWatchVideo }: HeroProps) {
  return (
    <section className="relative flex h-screen min-h-[560px] items-center justify-center overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/assets/hero-video.mp4"
        poster="/assets/hero-jacuzzi.jpg"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/25 to-black/50" />

      <div className="relative z-10 mt-24 px-4 text-center">
        <h1 className="text-4xl font-normal sm:text-5xl">{HERO.title}</h1>
        <p className="mx-auto mt-2 max-w-3xl text-lg sm:text-xl">{HERO.subtitle}</p>
        <button
          type="button"
          onClick={onWatchVideo}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 text-base"
        >
          <CirclePlay size={26} strokeWidth={1.5} />
          צפייה בסרטון המלא
        </button>
      </div>

      <a
        href="#content"
        aria-label="גלילה למטה"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-bounce"
      >
        <ArrowDown size={32} strokeWidth={1.25} />
      </a>
    </section>
  )
}
