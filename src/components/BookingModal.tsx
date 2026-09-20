import { lazy, Suspense, useState, type FormEvent, type ReactNode } from 'react'
import Modal from './Modal'
import StepIndicator from './StepIndicator'
import { PHONE_DISPLAY, PHONE_HREF } from '../data/content'
import { useAvailability } from '../hooks/useAvailability'
import { useQuote } from '../hooks/useQuote'
import { useLanguage } from '../i18n/LanguageContext'
import { ApiRequestError, submitBooking } from '../lib/api'
import { EMPTY_SELECTION, nightsBetween, type Selection } from '../../shared/dates'
import type { Lang } from '../../shared/reservation'

// The calendar and its stylesheet are only fetched once someone opens the dialog.
const DateRangePicker = lazy(() => import('./DateRangePicker'))

interface BookingModalProps {
  open: boolean
  onClose: () => void
}

const TOTAL_STEPS = 3

const inputClass =
  'w-full border border-neutral-300 bg-white px-4 py-3 text-base outline-none focus:border-black'
const primaryButtonClass =
  'cursor-pointer bg-black px-6 py-3 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60'
const backButtonClass =
  'cursor-pointer border border-black px-6 py-3 transition hover:bg-black hover:text-white'

type Step = 1 | 2 | 3
type FormError = 'datesTaken' | 'rateLimited' | 'sendFailed' | 'calendarError' | 'bookingUnavailable'

interface Guest {
  name: string
  email: string
  phone: string
}

const EMPTY_GUEST: Guest = { name: '', email: '', phone: '' }

