interface Props {
  calendlyUrl?: string
}

export function BookDemoSidebar({ calendlyUrl = '#' }: Props) {
  return (
    <div className="sticky top-24">
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h4 className="font-semibold text-lg mb-2">Ready to get started?</h4>
        <p className="text-sm text-gray-600 mb-4">
          See how Folksoft can help your business
        </p>
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors w-full"
        >
          Book a Demo
        </a>
      </div>
    </div>
  )
}
