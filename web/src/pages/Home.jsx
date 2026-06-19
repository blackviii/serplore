import { useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle,
  ChevronDown,
  FileText,
  MessageCircle,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ConsultationForm from '../components/ConsultationForm'
import { HOME_CONTENT } from './homeContent'

const SERVICE_ICONS = [Search, MessageCircle, ShieldCheck, TrendingUp]
const PROCESS_ICONS = [Target, FileText, Users, BarChart3]
const SIGNAL_ICONS = [Search, MessageCircle, ShieldCheck]

const FEATURED_POSTS = [
  {
    slug: 'reddit-seo-service',
    titleKey: 'post1Title',
    descKey: 'post1Desc',
  },
  {
    slug: 'reddit-organic-marketing-service',
    titleKey: 'post2Title',
    descKey: 'post2Desc',
  },
  {
    slug: 'reddit-brand-promotion',
    titleKey: 'post3Title',
    descKey: 'post3Desc',
  },
]

function SectionHeader({ eyebrow, title, subtitle, align = 'center' }) {
  const alignment = align === 'left' ? 'text-left' : 'mx-auto text-center'

  return (
    <div className={`max-w-3xl ${alignment}`}>
      {eyebrow && (
        <div className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl font-bold leading-tight text-gray-950 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-8 text-gray-600 sm:text-lg">{subtitle}</p>}
    </div>
  )
}

function Hero({ content }) {
  return (
    <section className="bg-[#f6f7f8] pt-8">
      <div className="mx-auto max-w-5xl px-6 py-14 text-center lg:py-20">
        <div className="mx-auto mb-5 flex w-full max-w-sm items-center justify-center gap-2 rounded-lg border border-orange-200 bg-white px-3 py-2 text-center text-sm font-semibold text-orange-700">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span className="min-w-0 break-words leading-5">{content.hero.badge}</span>
        </div>

        <h1 className="mx-auto max-w-4xl break-words text-3xl font-bold leading-tight text-gray-950 sm:text-5xl lg:text-6xl">
          {content.hero.title}
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 sm:text-xl">
          {content.hero.subtitle}
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
          <a
            href="#consultation"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
          >
            {content.hero.primaryCta}
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#services"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-400"
          >
            {content.hero.secondaryCta}
          </a>
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500">{content.hero.ctaSub}</p>
      </div>
    </section>
  )
}

function Services({ content }) {
  return (
    <section id="services" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader {...content.services.header} />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {content.services.items.map((item, index) => {
            const Icon = SERVICE_ICONS[index % SERVICE_ICONS.length]

            return (
              <div key={item.title} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50">
                  <Icon className="h-5 w-5 text-orange-700" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-gray-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Reputation({ content }) {
  return (
    <section id="reputation" className="bg-gray-950 py-20 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
        <SectionHeader {...content.reputation.header} align="left" />

        <div className="grid gap-4">
          {content.reputation.items.map((item) => (
            <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start gap-4">
                <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-teal-300" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-300">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Approach({ content }) {
  return (
    <section id="approach" className="bg-[#f6f7f8] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader {...content.approach.header} />

        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {content.approach.steps.map((step, index) => {
            const Icon = PROCESS_ICONS[index % PROCESS_ICONS.length]

            return (
              <div key={step.title} className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Icon className="h-5 w-5 text-gray-900" />
                  </div>
                  <span className="text-sm font-bold text-gray-400">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Fit({ content }) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <SectionHeader {...content.fit.header} align="left" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {content.fit.tags.map((tag) => (
              <div key={tag} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800">
                {tag}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-950 p-6 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-orange-300" />
            <h3 className="text-xl font-bold">{content.fit.cardTitle}</h3>
          </div>
          <div className="mt-6 space-y-4">
            {content.fit.cardItems.map((item) => (
              <div key={item} className="flex gap-3 text-sm leading-7 text-gray-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FAQ({ content }) {
  const [open, setOpen] = useState(0)

  return (
    <section className="bg-[#f6f7f8] py-20">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader {...content.faq.header} />

        <div className="mt-10 space-y-3">
          {content.faq.items.map((item, index) => (
            <div key={item.q} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setOpen(open === index ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
              >
                <span className="text-sm font-semibold text-gray-950">{item.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open === index ? 'rotate-180' : ''}`} />
              </button>

              <div className={`grid transition-all duration-200 ${open === index ? 'grid-rows-[1fr] px-5 pb-5' : 'grid-rows-[0fr] px-5'}`}>
                <div className="overflow-hidden">
                  <p className="text-sm leading-7 text-gray-600">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BlogPreview({ content }) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader {...content.blog.header} align="left" />
          <a
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 transition-colors hover:text-orange-800"
          >
            {content.blog.viewAll}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {FEATURED_POSTS.map(({ slug, titleKey, descKey }) => (
            <a
              key={slug}
              href={`/${slug}`}
              className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-orange-300"
            >
              <div className="mb-4 inline-flex rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-gray-700">
                {content.blog.label}
              </div>
              <h3 className="text-xl font-bold leading-snug text-gray-950 transition-colors group-hover:text-orange-700">
                {content.blog[titleKey]}
              </h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">{content.blog[descKey]}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function Consultation({ content }) {
  return (
    <section id="consultation" className="bg-gray-950 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="text-white">
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-orange-300">
            {content.consultation.eyebrow}
          </div>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">{content.consultation.title}</h2>
          <p className="mt-5 text-base leading-8 text-gray-300 sm:text-lg">{content.consultation.subtitle}</p>

          <div className="mt-8 space-y-4">
            {content.consultation.points.map((point) => (
              <div key={point} className="flex gap-3 text-sm leading-7 text-gray-300">
                <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-teal-300" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white p-6 shadow-sm">
          <ConsultationForm />
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const content = HOME_CONTENT.en

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero content={content} />
      <Services content={content} />
      <Reputation content={content} />
      <Approach content={content} />
      <Consultation content={content} />
      <Footer />
    </div>
  )
}
