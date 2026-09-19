import { PRICE_COLUMNS, PRICE_NOTE, PRICE_ROWS } from '../data/price'

const priceText = (n: number) => `${n}₪`

export default function PriceSection() {
  return (
    <section id="content" className="scroll-mt-20 bg-linen-texture px-6 py-20 sm:py-[100px]">
      <img src="/assets/header-banner.png" alt="" className="mx-auto mb-8 h-auto w-[140px] opacity-70" />

      <div className="mx-auto max-w-[720px]">
        {/* Sits above the prices, on the left, like the original. */}
        <p className="text-end text-xl text-[#8a6d61] sm:text-[22px]">{PRICE_COLUMNS}</p>
        <dl className="mt-1">
          {PRICE_ROWS.map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-3 py-[14px] text-xl text-[#8a6d61] sm:text-[22px]"
            >
              <dt>{row.label}</dt>
              <span aria-hidden className="flex-1 border-b border-dotted border-[#c9a99a]" />
              {/* Weekend price sits left of the midweek price, as in the original. */}
              <dd dir="ltr" className="text-brown">
                {priceText(row.weekend)}/{priceText(row.midweek)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-center text-sm">{PRICE_NOTE}</p>
      </div>
    </section>
  )
}
