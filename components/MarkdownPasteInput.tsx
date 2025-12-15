'use client'

import { useCallback } from 'react'
import { type PortableTextInputProps, PortableTextInput } from 'sanity'

// Simple markdown to portable text conversion
function markdownToBlocks(markdown: string) {
  const blocks: any[] = []
  const lines = markdown.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip empty lines
    if (!line.trim()) {
      i++
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      i++
      continue
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headerMatch) {
      const level = headerMatch[1].length
      const text = headerMatch[2]
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: level <= 2 ? `h${level}` : `h${Math.min(level, 4)}`,
        markDefs: [],
        children: parseInlineMarkdown(text),
      })
      i++
      continue
    }

    // Unordered list items
    if (/^[-*]\s+/.test(line)) {
      const listItems: any[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^[-*]\s+/, '')
        listItems.push({
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          markDefs: [],
          children: parseInlineMarkdown(itemText),
        })
        i++
      }
      blocks.push(...listItems)
      continue
    }

    // Ordered list items
    if (/^\d+\.\s+/.test(line)) {
      const listItems: any[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\d+\.\s+/, '')
        listItems.push({
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'number',
          level: 1,
          markDefs: [],
          children: parseInlineMarkdown(itemText),
        })
        i++
      }
      blocks.push(...listItems)
      continue
    }

    // Table - convert to paragraph for now (tables not supported in basic portable text)
    if (line.includes('|') && lines[i + 1]?.includes('---')) {
      // Skip table header and separator
      while (i < lines.length && lines[i]?.includes('|')) {
        i++
      }
      continue
    }

    // Regular paragraph
    blocks.push({
      _type: 'block',
      _key: generateKey(),
      style: 'normal',
      markDefs: [],
      children: parseInlineMarkdown(line),
    })
    i++
  }

  return blocks
}

function parseInlineMarkdown(text: string) {
  const children: any[] = []
  let remaining = text
  let lastIndex = 0

  // Process bold and italic
  const regex = /(\*\*\*|___)(.+?)\1|(\*\*|__)(.+?)\3|(\*|_)(.+?)\5/g
  let match

  const matches: { index: number; length: number; text: string; marks: string[] }[] = []

  while ((match = regex.exec(text)) !== null) {
    if (match[1] && match[2]) {
      // Bold + Italic (*** or ___)
      matches.push({
        index: match.index,
        length: match[0].length,
        text: match[2],
        marks: ['strong', 'em'],
      })
    } else if (match[3] && match[4]) {
      // Bold (** or __)
      matches.push({
        index: match.index,
        length: match[0].length,
        text: match[4],
        marks: ['strong'],
      })
    } else if (match[5] && match[6]) {
      // Italic (* or _)
      matches.push({
        index: match.index,
        length: match[0].length,
        text: match[6],
        marks: ['em'],
      })
    }
  }

  if (matches.length === 0) {
    return [{ _type: 'span', _key: generateKey(), text, marks: [] }]
  }

  let currentPos = 0
  for (const m of matches) {
    // Add text before this match
    if (m.index > currentPos) {
      children.push({
        _type: 'span',
        _key: generateKey(),
        text: text.slice(currentPos, m.index),
        marks: [],
      })
    }
    // Add the matched text with marks
    children.push({
      _type: 'span',
      _key: generateKey(),
      text: m.text,
      marks: m.marks,
    })
    currentPos = m.index + m.length
  }

  // Add remaining text
  if (currentPos < text.length) {
    children.push({
      _type: 'span',
      _key: generateKey(),
      text: text.slice(currentPos),
      marks: [],
    })
  }

  return children.length > 0 ? children : [{ _type: 'span', _key: generateKey(), text, marks: [] }]
}

function generateKey() {
  return Math.random().toString(36).substring(2, 12)
}

function looksLikeMarkdown(text: string): boolean {
  // Check for common markdown patterns
  const patterns = [
    /^#{1,6}\s+/m,           // Headers
    /\*\*[^*]+\*\*/,         // Bold
    /\*[^*]+\*/,             // Italic
    /^[-*]\s+/m,             // Unordered list
    /^\d+\.\s+/m,            // Ordered list
    /^---+$/m,               // Horizontal rule
    /\[.+\]\(.+\)/,          // Links
  ]
  return patterns.some((pattern) => pattern.test(text))
}

export function MarkdownPasteInput(props: PortableTextInputProps) {
  const handlePaste = useCallback(
    ({ event }: { event: React.ClipboardEvent }) => {
      const text = event.clipboardData?.getData('text/plain')

      if (text && looksLikeMarkdown(text)) {
        event.preventDefault()
        const blocks = markdownToBlocks(text)
        return blocks.length > 0 ? { insert: blocks } : undefined
      }

      return undefined
    },
    []
  )

  return <PortableTextInput {...props} onPaste={handlePaste as any} />
}
