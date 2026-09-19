import { BADGE_LABELS, type Restaurant } from '../data/food'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { name, description, image, badge, cta } = restaurant

  return (
    <article className="flex h-full flex-col border border-neutral-200/80 bg-white p-2 shadow-[0_0_0_3px_rgba(255,255,255,0.6)]">
      <div className="relative">
        <img src={image} alt={name} loading="lazy" className="aspect-[9/5] w-full object-cover" />
        <span className="absolute left-2 top-2 flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[#5c2e23]/95 p-2 text-center text-[13px] font-normal leading-tight text-white">
          {BADGE_LABELS[badge]}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center px-5 pb-6 pt-4 text-center">
        <h3 className="text-[21px] font-normal leading-tight">{name}</h3>
        <p className="mb-8 mt-2 text-sm leading-6 text-neutral-800">{description}</p>
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-block border border-black px-6 py-2.5 text-base transition hover:bg-black hover:text-white"
        >
          {cta.label}
        </a>
      </div>
    </article>
  )
}
