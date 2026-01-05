import { getAllPosts, getClient } from 'lib/sanity.client'

const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case "'":
        return '&apos;'
      case '"':
        return '&quot;'
      default:
        return c
    }
  })
}

const createRssFeed = (
  posts: Array<{
    title: string
    slug: string
    excerpt?: string
    date: string
  }>,
  baseUrl: string
) => {
  const pubDate = new Date().toUTCString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Folksoft Blog</title>
    <link>${baseUrl}</link>
    <description>Insights on compliance, SOC 2, and startup security from Folksoft</description>
    <language>en-us</language>
    <pubDate>${pubDate}</pubDate>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/favicon/android-chrome-512x512.png</url>
      <title>Folksoft Blog</title>
      <link>${baseUrl}</link>
    </image>
    ${posts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/posts/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/posts/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : ''}
      <author>team@folksoft.tech (Folksoft)</author>
    </item>`
      )
      .join('')}
  </channel>
</rss>`
}

export default function RssFeed() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  const client = getClient()
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://blog.folksoft.tech'

  const posts = await getAllPosts(client)

  const validPosts = posts
    .filter((post) => post.slug && post.title && post.date)
    .map((post) => ({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      date: post.date,
    }))

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
  res.write(createRssFeed(validPosts, baseUrl))
  res.end()

  return {
    props: {},
  }
}
