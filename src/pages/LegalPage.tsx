import PageHero from '../components/PageHero'
import PauseButtonsSetting from '../components/PauseButtonsSetting'
import { useLanguage } from '../i18n/LanguageContext'

interface LegalPageProps {
  page: 'accessibility' | 'privacy'
}

/** The accessibility statement and the privacy policy: plain text pages, linked from the footer. */
export default function LegalPage({ page }: LegalPageProps) {
  const {
    t,
    data: {
      legal: { ACCESSIBILITY, PRIVACY_POLICY },
      contact: { CONTACT_DETAILS },
    },
  } = useLanguage()
  const { hero, updated, sections } = page === 'accessibility' ? ACCESSIBILITY : PRIVACY_POLICY
  const { phone, email } = CONTACT_DETAILS

  return (
    <>
      <PageHero {...hero} />
      <main id="content" className="scroll-mt-20 bg-linen-texture px-4 py-16 sm:py-24">
        <article className="mx-auto max-w-3xl text-[16px] leading-7 text-neutral-800">
          <p className="text-sm text-neutral-600">
            {t.lastUpdated} {updated}
          </p>

          {sections.map((section) => (
            <section key={section.title} className="mt-10">
              <h2 className="text-2xl font-normal text-ink sm:text-3xl">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="mt-3 list-disc space-y-2 ps-6">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.setting === 'pauseButtons' && <PauseButtonsSetting />}
              {section.contact && (
                <ul className="mt-3 space-y-1">
                  <li className="font-medium">{phone.note}</li>
                  <li>
                    {phone.label}:{' '}
                    <a href={phone.href} className="cursor-pointer underline">
                      <bdi>{phone.value}</bdi>
                    </a>
                  </li>
                  <li>
                    {email.label}:{' '}
                    <a href={email.href} className="cursor-pointer underline">
                      <bdi>{email.value}</bdi>
                    </a>
                  </li>
                </ul>
              )}
            </section>
          ))}
        </article>
      </main>
    </>
  )
}
