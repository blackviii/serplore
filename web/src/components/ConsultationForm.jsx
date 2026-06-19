import { useState } from 'react'
import { CalendarDays, CheckCircle, Loader2 } from 'lucide-react'
import { getTrackingContext } from '../utils/tracking'

const COPY = {
  required: 'Required',
  optional: 'Optional',
  email: 'Work email',
  emailPlaceholder: 'you@company.com',
  company: 'Company or website',
  companyPlaceholder: 'Company name, product, or URL',
  needs: 'What do you need help with?',
  needsPlaceholder: 'Share goals, Reddit concerns, target audience, or anything useful for the intro.',
  submit: 'Request Google Meet intro',
  submitting: 'Sending request...',
  successTitle: 'Request received.',
  successBody: 'We will review your brand context and follow up with next steps.',
  error: 'Could not submit the request. Please email support@serplore.com.',
}

export default function ConsultationForm() {
  const copy = COPY
  const [form, setForm] = useState(() => ({
    email: '',
    company: '',
    needs: '',
    website: '',
  }))
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('submitting')
    setError('')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          company: form.company,
          need: form.needs,
          website: form.website,
          ...getTrackingContext(),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const message = Array.isArray(body.errors)
          ? body.errors.join(' ')
          : body.error || body.message || copy.error
        throw new Error(message)
      }

      setStatus('success')
      setForm({
        email: '',
        company: '',
        needs: '',
        website: '',
      })
    } catch (err) {
      setError(err.message || copy.error)
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-left">
        <div className="flex items-start gap-3">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div>
            <div className="font-semibold text-emerald-950">{copy.successTitle}</div>
            <p className="mt-2 text-sm leading-6 text-emerald-900">{copy.successBody}</p>
          </div>
        </div>
      </div>
    )
  }

  const fieldLabel = (label, required = false) => (
    <label className="mb-1.5 flex items-center justify-between gap-3 text-sm font-semibold text-gray-900">
      <span>{label}</span>
      <span className={`text-xs font-semibold ${required ? 'text-orange-700' : 'text-gray-400'}`}>
        {required ? copy.required : copy.optional}
      </span>
    </label>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        {fieldLabel(copy.email, true)}
        <input
          type="email"
          required
          value={form.email}
          onChange={update('email')}
          placeholder={copy.emailPlaceholder}
          disabled={status === 'submitting'}
          className="input-light rounded-lg"
        />
      </div>

      <div>
        {fieldLabel(copy.company, true)}
        <input
          type="text"
          required
          value={form.company}
          onChange={update('company')}
          placeholder={copy.companyPlaceholder}
          disabled={status === 'submitting'}
          className="input-light rounded-lg"
        />
      </div>

      <div>
        {fieldLabel(copy.needs)}
        <textarea
          value={form.needs}
          onChange={update('needs')}
          placeholder={copy.needsPlaceholder}
          disabled={status === 'submitting'}
          rows={3}
          className="input-light min-h-28 resize-y rounded-lg leading-6"
        />
      </div>

      <input
        type="text"
        name="website"
        tabIndex="-1"
        autoComplete="off"
        value={form.website}
        onChange={update('website')}
        className="hidden"
        aria-hidden="true"
      />

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
        {status === 'submitting' ? copy.submitting : copy.submit}
      </button>
    </form>
  )
}
