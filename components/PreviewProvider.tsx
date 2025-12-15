import { LiveQueryProvider } from '@sanity/preview-kit'
import { studioUrl } from 'lib/sanity.api'
import { getClient } from 'lib/sanity.client'
import { useState } from 'react'

export default function PreviewProvider({
  children,
  perspective,
  token,
}: {
  children: React.ReactNode
  perspective: string | null
  token: string
}) {
  const [client] = useState(() =>
    getClient().withConfig({
      stega: { enabled: true, studioUrl },
      token,
    })
  )
  return (
    <LiveQueryProvider
      client={client}
      perspective={
        typeof perspective === 'string' ? perspective.split(',') : undefined
      }
      token={token}
    >
      {children}
    </LiveQueryProvider>
  )
}
