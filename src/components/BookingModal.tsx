import { useState, type FormEvent } from 'react'
import Modal from './Modal'
import { BOOKING } from '../data/content'

interface BookingModalProps {
  open: boolean
  onClose: () => void
}

const inputClass =
  'w-full border border-neutral-300 bg-white px-4 py-3 text-base outline-none focus:border-black'

export default function BookingModal({ open, onClose }: BookingModalProps) {
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
        <p className="py-10 text-center text-lg">תודה! נחזור אליכם בהקדם.</p>
      ) : (
        <>
          <p className="mb-6 text-center text-neutral-700">{BOOKING.subtitle}</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input className={inputClass} name="name" type="text" placeholder="שם מלא*" required />
            <input className={inputClass} name="email" type="email" placeholder="אימייל" />
            <input className={inputClass} name="tel" type="tel" placeholder="טלפון*" required />
            <input className={inputClass} name="date" type="date" aria-label="תאריך הגעה" />
            <button
              type="submit"
              className="mt-2 cursor-pointer bg-black px-6 py-3 text-white transition hover:bg-neutral-800"
            >
              שליחה
            </button>
          </form>
        </>
      )}
    </Modal>
  )
}
