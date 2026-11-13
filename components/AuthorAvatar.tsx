import { BRAND_ICON_SRC, isRetiredAuthorPicture } from 'lib/authorPicture'
import { urlForImage } from 'lib/sanity.image'
import type { Author } from 'lib/sanity.queries'
import Image from 'next/image'

export default function AuthorAvatar(props: Author) {
  const { name, picture } = props
  // A retired picture (the old "Folksoft Team" wordmark) is shown as the brand icon, centred in a white circle.
  const isBrandIcon = isRetiredAuthorPicture(picture)
  return (
    <div className="flex items-center">
      <div className="relative mr-4 h-12 w-12">
        <Image
          src={
            isBrandIcon
              ? BRAND_ICON_SRC
              : picture?.asset?._ref
                ? urlForImage(picture).height(96).width(96).fit('crop').url()
                : 'https://picsum.photos/id/237/96'
          }
          className={
            isBrandIcon
              ? 'rounded-full bg-white object-contain p-2 ring-1 ring-gray-200'
              : 'rounded-full'
          }
          height={96}
          width={96}
          alt={picture?.alt ?? name}
        />
      </div>
      <div className="text-xl font-bold text-balance">{name}</div>
    </div>
  )
}
