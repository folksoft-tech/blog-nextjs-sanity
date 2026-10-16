import BlogMeta from 'components/BlogMeta'
import * as demo from 'lib/demo.data'
import { Settings } from 'lib/sanity.queries'
import Head from 'next/head'
import { stegaClean, toPlainText } from 'next-sanity'

export interface IndexPageHeadProps {
  settings: Settings
}

export default function IndexPageHead({ settings }: IndexPageHeadProps) {
  const {
    title = demo.title,
    description = demo.description,
    ogImage = {},
  } = settings
  const ogImageTitle = ogImage?.title || demo.ogImageTitle

  const siteTitle = stegaClean(title)
  // Homepage-only <title>: siteTitle is also the H1, the post-page header and
  // the " | Folksoft Blog" suffix on every post title, so it stays the brand.
  const pageTitle = `Compliance Guides for Startups | ${siteTitle}`
  const siteDescription = toPlainText(description)
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://blog.folksoft.tech'

  const ogImageUrl = `${
    process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : baseUrl
  }/api/og?${new URLSearchParams({ title: ogImageTitle })}`

  // JSON-LD structured data for Organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Folksoft',
    url: 'https://www.folksoft.tech',
    logo: `${baseUrl}/favicon/color_text.png`,
    sameAs: [
      'https://www.linkedin.com/company/folksoft',
    ],
  }

  // JSON-LD structured data for WebSite
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteTitle,
    url: baseUrl,
    description: siteDescription,
    publisher: {
      '@type': 'Organization',
      name: 'Folksoft',
    },
  }

  return (
    <Head>
      <title>{pageTitle}</title>
      <BlogMeta />

      {/* Meta description */}
      <meta key="description" name="description" content={siteDescription} />

      {/* Canonical URL */}
      <link rel="canonical" href={baseUrl} />

      {/* Open Graph tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={baseUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </Head>
  )
}
