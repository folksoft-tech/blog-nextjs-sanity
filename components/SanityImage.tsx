import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import imageUrlBuilder from '@sanity/image-url'
import { dataset, projectId } from 'lib/sanity.api'
import Image from 'next/image'

const builder = imageUrlBuilder({ projectId, dataset })

function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

interface Props {
  asset: SanityImageSource
  alt: string
  caption?: string
}

export const SanityImage = (props: Props) => {
  const { asset, alt, caption } = props

  if (!asset) return null

  const imageUrl = urlFor(asset).auto('format').fit('max').url()

  return (
    <figure>
      <Image
        src={imageUrl}
        alt={alt}
        width={800}
        height={600}
        sizes="(max-width: 800px) 100vw, 800px"
        style={{ width: '100%', height: 'auto' }}
      />
      {caption && (
        <figcaption className="mt-2 text-center italic text-sm text-gray-500 dark:text-gray-400 text-pretty">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
