import { Pause, Play } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

interface AutoplayToggleProps {
  playing: boolean
  onToggle: () => void
  /** Position and look; the button is otherwise unstyled. */
  className: string
  /** What the button says it will do; the slideshow wording unless given. */
  labels?: { pause: string; play: string }
}

/**
 * Pause/play for anything that moves by itself (see useAutoplay). Invisible until keyboard focus reaches it,
 * unless the visitor chose to always show these buttons (index.css, src/lib/pauseButtons.ts).
 */
export default function AutoplayToggle({ playing, onToggle, className, labels }: AutoplayToggleProps) {
  const { t } = useLanguage()
  const { pause, play } = labels ?? { pause: t.pauseSlideshow, play: t.playSlideshow }
  const Icon = playing ? Pause : Play

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? pause : play}
      // Focusing this button doesn't hold the slides still (AUTOPLAY_TOGGLE_ATTR in useAutoplay).
      data-autoplay-toggle=""
      className={`cursor-pointer ${className}`}
    >
      <Icon size={16} strokeWidth={1.75} aria-hidden />
    </button>
  )
}
