import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const LAST_UPDATED = 'June 7, 2026'

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="mb-3 text-xl font-bold text-gray-900">{title}</h2>
    <div className="space-y-3 text-sm leading-7 text-gray-600">{children}</div>
  </div>
)

function EnContent() {
  return (
    <>
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">Last Updated: {LAST_UPDATED}</p>
      </div>

      <p className="mb-8 text-sm leading-7 text-gray-600">
        Serplore LLC respects your privacy. This Privacy Policy explains how we collect, use, and protect information when you visit serplore.com, request an introduction video meeting, or work with us on a managed engagement.
      </p>

      <Section title="1. Information We Collect">
        <ul className="ml-2 list-inside list-disc space-y-1 text-gray-500">
          <li><strong className="text-gray-800">Consultation information:</strong> email address, company or website, and optional project needs.</li>
          <li><strong className="text-gray-800">Business materials:</strong> brand, website, competitor, Reddit thread, search result, or reputation context you choose to share with us.</li>
          <li><strong className="text-gray-800">Payment records:</strong> transaction status and billing records for paid engagements, when applicable. Payment card details are handled by payment processors.</li>
          <li><strong className="text-gray-800">Usage data:</strong> IP address, device information, browser type, referring URLs, pages visited, and timestamps.</li>
          <li><strong className="text-gray-800">Communications:</strong> messages you send to us by email, form submission, or other business channels.</li>
        </ul>
      </Section>

      <Section title="2. How We Use Information">
        <p>We use information to evaluate fit, respond to consultation requests, prepare strategy conversations, deliver managed services, process payments, maintain business records, improve the site, prevent abuse, and comply with legal obligations.</p>
        <p>We may also use aggregated or de-identified information to understand website performance and service demand.</p>
      </Section>

      <Section title="3. Sharing Information">
        <p>We do not sell personal information. We may share information with service providers that help us operate the website, process payments, host data, analyze usage, communicate with prospects or clients, and comply with legal requirements. These providers are allowed to use information only as needed to provide services to us.</p>
        <p>We may disclose information if required by law, legal process, or to protect rights, safety, property, or the integrity of our services.</p>
      </Section>

      <Section title="4. Data Security">
        <p>We use reasonable administrative, technical, and organizational safeguards to protect information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.</p>
      </Section>

      <Section title="5. Data Retention">
        <p>We retain information for as long as needed to evaluate requests, provide services, maintain records, resolve disputes, comply with law, and enforce agreements. You may ask us to delete information unless we need to keep it for legal, security, or business record purposes.</p>
      </Section>

      <Section title="6. Your Rights">
        <p>Depending on your location, you may have rights to access, correct, delete, export, object to, or restrict certain processing of your personal information. To make a request, contact us at <a href="mailto:support@serplore.com" className="text-orange-700 hover:underline">support@serplore.com</a>.</p>
      </Section>

      <Section title="7. International Users">
        <p>If you access the site from outside the United States, you understand that information may be processed in the United States or other jurisdictions where our providers operate.</p>
      </Section>

      <Section title="8. Third-Party Links">
        <p>Our site and services may reference third-party websites, including Reddit. Their privacy practices are governed by their own policies.</p>
      </Section>

      <Section title="9. Changes">
        <p>We may update this Privacy Policy from time to time. The updated date above shows when the policy was last revised.</p>
      </Section>

      <Section title="10. Contact">
        <p>Privacy questions can be sent to <a href="mailto:support@serplore.com" className="text-orange-700 hover:underline">support@serplore.com</a> or <a href="mailto:legal@serplore.com" className="text-orange-700 hover:underline">legal@serplore.com</a>.</p>
      </Section>
    </>
  )
}

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10">
            <h1 className="mb-2 text-4xl font-black text-gray-900">
              Privacy Policy
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
