import { useLanguage } from '../i18n/LanguageContext'

const groupTitle = 'text-xl text-brown sm:text-[22px]'
const row = 'flex items-center gap-3 py-[14px] text-xl text-[#8a6d61] sm:text-[22px]'
const leader = 'flex-1 border-b border-dotted border-[#c9a99a]'

export default function PriceSection() {
  const {
    t,
    data: {
      price: { PRICE_NIGHTS_TITLE, PRICE_NIGHTS, PRICE_DISCOUNTS_TITLE, PRICE_DISCOUNTS, PRICE_NOTE },
    },
  } = useLanguage()

  return (
    <section id="content" className="scroll-mt-20 bg-linen-texture px-6 py-20 sm:py-[100px]">
      <img src="/assets/header-banner.png" alt="" className="mx-auto mb-8 h-auto w-[140px] opacity-70" />

      <div className="mx-auto max-w-[720px]">
        <h2 className={groupTitle}>{PRICE_NIGHTS_TITLE}</h2>
        <dl className="mt-1">
          {PRICE_NIGHTS.map((night) => (
            <div key={night.label} className={row}>
              <dt>{night.label}</dt>
              <span aria-hidden className={leader} />
              <dd dir="ltr" className="text-brown">
                {t.priceText(night.price)}
              </dd>
            </div>
          ))}
        </dl>

        <h2 className={`mt-10 ${groupTitle}`}>{PRICE_DISCOUNTS_TITLE}</h2>
        <dl className="mt-1">
          {PRICE_DISCOUNTS.map((discount) => (
            <div key={discount.label} className={row}>
              <dt>{discount.label}</dt>
              <span aria-hidden className={leader} />
              <dd className="text-brown">{t.discountText(discount.percent)}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-2 text-center text-sm">{PRICE_NOTE}</p>
      </div>
    </section>
  )
}
