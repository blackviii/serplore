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
        <p className="text-sm text-gray-500">Last Updated: {LAST_UPDATED} | Effective Date: {LAST_UPDATED}</p>
      </div>

      <p className="mb-8 text-sm leading-7 text-gray-600">
        These Terms of Use govern your access to serplore.com and any managed services provided by Serplore LLC. By using the site or requesting an introduction video meeting, you agree to these Terms.
      </p>

      <Section title="1. Services">
        <p>Serplore provides managed organic Reddit SEO, community-native content strategy, online reputation support, conversation monitoring, and related consulting services. Engagement scope, timing, deliverables, review process, and fees are agreed separately after we evaluate your brand, category, objectives, and Reddit footprint.</p>
        <p>We may decline work that is not a fit for Reddit communities, creates unacceptable platform risk, or conflicts with applicable law or third-party policies.</p>
      </Section>

      <Section title="2. Consultation Requests">
        <p>When you submit a consultation request, you agree to provide accurate contact information and enough context for us to evaluate fit. Submitting a request does not create a client relationship, guarantee availability, or obligate either party to proceed with a paid engagement.</p>
      </Section>

      <Section title="3. Client Responsibilities">
        <p>You are responsible for the accuracy, legality, and completeness of information you provide to us. You must have the right to share any brand, product, customer, competitor, or reputation materials you ask us to review.</p>
        <p>You may not use our services for illegal activity, harassment, doxxing, hate speech, deliberate misinformation, impersonation, undisclosed regulated claims, or any activity intended to violate Reddit's rules or applicable law.</p>
      </Section>

      <Section title="4. Payments">
        <p>Paid engagements may require an upfront fee, deposit, retainer, milestone payment, or other payment structure agreed in writing. Payments are processed through third-party processors when applicable. We do not store full payment card numbers on our servers.</p>
        <p>Paid fees are generally non-refundable once work has started, except where required by law or where we agree otherwise in writing. If we cannot complete an agreed scope for reasons within our control, we may offer a rescope, credit, or refund at our discretion.</p>
      </Section>

      <Section title="5. Third-Party Platforms">
        <p>Reddit is a third-party platform owned by Reddit, Inc. Serplore is not affiliated with, endorsed by, or officially connected to Reddit, Inc. We cannot control Reddit's moderation decisions, ranking systems, account actions, search indexing, or community responses.</p>
      </Section>

      <Section title="6. No Guaranteed Results">
        <p>Organic Reddit work depends on community fit, content quality, timing, product-market fit, existing reputation, moderation decisions, search behavior, and buyer response. We do not guarantee specific rankings, traffic, leads, revenue, sentiment changes, thread outcomes, or platform visibility.</p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>You retain rights to materials you provide. You grant us a limited license to use those materials only to evaluate, plan, and deliver the agreed services. Serplore retains ownership of its methods, templates, processes, research structures, and pre-existing intellectual property.</p>
      </Section>

      <Section title="8. Confidentiality">
        <p>Each party may receive non-public business information from the other. We will use reasonable care to protect confidential information and will not use it outside the purpose of evaluating or delivering services, except as required by law.</p>
      </Section>

      <Section title="9. Limitation of Liability">
        <p>To the maximum extent permitted by law, Serplore LLC will not be liable for indirect, incidental, special, consequential, punitive, or lost-profit damages. Our total liability for any claim will not exceed the amount paid to us for the relevant engagement in the twelve months before the claim.</p>
      </Section>

      <Section title="10. Governing Law">
        <p>These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-law rules. Disputes will be resolved through binding arbitration unless a claim qualifies for small claims court.</p>
      </Section>

      <Section title="11. Contact">
        <p>Questions about these Terms can be sent to <a href="mailto:legal@serplore.com" className="text-orange-700 hover:underline">legal@serplore.com</a> or <a href="mailto:support@serplore.com" className="text-orange-700 hover:underline">support@serplore.com</a>.</p>
      </Section>
    </>
  )
}

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10">
            <h1 className="mb-2 text-4xl font-black text-gray-900">
              Terms of Use
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
