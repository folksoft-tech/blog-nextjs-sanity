'use client'

import cn from 'classnames'
import { useEffect, useState } from 'react'

interface Heading {
  _key: string
  text: string
  level: number
}

interface Props {
  content: any[]
}

function extractHeadings(content: any[]): Heading[] {
  if (!content) return []
  return content
    .filter(
      (block) =>
        block._type === 'block' && ['h2', 'h3', 'h4'].includes(block.style)
    )
    .map((block) => ({
      _key: block._key,
      text: block.children?.map((c: any) => c.text).join('') || '',
      level: parseInt(block.style.replace('h', ''), 10),
    }))
}

export function TableOfContents({ content }: Props) {
  const [activeId, setActiveId] = useState<string>('')
  const headings = extractHeadings(content)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -80% 0px' }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading._key)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-24">
      <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-4">
        On this page
      </h4>
      <ul className="space-y-1 text-sm">
        {headings.map((heading) => (
          <li
            key={heading._key}
            style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
          >
            <a
              href={`#${heading._key}`}
              className={cn(
                'block py-1.5 pl-3 border-l-2 hover:text-blue-600 hover:border-blue-600 transition-colors',
                activeId === heading._key
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-gray-200'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
