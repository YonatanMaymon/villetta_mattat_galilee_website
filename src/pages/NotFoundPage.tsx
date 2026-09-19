import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

export default function NotFoundPage() {
  const { t } = useLanguage()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4 text-center text-white">
      <h1 className="text-4xl font-light sm:text-5xl">{t.notFoundTitle}</h1>
      <p className="mt-3 text-lg text-neutral-300">{t.notFoundBody}</p>
      <Link to="/" className="mt-8 border-b border-white pb-1 text-lg">
        {t.backHome}
      </Link>
    </main>
  )
}
