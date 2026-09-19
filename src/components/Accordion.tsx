import { useId, useState, type ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'

export interface AccordionItem {
  id: string
  title: string
  content: ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  /** Item open on first render; clicking the open item closes it. */
  defaultOpenId?: string
}

/** Single-open accordion: one panel at a time, +/− marker, animated height. */
export default function Accordion({ items, defaultOpenId }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null)
  const baseId = useId()

  return (
    <div>
      {items.map((item) => {
        const open = item.id === openId
        const buttonId = `${baseId}-${item.id}-button`
        const panelId = `${baseId}-${item.id}-panel`
        const Marker = open ? Minus : Plus

        return (
          <div key={item.id} className={open ? '' : 'border-b border-neutral-200'}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
                className={`flex w-full cursor-pointer items-center justify-between py-[10px] text-start text-xl leading-6 text-black ${
                  open ? 'font-medium' : 'font-normal'
                }`}
              >
                {item.title}
                <Marker size={20} strokeWidth={1.25} aria-hidden />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!open}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div className="pb-[18px]">{item.content}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
