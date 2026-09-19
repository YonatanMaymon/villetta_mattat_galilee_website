import type { ReactNode } from 'react'
import { ArrowDown } from 'lucide-react'

interface HeroShellProps {
  background: ReactNode
  title: string
  subtitle: string
  children?: ReactNode
}

/** Full-screen hero: background media, dark gradient, centred copy, scroll cue to #content. */
export default function HeroShell({ background, title, subtitle, children }: HeroShellProps) {
  return (
    <section className="relative flex h-screen min-h-[560px] items-center justify-center overflow-hidden bg-black text-white">
      {background}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/25 to-black/50" />

      <div className="relative z-10 mt-24 px-4 text-center">
        <h1 className="text-4xl font-normal sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-2 max-w-3xl text-lg sm:text-xl">{subtitle}</p>
        {children}
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
