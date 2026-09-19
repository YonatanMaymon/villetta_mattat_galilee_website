import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { STORY } from '../data/content'

export default function StorySection() {
  return (
    <section id="content" className="scroll-mt-20 bg-linen-texture px-4 py-24">
      <SectionHeading title={STORY.title}>
        <p className="mx-auto mt-4 max-w-2xl text-2xl font-light leading-snug">{STORY.lead}</p>
      </SectionHeading>
      <p className="mx-auto mt-6 max-w-[640px] text-center text-[15px] leading-6 text-neutral-700">
        {STORY.body.join(' ')}
      </p>
      <div className="mt-6 text-center">
        <Link
          to={STORY.href}
          className="inline-flex items-center gap-3 border-b border-black pb-1 text-base"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          קרא עוד
        </Link>
      </div>
    </section>
  )
}
