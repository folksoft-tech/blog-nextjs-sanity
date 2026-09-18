/**
 * Provider-agnostic event tracking.
 *
 * This blog currently ships **no** analytics tag of its own — no GA4, no
 * GTM container, no Plausible. Rather than pick one here, every event is
 * offered to all three of the places a tag would look for it, so whichever
 * one is installed later starts reporting with no change to the callers:
 *
 *   1. `window.dataLayer` — created if absent. GTM replays an array that
 *      already exists when its container boots, so events fired before the
 *      tag loads are not lost.
 *   2. `window.gtag` — called only if a GA4 tag has defined it.
 *   3. A `fs-blog:<name>` CustomEvent on `window`, which is how the
 *      calculator on folksoft.tech surfaces its own events and what any
 *      hand-rolled listener should bind to.
 *
 * Until a tag is installed, 1 and 3 still run: the dataLayer array
 * accumulates in memory and is the fastest way to assert in the console
 * that an interaction fired.
 */

type EventProps = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    gtag?: (command: string, name: string, props?: EventProps) => void
  }
}

export function trackEvent(name: string, props: EventProps = {}): void {
  if (typeof window === 'undefined') return

  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: name, ...props })
  } catch {
    /* no-op: analytics must never break the page */
  }

  try {
    window.gtag?.('event', name, props)
  } catch {
    /* no-op */
  }

  try {
    window.dispatchEvent(
      new CustomEvent('fs-blog:' + name, { detail: { ...props } }),
    )
  } catch {
    /* no-op */
  }
}
