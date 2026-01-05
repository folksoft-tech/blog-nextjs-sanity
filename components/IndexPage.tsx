import IndexPageHead from 'components/IndexPageHead'
import Layout from 'components/BlogLayout'
import { urlForImage } from 'lib/sanity.image'
import * as demo from 'lib/demo.data'
import type { Post, Settings } from 'lib/sanity.queries'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from 'next-sanity'
import { stegaClean } from 'next-sanity'

export interface IndexPageProps {
  preview?: boolean
  loading?: boolean
  posts: Post[]
  settings: Settings
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function IndexPage(props: IndexPageProps) {
  const { preview, loading, posts, settings } = props
  const { title = demo.title, description = demo.description } = settings || {}

  return (
    <>
      <IndexPageHead settings={settings} />

      <Layout preview={preview} loading={loading}>
        <div className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Header */}
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
                {title}
              </h1>
              {description && (
                <div className="mt-2 text-lg text-gray-600">
                  <PortableText value={description} />
                </div>
              )}
            </div>

            {/* Posts Grid */}
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {posts?.map((post) => (
                <article key={post._id} className="flex flex-col items-start justify-between">
                  {/* Image */}
                  <div className="relative w-full">
                    {post.coverImage?.asset?._ref ? (
                      <Image
                        alt={post.title || ''}
                        src={urlForImage(post.coverImage).height(400).width(600).url()}
                        width={600}
                        height={400}
                        className="aspect-video w-full rounded-2xl bg-gray-100 object-cover"
                      />
                    ) : (
                      <div className="aspect-video w-full rounded-2xl bg-gray-100" />
                    )}
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                  </div>

                  {/* Content */}
                  <div className="flex max-w-xl grow flex-col justify-between">
                    {/* Date */}
                    <div className="mt-8 flex items-center gap-x-4 text-xs">
                      <time dateTime={post.date} className="text-gray-500">
                        {formatDate(post.date)}
                      </time>
                    </div>

                    {/* Title & Excerpt */}
                    <div className="group relative grow">
                      <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-gray-600">
                        <Link href={`/posts/${post.slug}`}>
                          <span className="absolute inset-0" />
                          {post.title}
                        </Link>
                      </h3>
                      {post.excerpt && (
                        <p className="mt-5 line-clamp-3 text-sm text-gray-600">
                          {stegaClean(post.excerpt)}
                        </p>
                      )}
                    </div>

                    {/* Author */}
                    {post.author && (
                      <div className="relative mt-8 flex items-center gap-x-4 justify-self-end">
                        {post.author.picture?.asset?._ref ? (
                          <Image
                            alt={post.author.name || ''}
                            src={urlForImage(post.author.picture).height(80).width(80).url()}
                            width={40}
                            height={40}
                            className="size-10 rounded-full bg-gray-100"
                          />
                        ) : (
                          <div className="size-10 rounded-full bg-gray-100" />
                        )}
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">{post.author.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