function formatDay(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`))
}

/** Maps a server error code onto the message the guest sees. */
function errorFor(error: unknown): FormError {
  if (!(error instanceof ApiRequestError)) return 'sendFailed'
  switch (error.code) {
    case 'dates_unavailable':
      return 'datesTaken'
    case 'rate_limited':
      return 'rateLimited'
    case 'calendar_unavailable':
      return 'calendarError'
    case 'booking_unavailable':
      return 'bookingUnavailable'
    default:
      return 'sendFailed'
  }
}

/**
 * Booking in three screens: pick the dates, leave your details, confirm. The reservation reaches Smoobu
 * on the last step, flagged for the owner to confirm by phone. No card is collected and nothing is charged.
 */
export default function BookingModal({ open, onClose }: BookingModalProps) {
  const {
    t,
    lang,
    dir,
    data: {
      content: { BOOKING },
    },
  } = useLanguage()

  const [step, setStep] = useState<Step>(1)
  const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION)
  const [guest, setGuest] = useState<Guest>(EMPTY_GUEST)
  const [website, setWebsite] = useState('')
  const [error, setError] = useState<FormError | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null)

  const availability = useAvailability(open)
  const ready = availability.status === 'ready'
  const canBook = ready && availability.canBook
  const quote = useQuote(selection.arrival, selection.departure, open && canBook)

  // A complete stay: both ends chosen. Narrowing it here keeps the rest of the component free of checks.
  const stay =
    selection.arrival && selection.departure
      ? { arrival: selection.arrival, departure: selection.departure }
      : null
  const nights = stay ? nightsBetween(stay.arrival, stay.departure) : 0

  const handleClose = () => {
    onClose()
    // Reopening starts a fresh booking rather than resuming a half-filled one.
    setStep(1)
    setSelection(EMPTY_SELECTION)
    setGuest(EMPTY_GUEST)
    setWebsite('')
    setError(null)
    setSubmitting(false)
    setConfirmedRef(null)
  }

  const goToDates = () => {
    setStep(1)
    availability.reload()
  }

  const handleConfirm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!stay || submitting) return

    setSubmitting(true)
    setError(null)
    try {
      const booking = await submitBooking({
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        arrival: stay.arrival,
        departure: stay.departure,
        lang,
        website,
      })
      setConfirmedRef(booking.ref)
    } catch (caught) {
      const code = errorFor(caught)
      setError(code)
      // Someone else took the dates while this guest was filling in the form: send them back to choose again.
      if (code === 'datesTaken') goToDates()
    } finally {
      setSubmitting(false)
    }
  }

  const priceLine =
    quote.status === 'ready' ? t.money(quote.amount) : quote.status === 'loading' ? t.loadingPrice : null

  return (
    <Modal open={open} onClose={handleClose} label={BOOKING.title} className="max-w-lg bg-linen-texture p-6 sm:p-8">
      <h2 className="mb-4 text-center text-3xl font-light">{BOOKING.title}</h2>

      {confirmedRef ? (
        <div className="py-8 text-center">
          <p className="text-lg">{t.bookingReceived}</p>
          <p className="mt-4 text-[15px] leading-6 text-neutral-700">{t.awaitingConfirmation}</p>
          <p className="mt-6 text-[15px]">
            {t.bookingRef}: <bdi className="font-medium">{confirmedRef}</bdi>
          </p>
        </div>
      ) : (
        <>
          <StepIndicator total={TOTAL_STEPS} current={step} />

          {availability.status === 'error' ? (
            <CalendarDown onRetry={availability.reload} />
          ) : (
            <>
              {step === 1 && (
                <section>
                  <div className="border border-neutral-300 bg-white p-3">
                    {ready ? (
                      <Suspense fallback={<Loading text={t.loadingCalendar} />}>
                        <DateRangePicker busy={availability.busy} value={selection} onChange={setSelection} />
                      </Suspense>
                    ) : (
                      <Loading text={t.loadingCalendar} />
                    )}
                  </div>

                  <div className="mt-3 flex min-h-8 flex-wrap items-center justify-between gap-2 text-sm">
                    {selection.arrival ? (
                      <>
                        <p aria-live="polite">
                          {t.arrival}: <strong>{formatDay(selection.arrival, lang)}</strong>
                          {selection.departure && (
                            <>
                              {' · '}
                              {t.departure}: <strong>{formatDay(selection.departure, lang)}</strong>
                              {' · '}
                              {t.nightsN(nights)}
                            </>
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelection(EMPTY_SELECTION)}
                          className="cursor-pointer underline"
                        >
                          {t.clearDates}
                        </button>
                      </>
                    ) : (
                      <p className="text-neutral-600">{t.selectDates}</p>
                    )}
                  </div>

                  {stay && priceLine && (
                    <p className="mt-2 text-center text-lg">
                      {t.total}: <strong>{priceLine}</strong>
                    </p>
                  )}

                  {ready && !canBook ? (
                    <CallToBook note={t.bookingByPhone} callLabel={t.callUs} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!stay || !ready}
                      className={`mt-5 w-full ${primaryButtonClass}`}
                    >
                      {t.reserveNow}
                    </button>
                  )}
                </section>
              )}

              {step === 2 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setStep(3)
                  }}
                  className="flex flex-col gap-3"
                >
                  <p className="text-[15px] text-neutral-700">{t.guestDetails}</p>
                  <input
                    className={inputClass}
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder={`${t.fullName}*`}
                    aria-label={t.fullName}
                    required
                    value={guest.name}
                    onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    name="email"
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    placeholder={`${t.email}*`}
                    aria-label={t.email}
                    required
                    value={guest.email}
                    onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    name="tel"
                    type="tel"
                    autoComplete="tel"
                    dir={dir}
                    placeholder={`${t.phone}*`}
                    aria-label={t.phone}
                    required
                    value={guest.phone}
                    onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                  />

                  {/* Honeypot: invisible to people, tempting to bots. */}
                  <input
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  />

                  <Actions onBack={() => setStep(1)} backLabel={t.back} submitLabel={t.continue} />
                </form>
              )}

              {/* Only reachable once both dates are chosen, so the summary can rely on `stay`. */}
              {step === 3 && stay && (
                <form onSubmit={handleConfirm} className="flex flex-col gap-4">
                  <dl className="divide-y divide-neutral-300 border border-neutral-300 bg-white px-4">
                    <Row label={t.arrival} value={formatDay(stay.arrival, lang)} />
                    <Row label={t.departure} value={formatDay(stay.departure, lang)} />
                    <Row label={t.nights} value={t.nightsN(nights)} />
                    {quote.status === 'ready' && <Row label={t.total} value={t.money(quote.amount)} />}
                    <Row label={t.fullName} value={guest.name} />
                    <Row label={t.phone} value={<bdi>{guest.phone}</bdi>} />
                    <Row label={t.email} value={<bdi>{guest.email}</bdi>} />
                  </dl>

                  <p className="text-[13px] leading-5 text-neutral-700">{BOOKING.terms}</p>
                  <p className="border-s-2 border-brown ps-3 text-[13px] leading-5 text-neutral-800">
                    {t.securityDepositNote}
                  </p>

                  <Actions
                    onBack={() => setStep(2)}
                    backLabel={t.back}
                    submitLabel={submitting ? t.sending : t.confirmBooking}
                    disabled={submitting}
                  />
                </form>
              )}

              {error && (
                <p role="alert" className="mt-4 text-center text-red-700">
                  {t[error]}
                </p>
              )}
            </>
          )}
        </>
      )}
    </Modal>
  )
}

function Loading({ text }: { text: string }) {
  return <p className="py-16 text-center text-neutral-600">{text}</p>
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 text-[15px]">
      <dt className="text-neutral-600">{label}</dt>
      <dd className="text-end font-medium">{value}</dd>
    </div>
  )
}

function Actions({
  onBack,
  backLabel,
  submitLabel,
  disabled,
}: {
  onBack: () => void
  backLabel: string
  submitLabel: string
  disabled?: boolean
}) {
  return (
    <div className="mt-1 flex gap-3">
      <button type="button" onClick={onBack} className={backButtonClass}>
        {backLabel}
      </button>
      <button type="submit" disabled={disabled} className={`flex-1 ${primaryButtonClass}`}>
        {submitLabel}
      </button>
    </div>
  )
}

/** The Smoobu calendar could not be read: offer a retry, and the phone as the way through. */
function CalendarDown({ onRetry }: { onRetry: () => void }) {
  const { t } = useLanguage()
  return (
    <div className="py-8 text-center">
      <p className="text-lg">{t.calendarError}</p>
      <p className="mt-2 text-[15px] leading-6 text-neutral-700">{t.calendarErrorHelp}</p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <button type="button" onClick={onRetry} className={backButtonClass}>
          {t.retry}
        </button>
        <a href={PHONE_HREF} className={primaryButtonClass}>
          {t.callUs} <bdi>{PHONE_DISPLAY}</bdi>
        </a>
      </div>
    </div>
  )
}

/** Availability is readable but the Smoobu API is not configured, so nothing can be booked online yet. */
function CallToBook({ note, callLabel }: { note: string; callLabel: string }) {
  return (
    <div className="mt-5 text-center">
      <p className="text-[15px] leading-6 text-neutral-700">{note}</p>
      <a href={PHONE_HREF} className={`mt-3 inline-block ${primaryButtonClass}`}>
        {callLabel} <bdi>{PHONE_DISPLAY}</bdi>
      </a>
    </div>
  )
}
