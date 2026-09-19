import { useState, type FormEvent, type ReactNode } from 'react'
import { Mail, MapPin, Smartphone } from 'lucide-react'
import SectionHeading from './SectionHeading'
import SocialLinks from './SocialLinks'
import { useLanguage } from '../i18n/LanguageContext'

function Detail({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center px-6 py-6 text-center sm:py-0">
      <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-white text-brown">
        {icon}
      </span>
      <h3 className="mt-3 text-xl font-medium">{label}</h3>
      <div className="mt-2 text-[15px] leading-6 text-neutral-700">{children}</div>
    </div>
  )
}

const fieldClass =
  'w-full border-0 border-b border-neutral-500 bg-transparent px-1 pb-3 pt-5 text-base outline-none placeholder:text-neutral-900 focus:border-black'

export default function ContactSection() {
  const {
    t,
    dir,
    data: {
      contact: { CONTACT_DETAILS, CONTACT_FORM },
    },
  } = useLanguage()
  const [sent, setSent] = useState(false)
  const { phone, email, address } = CONTACT_DETAILS

  // Stub: the live site posts to WordPress/Elementor; no backend exists yet.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="content" className="scroll-mt-20 bg-linen-texture px-4 py-16 sm:py-[100px]">
      <div className="mx-auto flex max-w-[940px] flex-col divide-y divide-brown/80 sm:flex-row sm:divide-x sm:divide-y-0">
        <Detail icon={<Smartphone size={26} strokeWidth={1.25} />} label={phone.label}>
          <a href={phone.href} dir="ltr">
            {phone.value}
          </a>
          <p className="text-[13px]">{phone.note}</p>
        </Detail>
        <Detail icon={<Mail size={26} strokeWidth={1.25} />} label={email.label}>
          <a href={email.href}>{email.value}</a>
        </Detail>
        <Detail icon={<MapPin size={26} strokeWidth={1.25} />} label={address.label}>
          <a href={address.href} target="_blank" rel="noopener noreferrer">
            {address.value}
          </a>
        </Detail>
      </div>

      <div className="mt-24">
        <SectionHeading title={CONTACT_FORM.title}>
          <p className="mt-3 text-[22px] font-light">{CONTACT_FORM.subtitle}</p>
        </SectionHeading>

        {sent ? (
          <p className="py-16 text-center text-xl">{t.thanks}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto mt-12 flex max-w-[642px] flex-col gap-1">
            <input className={fieldClass} name="name" type="text" placeholder={`${t.fullName}*`} required aria-label={t.fullName} />
            <input className={fieldClass} name="email" type="email" placeholder={t.email} aria-label={t.email} />
            <input
              className={fieldClass}
              name="tel"
              type="tel"
              dir={dir}
              placeholder={`${t.phone}*`}
              required
              aria-label={t.phone}
            />
            <textarea
              className={`${fieldClass} min-h-[110px] resize-y`}
              name="message"
              placeholder={t.message}
              aria-label={t.message}
            />
            <button
              type="submit"
              className="mx-auto mt-3 cursor-pointer border border-black bg-white px-8 py-2.5 text-lg font-semibold transition hover:bg-black hover:text-white"
            >
              {t.send}
            </button>
          </form>
        )}
      </div>

      <div className="mt-10">
        <SocialLinks />
      </div>
    </section>
  )
}
