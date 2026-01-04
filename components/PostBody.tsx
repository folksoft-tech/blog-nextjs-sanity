/**
 * This component uses Portable Text to render a post body.
 *
 * You can learn more about Portable Text on:
 * https://www.sanity.io/docs/block-content
 * https://github.com/portabletext/react-portabletext
 * https://portabletext.org/
 *
 */
import { PortableText, type PortableTextReactComponents } from 'next-sanity'
import React from 'react'

import { SanityImage } from './SanityImage'

// Parse inline markdown (bold, italic) in text
function parseInlineMarkdown(text: string): React.ReactNode {
  if (!text) return text

  // Pattern for bold (**text** or __text__) and italic (*text* or _text_)
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  // Match bold first, then italic
  const regex = /(\*\*\*|___)(.+?)\1|(\*\*|__)(.+?)\3|(\*|_)([^*_]+?)\5/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[1] && match[2]) {
      // Bold + Italic
      parts.push(<strong key={key++}><em>{match[2]}</em></strong>)
    } else if (match[3] && match[4]) {
      // Bold
      parts.push(<strong key={key++}>{match[4]}</strong>)
    } else if (match[5] && match[6]) {
      // Italic
      parts.push(<em key={key++}>{match[6]}</em>)
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

// Custom span renderer that handles markdown in text
function MarkdownSpan({ children }: { children: React.ReactNode }) {
  if (typeof children === 'string') {
    return <>{parseInlineMarkdown(children)}</>
  }
  if (Array.isArray(children)) {
    return (
      <>
        {children.map((child, i) =>
          typeof child === 'string' ? (
            <React.Fragment key={i}>{parseInlineMarkdown(child)}</React.Fragment>
          ) : (
            child
          )
        )}
      </>
    )
  }
  return <>{children}</>
}

const myPortableTextComponents: Partial<PortableTextReactComponents> = {
  types: {
    image: ({ value }) => {
      return <SanityImage {...value} />
    },
  },
  block: {
    normal: ({ children }) => (
      <p><MarkdownSpan>{children}</MarkdownSpan></p>
    ),
    h2: ({ children, value }) => (
      <h2 id={value._key} className="scroll-mt-24">
        <MarkdownSpan>{children}</MarkdownSpan>
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3 id={value._key} className="scroll-mt-24">
        <MarkdownSpan>{children}</MarkdownSpan>
      </h3>
    ),
    h4: ({ children, value }) => (
      <h4 id={value._key} className="scroll-mt-24">
        <MarkdownSpan>{children}</MarkdownSpan>
      </h4>
    ),
  },
  list: {
    bullet: ({ children }) => <ul><MarkdownSpan>{children}</MarkdownSpan></ul>,
    number: ({ children }) => <ol><MarkdownSpan>{children}</MarkdownSpan></ol>,
  },
  listItem: {
    bullet: ({ children }) => <li><MarkdownSpan>{children}</MarkdownSpan></li>,
    number: ({ children }) => <li><MarkdownSpan>{children}</MarkdownSpan></li>,
  },
}

export default function PostBody({ content }) {
  return (
    <div className="mx-auto max-w-2xl prose">
      <PortableText value={content} components={myPortableTextComponents} />
    </div>
  )
}
