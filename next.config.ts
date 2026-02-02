import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: 'cdn.sanity.io' },
      { hostname: 'picsum.photos' },
    ],
  },
  typescript: {
    // Set this to false if you want production builds to abort if there's type errors
    ignoreBuildErrors: process.env.VERCEL_ENV === 'production',
  },
  // Note: eslint config removed - no longer supported in Next.js 16
  // Use `next lint` CLI options instead if needed
  headers: async () => [
    {
      // Prevent search engines from indexing the Sanity Studio
      source: '/studio/:path*',
      headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      ],
    },
    {
      // Prevent search engines from indexing API routes
      source: '/api/:path*',
      headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      ],
    },
  ],
}

export default config
