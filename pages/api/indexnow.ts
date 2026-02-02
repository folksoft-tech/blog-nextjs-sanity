import type { NextApiRequest, NextApiResponse } from 'next'

const INDEXNOW_KEY = process.env.INDEXNOW_KEY

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = req.headers['x-revalidate-secret']
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return res.status(401).json({ error: 'Invalid secret' })
  }

  if (!INDEXNOW_KEY) {
    return res.status(500).json({ error: 'INDEXNOW_KEY not configured' })
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://blog.folksoft.tech'
  const { urls } = req.body as { urls?: string[] }

  if (!urls || urls.length === 0) {
    return res.status(400).json({ error: 'No URLs provided' })
  }

  const absoluteUrls = urls.map((url) =>
    url.startsWith('http') ? url : `${baseUrl}${url}`,
  )

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(baseUrl).host,
        key: INDEXNOW_KEY,
        keyLocation: `${baseUrl}/${INDEXNOW_KEY}.txt`,
        urlList: absoluteUrls,
      }),
    })

    return res.status(200).json({
      status: response.status,
      submitted: absoluteUrls.length,
    })
  } catch (err) {
    console.error('IndexNow submission failed:', err)
    return res.status(500).json({ error: 'IndexNow submission failed' })
  }
}
