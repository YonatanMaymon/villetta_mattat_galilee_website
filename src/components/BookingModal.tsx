import { useState, type FormEvent } from 'react'
import Modal from './Modal'
import { useLanguage } from '../i18n/LanguageContext'

interface BookingModalProps {
  open: boolean
  onClose: () => void
}

const inputClass =
  'w-full border border-neutral-300 bg-white px-4 py-3 text-base outline-none focus:border-black'

export default function BookingModal({ open, onClose }: BookingModalProps) {
  const {
    t,
    data: {
      content: { BOOKING },
    },
  } = useLanguage()
  const [sent, setSent] = useState(false)

  const handleClose = () => {
    setSent(false)
    onClose()
  }

  // Stub: the live site posts to WordPress/Elementor; no backend exists yet.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <Modal open={open} onClose={handleClose} label={BOOKING.title} className="max-w-md bg-linen-texture p-8">
      <h2 className="mb-2 text-center text-3xl font-light">{BOOKING.title}</h2>
      {sent ? (
        <p className="py-10 text-center text-lg">{t.thanks}</p>
      ) : (
        <>
          <p className="mb-6 text-center text-neutral-700">{BOOKING.subtitle}</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input className={inputClass} name="name" type="text" placeholder={`${t.fullName}*`} required />
            <input className={inputClass} name="email" type="email" placeholder={t.email} />
            <input className={inputClass} name="tel" type="tel" placeholder={`${t.phone}*`} required />
            <input className={inputClass} name="date" type="date" aria-label={t.arrivalDate} />
            <button
              type="submit"
              className="mt-2 cursor-pointer bg-black px-6 py-3 text-white transition hover:bg-neutral-800"
            >
              {t.send}
            </button>
          </form>
        </>
      )}
    </Modal>
  )
}
