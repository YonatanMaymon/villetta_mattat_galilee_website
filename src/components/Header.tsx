import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Phone, X } from 'lucide-react'
import { PHONE_DISPLAY, PHONE_HREF } from '../data/content'
import { useLanguage } from '../i18n/LanguageContext'
import { stripLang } from '../i18n/paths'

interface HeaderProps {
  onBook: () => void
}

const SCROLL_THRESHOLD = 60
const MENU_ID = 'site-menu'

export default function Header({ onBook }: HeaderProps) {
  const {
    t,
    localize,
    otherLangPath,
    data: {
      content: { NAV_LINKS },
    },
  } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const currentPath = stripLang(useLocation().pathname)

  // At the top the header is transparent and needs no bottom padding, but the open menu gives it a
  // background, and without padding the logo would sit on its bottom edge.
  const padding = scrolled ? 'py-2' : menuOpen ? 'py-4' : 'pt-4'

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center px-4 text-white transition-all duration-300 sm:px-10 ${
        scrolled || menuOpen ? 'bg-black/85 shadow-lg shadow-black/20 backdrop-blur-md' : 'bg-transparent'
      } ${padding}`}
    >
      {/* Start side: menu + language switch (on phones the switch lives in the menu) */}
      <div className="flex items-center gap-4 justify-self-start">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
          aria-label={t.menu}
          className="flex cursor-pointer items-center gap-3"
        >
          {menuOpen ? <X size={26} strokeWidth={1.5} /> : <Menu size={26} strokeWidth={1.5} />}
          <span className="hidden text-base sm:inline">{t.menu}</span>
        </button>
        <span aria-hidden className="hidden h-4 w-px bg-white/80 sm:block" />
        <Link
          to={otherLangPath}
          lang={t.langCode}
          hrefLang={t.langCode}
          aria-label={t.langButtonLabel}
          className="hidden cursor-pointer text-base sm:inline"
        >
          {t.langButton}
        </Link>
      </div>

      <Link to={localize('/')} aria-label={t.homeLink}>
        <img
          src="/assets/villetta-logo.png"
          alt={t.logoAlt}
          className={`w-auto brightness-0 invert transition-all duration-300 ${
            scrolled ? 'h-[52px] sm:h-[60px]' : 'h-[72px] sm:h-[110px]'
          }`}
        />
      </Link>

      {/* Left side in RTL: phone + booking */}
      <div className="flex items-center gap-8 justify-self-end">
        <a href={PHONE_HREF} className="hidden items-center gap-2 text-base lg:flex">
          <Phone size={22} strokeWidth={1.5} />
          <span>
            {t.forBookings} <bdi>{PHONE_DISPLAY}</bdi>
          </span>
        </a>
        <button
          type="button"
          onClick={onBook}
          className="cursor-pointer border-2 border-white px-4 py-1.5 text-sm font-medium transition hover:bg-white hover:text-black sm:text-base"
        >
          {t.book}
        </button>
      </div>

      {/* Dropdown: hangs under the header, aligned to the menu button (right in RTL). */}
      <nav
        id={MENU_ID}
        aria-label={t.mainNav}
        className={`absolute top-full inset-x-0 border-t border-white/10 bg-black/90 shadow-xl shadow-black/30 backdrop-blur-md transition duration-200 sm:inset-x-auto sm:start-10 sm:w-72 ${
          menuOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
        }`}
      >
        <ul className="py-2">
          {NAV_LINKS.map(({ label, href }) => {
            const current = href === currentPath
            return (
              <li key={href}>
                <Link
                  to={localize(href)}
                  onClick={() => setMenuOpen(false)}
                  aria-current={current ? 'page' : undefined}
                  className={`block border-s-2 px-6 py-3 text-lg transition hover:bg-white/10 ${
                    current ? 'border-white font-medium' : 'border-transparent font-light'
                  }`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
        {/* The header button is hidden on phones, so offer the switch here too. */}
        <Link
          to={otherLangPath}
          onClick={() => setMenuOpen(false)}
          lang={t.langCode}
          hrefLang={t.langCode}
          aria-label={t.langButtonLabel}
          className="block w-full border-t border-white/10 px-6 py-3 text-start text-lg font-light transition hover:bg-white/10 sm:hidden"
        >
          {t.langButton}
        </Link>
      </nav>
    </header>
  )
}
