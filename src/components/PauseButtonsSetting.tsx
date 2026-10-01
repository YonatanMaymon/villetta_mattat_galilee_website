import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { pauseButtonsShown, setPauseButtonsShown } from '../lib/pauseButtons'

/** The checkbox in the accessibility statement that keeps the pause buttons on moving content visible. */
export default function PauseButtonsSetting() {
  const { t } = useLanguage()
  // Unticked at first, as in the prerendered page; the saved choice is read once mounted.
  const [shown, setShown] = useState(false)
  useEffect(() => setShown(pauseButtonsShown()), [])

  return (
    <label className="mt-4 inline-flex cursor-pointer items-center gap-3 border border-neutral-300 bg-white px-4 py-3">
      <input
        type="checkbox"
        checked={shown}
        onChange={(e) => {
          setShown(e.target.checked)
          setPauseButtonsShown(e.target.checked)
        }}
        className="h-5 w-5 cursor-pointer accent-brown"
      />
      <span>{t.showPauseButtons}</span>
    </label>
  )
}
