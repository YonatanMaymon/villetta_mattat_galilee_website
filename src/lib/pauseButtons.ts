/**
 * The visitor's choice, made in the accessibility statement, to always see the pause buttons on moving
 * content (AutoplayToggle). Without it the buttons stay invisible until keyboard focus reaches them (see
 * index.css). The choice is kept in this browser only, and marked on <html> so the CSS can act on it.
 */
const STORAGE_KEY = 'villetta.pauseButtons'
const ATTR = 'data-pause-buttons'

export function pauseButtonsShown(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'shown'
  } catch {
    // Storage can be blocked (private windows, strict settings): the buttons then follow the default.
    return false
  }
}

/** Shows or hides the buttons on the current page. */
export function applyPauseButtons(shown: boolean) {
  document.documentElement.toggleAttribute(ATTR, shown)
}

/** Saves the choice for later visits and applies it now. */
export function setPauseButtonsShown(shown: boolean) {
  try {
    if (shown) localStorage.setItem(STORAGE_KEY, 'shown')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Not saved, but it still applies until the page is reloaded.
  }
  applyPauseButtons(shown)
}
