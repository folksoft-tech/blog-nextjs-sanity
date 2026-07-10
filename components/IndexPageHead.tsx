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
    logo: 'https://www.folksoft.tech/assets/images/color_logo_text.png',
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
      <title>{siteTitle}</title>
      <BlogMeta />

      {/* Meta description */}
      <meta key="description" name="description" content={siteDescription} />

      {/* Canonical URL */}
      <link rel="canonical" href={baseUrl} />

      {/* Open Graph tags */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={baseUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
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
