import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4 text-center text-white">
      <h1 className="text-4xl font-light sm:text-5xl">העמוד לא נמצא</h1>
      <p className="mt-3 text-lg text-neutral-300">העמוד שחיפשתם אינו קיים או שעדיין לא נבנה.</p>
      <Link to="/" className="mt-8 border-b border-white pb-1 text-lg">
        חזרה לעמוד הראשי
      </Link>
    </main>
  )
}
