import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const LAST_UPDATED = 'June 7, 2026'

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="mb-3 text-xl font-bold text-gray-900">{title}</h2>
    <div className="space-y-3 text-sm leading-7 text-gray-600">{children}</div>
  </div>
)

const CookieTable = ({ cookies }) => (
  <div className="mt-3 overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="py-2 pr-4 text-left font-semibold text-gray-500">Name</th>
          <th className="py-2 pr-4 text-left font-semibold text-gray-500">Purpose</th>
          <th className="py-2 pr-4 text-left font-semibold text-gray-500">Duration</th>
          <th className="py-2 text-left font-semibold text-gray-500">Type</th>
        </tr>
      </thead>
      <tbody>
        {cookies.map((cookie) => (
          <tr key={cookie.name} className="border-b border-gray-100">
            <td className="py-2 pr-4 font-mono text-gray-800">{cookie.name}</td>
            <td className="py-2 pr-4 text-gray-500">{cookie.purpose}</td>
            <td className="py-2 pr-4 text-gray-500">{cookie.duration}</td>
            <td className="py-2 text-gray-500">{cookie.type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

function EnContent() {
  const cookies = [
    { name: '_session', purpose: 'Helps maintain site security and request integrity', duration: 'Session', type: 'Essential' },
    { name: '_ga / _ga_*', purpose: 'Optional analytics for understanding website usage', duration: 'Up to 2 years', type: 'Analytics' },
    { name: '__stripe_*', purpose: 'Used by Stripe if a paid engagement is processed through Stripe', duration: 'Varies', type: 'Payment' },
  ]

  return (
    <>
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">Last Updated: {LAST_UPDATED}</p>
      </div>

      <p className="mb-8 text-sm leading-7 text-gray-600">
        This Cookie Policy explains how Serplore LLC uses cookies and similar technologies when you visit serplore.com.
      </p>

      <Section title="1. What Cookies Are">
        <p>Cookies are small text files placed on your device by websites. They help websites function, remember preferences, improve security, and understand usage patterns.</p>
      </Section>

      <Section title="2. Cookies We May Use">
        <p>We use a small set of cookies and similar storage technologies for website functionality, security, analytics, and payment processing where applicable.</p>
        <CookieTable cookies={cookies} />
      </Section>

      <Section title="3. Analytics">
        <p>We may use analytics tools to understand aggregate website usage. Analytics helps us see which pages are useful and where visitors encounter friction. You can block analytics cookies through your browser settings or browser extensions.</p>
      </Section>

      <Section title="4. Third-Party Services">
        <p>Third-party providers, such as analytics or payment processors, may set their own cookies when their services are used. Their cookie practices are governed by their own policies.</p>
      </Section>

      <Section title="5. Managing Cookies">
        <p>You can manage cookies through your browser settings. Blocking some cookies may affect security checks, analytics accuracy, or payment functionality where applicable.</p>
      </Section>

      <Section title="6. Contact">
        <p>Questions about cookies can be sent to <a href="mailto:support@serplore.com" className="text-orange-700 hover:underline">support@serplore.com</a>.</p>
      </Section>
    </>
  )
}

export default function Cookies() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10">
            <h1 className="mb-2 text-4xl font-black text-gray-900">
              Cookie Policy
            </h1>
            <p className="text-sm font-medium text-orange-700">Serplore LLC</p>
          </div>
          <EnContent />
        </div>
      </div>
      <Footer />
    </div>
  )
}
