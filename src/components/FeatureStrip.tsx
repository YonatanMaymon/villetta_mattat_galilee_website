import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

export default function FeatureStrip() {
  const {
    t,
    localize,
    data: {
      content: { FEATURE_TILES },
    },
  } = useLanguage()

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4">
      {FEATURE_TILES.map((tile) => (
        <Link
          key={tile.href}
          to={localize(tile.href)}
          className="group relative block aspect-square overflow-hidden bg-neutral-200"
        >
          <img
            src={tile.image}
            alt={tile.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-20 text-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <p className="text-sm tracking-widest">{tile.label}</p>
            <h3 className="text-2xl font-light">{tile.title}</h3>
            <span className="mt-2 inline-block border-b border-white pb-0.5 text-sm">{t.readMore}</span>
          </div>
        </Link>
      ))}
    </section>
  )
}
