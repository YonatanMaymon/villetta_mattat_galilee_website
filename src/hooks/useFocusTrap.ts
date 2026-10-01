import { useEffect, type RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Keeps keyboard focus inside an open dialog: it moves in when the dialog opens, Tab and Shift+Tab wrap
 * around inside it, and it returns to whatever opened the dialog when it closes. Without this, Tab walks
 * off into the page hidden behind the dialog.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const dialog = ref.current
    if (!active || !dialog) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null

    // Visible ones only: a closed step or a hidden element has no layout box.
    const focusable = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0,
      )

    focusable()[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = focusable()
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      const current = document.activeElement
      if (e.shiftKey && (current === first || !dialog.contains(current))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (current === last || !dialog.contains(current))) {
        e.preventDefault()
        first.focus()
      }
    }
    // Tab out of an embedded frame (the YouTube player, the bot check) never reaches onKeyDown, so also
    // bring focus back if it lands anywhere outside.
    const onFocusIn = (e: FocusEvent) => {
      if (e.target instanceof Node && !dialog.contains(e.target)) focusable()[0]?.focus()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('focusin', onFocusIn)
      opener?.focus()
    }
  }, [ref, active])
}
