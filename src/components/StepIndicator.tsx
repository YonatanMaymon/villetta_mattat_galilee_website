import { useLanguage } from '../i18n/LanguageContext'

interface StepIndicatorProps {
  total: number
  /** 1-based: the step being shown now. It and everything before it are filled. */
  current: number
}

/**
 * The dialog's progress index: one small rectangle per screen, filling as the guest moves through.
 * A plain flex row, so it reads right-to-left in Hebrew and left-to-right in English on its own.
 */
export default function StepIndicator({ total, current }: StepIndicatorProps) {
  const { t } = useLanguage()

  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={t.stepNofM(current, total)}
      className="mb-6 flex gap-2"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={`h-1.5 flex-1 transition-colors duration-300 ${i < current ? 'bg-brown' : 'bg-neutral-300'}`}
        />
      ))}
    </div>
  )
}
