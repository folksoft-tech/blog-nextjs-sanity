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

import { SanityImage } from './SanityImage'

const myPortableTextComponents: Partial<PortableTextReactComponents> = {
  types: {
    image: ({ value }) => {
      return <SanityImage {...value} />
    },
  },
  block: {
    h2: ({ children, value }) => (
      <h2 id={value._key} className="scroll-mt-24">
        {children}
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3 id={value._key} className="scroll-mt-24">
        {children}
      </h3>
    ),
    h4: ({ children, value }) => (
      <h4 id={value._key} className="scroll-mt-24">
        {children}
      </h4>
    ),
  },
}

export default function PostBody({ content }) {
  return (
    <div className="mx-auto max-w-2xl prose">
      <PortableText value={content} components={myPortableTextComponents} />
    </div>
  )
}
