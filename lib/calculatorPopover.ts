/**
 * Which cost calculator to offer a reader, and what the pop-over says.
 *
 * The copy and the figures mirror the scroll-depth slide-in that already
 * runs on folksoft.tech (`src/assets/js/cost-calculator.js` in the
 * folksoft-web repo), so someone who crosses between the two sites meets
 * one offer rather than two competing ones.
 *
 * **The card quotes no money.** It names what goes into the bill and how
 * long the work takes, and leaves the figure to the calculator itself — a
 * price shown out of context, with none of the scope the reader is about to
 * pick, invites them to anchor on a number that is probably not theirs.
 *
 * `teaserTimeline` is the one figure left, and it is copied rather than
 * computed: this repo deliberately carries no second implementation of the
 * pricing model. It is the default state of each calculator (SOC 2 Type 2,
 * ISO 27001 initial certification, HIPAA gap assessment) and is
 * `scopes[defaultScope].marketTimeline` in folksoft-web's CONFIG. Re-read it
 * there if that moves.
 */

export type FrameworkId = 'soc2' | 'iso27001' | 'hipaa' | 'gdpr'

export interface CalculatorOffer {
  id: FrameworkId
  /** Framework name as the reader knows it. */
  name: string
  /** Absolute: the calculators live on the marketing site, not the blog. */
  url: string
  /** How long that default engagement takes. */
  teaserTimeline: string
  /**
   * What the reader is actually paying for, in that framework's own terms.
   * Nobody certifies you against HIPAA, so it has no audit fee to quote —
   * its bill is risk analysis, policies and BAAs, which is how its own
   * calculator puts it (`marketSub` in folksoft-web's CONFIG). Reusing the
   * SOC 2 wording here would promise the reader an audit that does not exist.
   */
  teaserCosts: string
}

interface FrameworkRule {
  id: FrameworkId
  /**
   * Word-anchored on purpose. A bare `includes('iso')` also fires on
   * "virtual CISO" and "comparison", both of which are real titles on this
   * blog and neither of which is about ISO 27001.
   */
  pattern: RegExp
  offer: CalculatorOffer | null
}

/** The bill for a framework an external auditor signs off on. */
const AUDITED_COSTS =
  'Audit fees, readiness work, tooling and your own team’s time'

/**
 * Ordered only for readability — the actual precedence is positional, see
 * `resolveOffer`. An entry with `offer: null` is a framework we can detect
 * but have no live calculator for; GDPR sits there until its page ships.
 * HIPAA's shipped (TECH-178, live 2026-09-18), so it offers like any other.
 */
const FRAMEWORKS: FrameworkRule[] = [
  {
    id: 'soc2',
    pattern: /\bsoc[\s-]?2\b/i,
    offer: {
      id: 'soc2',
      name: 'SOC 2',
      url: 'https://www.folksoft.tech/tools/soc-2-cost-calculator/',
      teaserTimeline: '6–12 months',
      teaserCosts: AUDITED_COSTS,
    },
  },
  {
    id: 'iso27001',
    pattern: /\biso[\s-]?27001\b|\b27001\b|\biso\b/i,
    offer: {
      id: 'iso27001',
      name: 'ISO 27001',
      url: 'https://www.folksoft.tech/tools/iso-27001-cost-calculator/',
      teaserTimeline: '3–6 months',
      teaserCosts: AUDITED_COSTS,
    },
  },
  {
    id: 'hipaa',
    pattern: /\bhipaa\b/i,
    offer: {
      id: 'hipaa',
      name: 'HIPAA',
      url: 'https://www.folksoft.tech/tools/hipaa-compliance-cost-calculator/',
      teaserTimeline: '2–4 months',
      teaserCosts:
        'Risk analysis, policy work, BAAs, tooling and your own team’s time',
    },
  },
  { id: 'gdpr', pattern: /\bgdpr\b/i, offer: null },
]

/** What a post that names no framework at all gets offered. */
const DEFAULT_OFFER = FRAMEWORKS[0].offer as CalculatorOffer

function firstMatches(haystack: string): FrameworkRule[] {
  return FRAMEWORKS.map((rule) => ({ rule, at: haystack.search(rule.pattern) }))
    .filter(({ at }) => at >= 0)
    .sort((a, b) => a.at - b.at)
    .map(({ rule }) => rule)
}

/**
 * Pick the calculator to offer against a post's title, falling back to its
 * slug when the title names nothing (the two can drift once an editor
 * retitles a published post).
 *
 * Three outcomes, in order:
 *
 *   - the title names a framework we have a calculator for -> offer it.
 *     Where a title names several, the one mentioned *first* wins, on the
 *     assumption that it is what the post is actually about.
 *   - the title names only frameworks we have no calculator for (GDPR) ->
 *     offer nothing. Answering a GDPR post with a SOC 2 price is worse than
 *     staying quiet, and it becomes a real offer the moment its page ships:
 *     give the rule an `offer` above and it lights up, as HIPAA's just did.
 *   - the title names nothing -> offer SOC 2, the entry point for almost
 *     every startup that reads this blog.
 */
export function resolveOffer(
  title?: string,
  slug?: string,
): CalculatorOffer | null {
  let matches = firstMatches(title || '')
  if (!matches.length) matches = firstMatches(slug || '')
  if (!matches.length) return DEFAULT_OFFER

  const live = matches.find((rule) => rule.offer)
  return live ? live.offer : null
}

/**
 * The blog carries no analytics of its own (see lib/analytics.ts), so the
 * campaign tags are what make these clicks attributable today: they land on
 * www.folksoft.tech, which does measure them.
 */
export function calculatorHref(offer: CalculatorOffer, slug?: string): string {
  const url = new URL(offer.url)
  url.searchParams.set('utm_source', 'blog')
  url.searchParams.set('utm_medium', 'popover')
  url.searchParams.set('utm_campaign', 'cost-calculator')
  if (slug) url.searchParams.set('utm_content', slug)
  return url.toString()
}
