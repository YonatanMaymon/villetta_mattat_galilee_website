import Modal from './Modal'
import { YOUTUBE_VIDEO_ID } from '../data/content'

interface VideoModalProps {
  open: boolean
  onClose: () => void
}

export default function VideoModal({ open, onClose }: VideoModalProps) {
  return (
    <Modal open={open} onClose={onClose} label="סרטון" className="max-w-5xl bg-black text-white">
      <div className="aspect-video w-full">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`}
          title="וילטה מתת גליל"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    </Modal>
  )
}
