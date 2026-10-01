import HeroShell from './HeroShell'
import Picture from './Picture'

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
      background={
        // The largest thing on screen when the page opens: fetch it before anything lower down.
        <Picture
          src={image}
          alt=""
          sizes="100vw"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
      }
    />
  )
}
