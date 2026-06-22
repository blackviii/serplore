import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2">
          <BrandLogo textClassName="text-xl font-black tracking-tight text-gray-950 sm:text-2xl" />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <a href="/#proof" className="hidden px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-950 sm:inline-flex">
            How it works
          </a>
          <a href="/#reputation" className="hidden px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-950 md:inline-flex">
            Reputation
          </a>
          <a href="/blog" className="hidden px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-950 sm:inline-flex">
            Blog
          </a>
          <a
            href="/#consultation"
            className="hidden items-center justify-center whitespace-nowrap rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:inline-flex"
          >
            Book video intro
          </a>
        </div>
      </div>
    </nav>
  )
}
