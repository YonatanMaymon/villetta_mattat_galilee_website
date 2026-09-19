import Modal from './Modal'
import { YOUTUBE_VIDEO_ID } from '../data/content'
import { useLanguage } from '../i18n/LanguageContext'

interface VideoModalProps {
  open: boolean
  onClose: () => void
}

export default function VideoModal({ open, onClose }: VideoModalProps) {
  const { t } = useLanguage()

  return (
    <Modal open={open} onClose={onClose} label={t.video} className="max-w-5xl bg-black text-white">
      <div className="aspect-video w-full">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`}
          title={t.videoTitle}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    </Modal>
  )
}
