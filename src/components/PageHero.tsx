import HeroShell from './HeroShell'

interface PageHeroProps {
  image: string
  title: string
  subtitle: string
}

/** Image hero for inner pages. */
export default function PageHero({ image, title, subtitle }: PageHeroProps) {
  return (
    <HeroShell
      title={title}
      subtitle={subtitle}
      contentClassName="-mt-16"
      background={<img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
    />
  )
}
