import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo'

const FOOTER_COPY = {
  desc: 'Reddit search visibility, community-native content, and reputation management for brands that need buyers to find trusted Reddit discussions.',
  services: 'Services',
  redditSeo: 'Organic Reddit SEO',
  reputation: 'Reputation management',
  strategy: 'Video intro',
  resources: 'Resources',
  blog: 'Blog',
  contact: 'Contact',
  legal: 'Legal',
  terms: 'Terms',
  privacy: 'Privacy',
  cookies: 'Cookies',
  rights: 'All rights reserved.',
}

export default function Footer() {
  const copy = FOOTER_COPY
  const year = new Date().getFullYear()

  return (
    <footer className="bg-white py-12 text-gray-600">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 border-t border-gray-200 pt-10 md:grid-cols-[1.35fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <BrandLogo />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-gray-600">{copy.desc}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold text-gray-950">{copy.services}</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/#services" className="hover:text-gray-950">{copy.redditSeo}</a></li>
              <li><a href="/#reputation" className="hover:text-gray-950">{copy.reputation}</a></li>
              <li><a href="/#consultation" className="hover:text-gray-950">{copy.strategy}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold text-gray-950">{copy.resources}</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/blog" className="hover:text-gray-950">{copy.blog}</a></li>
              <li><a href="mailto:support@serplore.com" className="hover:text-gray-950">{copy.contact}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold text-gray-950">{copy.legal}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/terms" className="hover:text-gray-950">{copy.terms}</Link></li>
              <li><Link to="/privacy" className="hover:text-gray-950">{copy.privacy}</Link></li>
              <li><Link to="/cookies" className="hover:text-gray-950">{copy.cookies}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-sm text-gray-500">
          &copy; {year} Serplore LLC. {copy.rights}
        </div>
      </div>
    </footer>
  )
}
