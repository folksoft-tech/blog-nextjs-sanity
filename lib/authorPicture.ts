/**
 * The Folksoft brand icon (the blue shield used as the site favicon, public/favicon/color_logo.png).
 */
export const BRAND_ICON_SRC = '/favicon/color_logo.png'

/**
 * Sanity asset ids of author pictures that have been retired.
 *
 * The "Folksoft Team" author in Sanity still carries the old red "folksoft" wordmark. Wherever an author is shown, a
 * picture on this list is swapped for the brand icon, so those posts show the current logo without anyone having to
 * touch the content. Once a new picture is uploaded to that author in the Studio it simply replaces the old asset id and
 * the new picture shows; this list can then be emptied.
 */
const RETIRED_PICTURE_REFS = new Set([
  'image-fa49a661fdb8bf39e41e91cde357e2d85ce7e6a3-500x500-png',
])

export function isRetiredAuthorPicture(picture: any): boolean {
  return RETIRED_PICTURE_REFS.has(picture?.asset?._ref)
}
