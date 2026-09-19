import { useLanguage } from '../i18n/LanguageContext'

export default function PriceSection() {
  const {
    t,
    dir,
    data: {
      price: { PRICE_COLUMNS, PRICE_NOTE, PRICE_ROWS },
    },
  } = useLanguage()
  const rtl = dir === 'rtl'

  return (
    <section id="content" className="scroll-mt-20 bg-linen-texture px-6 py-20 sm:py-[100px]">
      <img src="/assets/header-banner.png" alt="" className="mx-auto mb-8 h-auto w-[140px] opacity-70" />

      <div className="mx-auto max-w-[720px]">
        {/* Sits above the prices, on the end side, like the original. */}
        <p className="text-end text-xl text-[#8a6d61] sm:text-[22px]">{PRICE_COLUMNS}</p>
        <dl className="mt-1">
          {PRICE_ROWS.map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-3 py-[14px] text-xl text-[#8a6d61] sm:text-[22px]"
            >
              <dt>{row.label}</dt>
              <span aria-hidden className="flex-1 border-b border-dotted border-[#c9a99a]" />
              {/* Column order matches the header: Hebrew reads weekend on the left (as in the original), English midweek first. */}
              <dd dir="ltr" className="text-brown">
                {rtl
                  ? `${t.priceText(row.weekend)}/${t.priceText(row.midweek)}`
                  : `${t.priceText(row.midweek)}/${t.priceText(row.weekend)}`}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-center text-sm">{PRICE_NOTE}</p>
      </div>
    </section>
  )
}
