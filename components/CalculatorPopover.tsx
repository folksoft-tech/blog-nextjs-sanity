'use client'

import cn from 'classnames'
import { trackEvent } from 'lib/analytics'
import {
  type CalculatorOffer,
  calculatorHref,
  resolveOffer,
} from 'lib/calculatorPopover'
import { useCallback, useEffect, useState } from 'react'

/**
 * A scroll-depth pop-over offering the cost calculator that matches what the
 * reader is reading. It is the blog's counterpart to the slide-in on
 * folksoft.tech and wears the same clothes deliberately.
 *
 * Non-intrusive is the whole design brief, so it is a card and not a modal:
 * no backdrop, no focus trap, no scroll lock, nothing behind it goes inert.
 * The page stays usable with the card on screen, which is why it can afford
 * to appear early — see the timing constants below.
 */

/**
 * Roughly one to two flicks of the wheel. Expressed in viewport heights
 * rather than pixels so a phone, where a "scroll" covers far less of the
 * page, gets the same *gesture* count as a desktop rather than the same
 * distance.
 */
const SCROLL_VIEWPORTS = 1.2

/**
 * A short settle before the card is allowed in. This is not an anti-nag
 * measure — it stops the card firing during scroll restoration, where the
 * browser drops a reader who hit Back straight back into the middle of the
 * article and the very first scroll event is already past the threshold.
 */
const MIN_DWELL_MS = 2000

/** Matches the CSS transition below, so the exit animation is not cut off. */
const EXIT_MS = 400

/**
 * Frequency: **once per post view**.
 *
 * Every post the reader opens gets its own offer, because every post is a
 * fresh topic and the card that matches a SOC 2 article is not the card that
 * matches an ISO 27001 one. Dismissing it closes it for the post in hand and
 * nothing more — the next article offers again.
 *
 * This deliberately replaces an earlier once-per-session rule backed by
 * sessionStorage plus a multi-week localStorage snooze. That combination
 * meant a reader who dismissed the card once never saw it again for a
 * fortnight no matter how many articles they read, which is indistinguishable
 * from the feature being broken. Nothing about the schedule is persisted now,
 * so there is no stored state to clear when testing it.
 *
 * Per-post-view is enforced by mounting: PostPage keys this component on the
 * post slug, so a new article is a new instance with fresh state, and `fired`
 * below keeps it to one appearance within a given article.
 */

interface Props {
  title?: string
  slug?: string
}

export function CalculatorPopover({ title, slug }: Props) {
  // Non-null means "in the DOM". It stays set through the exit animation and
  // is cleared once that finishes.
  const [offer, setOffer] = useState<CalculatorOffer | null>(null)
  const [isIn, setIsIn] = useState(false)

  // 1. Decide whether this reader gets a card at all, then wait for both
  //    triggers. None of this runs on the server, so there is no first-paint
  //    markup to mismatch on hydration.
  useEffect(() => {
    const resolved = resolveOffer(title, slug)
    if (!resolved) return

    let dwellMet = false
    let depthMet = false
    let fired = false

    const stop = () => {
      window.clearTimeout(dwellTimer)
      window.removeEventListener('scroll', onScroll)
    }

    const fire = () => {
      if (fired || !dwellMet || !depthMet) return
      fired = true
      stop()
      setOffer(resolved)
    }

    function onScroll() {
      if (fired) return
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      // A post short enough that one or two screens is the whole thing has
      // nothing left for the card to interrupt, so it does not get one.
      if (scrollable < window.innerHeight) return
      const y = window.scrollY || doc.scrollTop
      if (y < window.innerHeight * SCROLL_VIEWPORTS) return
      depthMet = true
      fire()
    }

    const dwellTimer = window.setTimeout(() => {
      dwellMet = true
      fire()
    }, MIN_DWELL_MS)

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return stop
  }, [title, slug])

  // 2. Paint it where it sits, then animate it in on the next frame — one
  //    frame is not always enough for the browser to have taken the start
  //    state, and without it the card simply appears.
  useEffect(() => {
    if (!offer) return

    trackEvent('calculator_popover_shown', {
      framework: offer.id,
      calculator: offer.name,
      post_slug: slug,
      post_title: title,
    })

    let inner = 0
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => setIsIn(true))
    })
    return () => {
      window.cancelAnimationFrame(outer)
      window.cancelAnimationFrame(inner)
    }
  }, [offer, slug, title])

  const close = useCallback(
    (reason: 'close_button' | 'escape_key' | 'cta_click') => {
      setIsIn(false)
      window.setTimeout(() => setOffer(null), EXIT_MS)

      if (!offer || reason === 'cta_click') return
      trackEvent('calculator_popover_dismissed', {
        framework: offer.id,
        calculator: offer.name,
        post_slug: slug,
        method: reason,
      })
    },
    [offer, slug],
  )

  // 3. Escape dismisses, as it would a dialog, even though this is not one.
  useEffect(() => {
    if (!offer) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close('escape_key')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [offer, close])

  if (!offer) return null

  const onCtaClick = () => {
    // The navigation that follows unloads the page, which can outrun a
    // beacon. The campaign tags on the href are the durable half of this
    // measurement; the event is the immediate half.
    trackEvent('calculator_popover_clicked', {
      framework: offer.id,
      calculator: offer.name,
      post_slug: slug,
      post_title: title,
      destination: offer.url,
    })
    close('cta_click')
  }

  return (
    <aside
      role="complementary"
      aria-label={`${offer.name} cost calculator`}
      className={cn(
        'fixed right-4 bottom-4 left-4 z-50 rounded-3xl border border-white/10 bg-[#0A1730]',
        'px-6 pt-6 pb-7 shadow-[0_40px_90px_-30px_rgba(4,14,38,0.75)]',
        'sm:right-6 sm:bottom-6 sm:left-auto sm:w-[360px]',
        'transition-[transform,opacity] duration-500 ease-[cubic-bezier(.21,.6,.35,1)]',
        'motion-reduce:transition-none',
        isIn
          ? 'translate-y-0 opacity-100'
          : 'translate-y-[calc(100%+2rem)] opacity-0',
      )}
    >
      <button
        type="button"
        onClick={() => close('close_button')}
        aria-label="Dismiss"
        className="absolute top-3 right-3 grid h-[30px] w-[30px] place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="h-[15px] w-[15px]"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="mb-[9px] text-[11px] font-bold tracking-[0.09em] text-[#8FD3E6] uppercase">
        Free tool
      </div>

      <h2 className="mb-[9px] pr-6 text-[19px] leading-[1.3] font-bold text-white">
        What will {offer.name} actually cost you?
      </h2>

      <p className="mb-[18px] text-sm leading-[1.6] text-white/[0.66]">
        {offer.teaserCosts}. Most startups spend {offer.teaserTimeline} getting
        there.{' '}
        <strong className="font-semibold text-white">See your number</strong> in
        30 seconds.
      </p>

      <a
        href={calculatorHref(offer, slug)}
        onClick={onCtaClick}
        className="inline-flex items-center gap-[9px] rounded-full bg-[linear-gradient(120deg,#1565E0_0%,#1E8FDE_55%,#06B6D4_100%)] px-[22px] py-3 text-[14.5px] font-semibold text-white transition-transform duration-300 ease-[cubic-bezier(.21,.6,.35,1)] hover:-translate-y-0.5 motion-reduce:transition-none"
      >
        Get my price
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[15px] w-[15px]"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>
    </aside>
  )
}
