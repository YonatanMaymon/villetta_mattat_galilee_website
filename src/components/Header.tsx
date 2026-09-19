import { Menu, Phone } from 'lucide-react'
import { PHONE_DISPLAY, PHONE_HREF } from '../data/content'

interface HeaderProps {
  onBook: () => void
}

export default function Header({ onBook }: HeaderProps) {
  return (
    <header
      dir="rtl"
      className="absolute inset-x-0 top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center px-4 pt-4 text-white sm:px-10"
    >
      {/* Right side in RTL: menu + language (visual only for now) */}
      <div className="flex items-center gap-4 justify-self-start">
        <button type="button" className="flex cursor-pointer items-center gap-3" aria-label="תפריט">
          <Menu size={26} strokeWidth={1.5} />
          <span className="hidden text-base sm:inline">תפריט</span>
        </button>
        <span aria-hidden className="hidden h-4 w-px bg-white/80 sm:block" />
        <button type="button" className="hidden cursor-pointer text-base sm:inline">
          EN
        </button>
      </div>

      <a href="/" aria-label="וילטה מתת גליל">
        <img
          src="/assets/villetta-logo.png"
          alt="Villetta מתת גליל"
          className="h-[100px] w-auto brightness-0 invert sm:h-[110px]"
        />
      </a>

      {/* Left side in RTL: phone + booking */}
      <div className="flex items-center gap-8 justify-self-end">
        <a href={PHONE_HREF} className="hidden items-center gap-2 text-base lg:flex">
          <Phone size={22} strokeWidth={1.5} />
          <span>
            להזמנות: <bdi>{PHONE_DISPLAY}</bdi>
          </span>
        </a>
        <button
          type="button"
          onClick={onBook}
          className="cursor-pointer border-2 border-white px-4 py-1.5 text-sm font-medium transition hover:bg-white hover:text-black sm:text-base"
        >
          הזמנת מקום
        </button>
      </div>
    </header>
  )
}
