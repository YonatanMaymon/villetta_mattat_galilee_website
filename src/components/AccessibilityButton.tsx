import { Accessibility } from 'lucide-react'

export default function AccessibilityButton() {
  return (
    <button
      type="button"
      aria-label="נגישות"
      className="fixed bottom-16 left-0 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-e-full bg-[#1a1a2e] text-white shadow-lg"
    >
      <Accessibility size={28} strokeWidth={1.5} />
    </button>
  )
}
