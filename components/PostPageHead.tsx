import BlogMeta from 'components/BlogMeta'
import * as demo from 'lib/demo.data'
import { urlForImage } from 'lib/sanity.image'
import { Post, Settings } from 'lib/sanity.queries'
import Head from 'next/head'
import { stegaClean } from 'next-sanity'

export interface PostPageHeadProps {
  settings: Settings
  post: Post
}

export default function PostPageHead({ settings, post }: PostPageHeadProps) {
  const siteTitle = settings?.title ?? demo.title
  const title = stegaClean(post?.title ? `${post.title} | ${siteTitle}` : siteTitle)
  const description = stegaClean(post?.excerpt || '')
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://blog.folksoft.tech'
  const postUrl = `${baseUrl}/posts/${stegaClean(post?.slug)}`

  const ogImage = post?.coverImage?.asset?._ref
    ? urlForImage(post.coverImage).width(1200).height(627).fit('crop').url()
    : `${baseUrl}/api/og?${new URLSearchParams({ title: stegaClean(post?.title || siteTitle) })}`

  // JSON-LD structured data for BlogPosting
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: stegaClean(post?.title),
    description: description,
    image: ogImage,
    datePublished: post?.date,
    dateModified: post?._updatedAt || post?.date,
    author: {
      '@type': 'Organization',
      name: 'Folksoft',
      url: 'https://www.folksoft.tech',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Folksoft',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/favicon/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  }

  // JSON-LD structured data for BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: stegaClean(post?.title),
        item: postUrl,
      },
    ],
  }

  return (
    <Head>
      <title>{title}</title>
      <BlogMeta />

      {/* Meta description */}
      <meta name="description" content={description} />

      {/* Canonical URL */}
      <link rel="canonical" href={postUrl} />

      {/* Open Graph tags */}
      <meta property="og:title" content={stegaClean(post?.title)} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={postUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={stegaClean(siteTitle)} />

      {/* Article-specific OG tags */}
      {post?.date && (
        <meta property="article:published_time" content={post.date} />
      )}
      <meta property="article:author" content="Folksoft" />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={stegaClean(post?.title)} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </Head>
  )
}
