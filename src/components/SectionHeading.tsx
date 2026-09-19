import type { ReactNode } from 'react'

interface SectionHeadingProps {
  title: string
  children?: ReactNode
}

export default function SectionHeading({ title, children }: SectionHeadingProps) {
  return (
    <div className="text-center">
      <img
        src="/assets/header-banner.png"
        alt=""
        className="mx-auto mb-4 h-auto w-[140px] opacity-70"
      />
      <h2 className="text-4xl font-light sm:text-5xl">{title}</h2>
      {children}
    </div>
  )
}
