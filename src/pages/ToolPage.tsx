import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { Zap, Sparkles, ChevronRight, Plus, Minus, ArrowRight } from 'lucide-react'
import { getToolBySlug } from '@/data/tools'
import { cn } from '@/lib/utils'

// ─── Mesh gradient background ──────────────────────────────────────────────────

function MeshBackground() {
  return (
    <>
      <div className="mesh-blob mesh-blob-1" />
      <div className="mesh-blob mesh-blob-2" />
      <div className="mesh-blob mesh-blob-3" />
    </>
  )
}

// ─── Scroll-reveal wrapper ─────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Simple Nav bar ────────────────────────────────────────────────────────────

function ToolNav({ toolName, category }: { toolName: string; category: 'image' | 'video' }) {
  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="mx-auto flex h-[60px] max-w-screen-xl items-center gap-4 px-5">
        {/* Logo */}
        <Link to="/" className="group mr-4 flex shrink-0 items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--primary)] shadow-md shadow-indigo-500/30"
          >
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </motion.div>
          <span className="text-[15px] tracking-[-0.03em]">
            <span className="font-[700] text-gray-900">Cleanify</span>
            <span className="font-[700] text-[var(--primary)]">.ai</span>
          </span>
        </Link>

        {/* Breadcrumb */}
        <nav className="hidden items-center gap-1.5 text-[12px] sm:flex">
          <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className="text-gray-400 capitalize">{category} Tools</span>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className="font-[600] text-gray-700">{toolName}</span>
        </nav>

        {/* CTA */}
        <div className="ml-auto">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-[600] tracking-[-0.01em] text-white shadow-coral transition-all"
              style={{ background: 'var(--coral)' }}
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Open Studio</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  )
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function ToolHero({ emoji, heroTitle, heroSubtitle }: { emoji: string; heroTitle: string; heroSubtitle: string }) {
  return (
    <section className="relative overflow-hidden px-6 py-24 text-center">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          {/* Emoji in rounded square */}
          <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--primary)] shadow-[0_12px_36px_rgba(79,70,229,0.3)] text-4xl">
            {emoji}
          </div>

          <h1 className="mb-4 text-5xl font-[750] tracking-tight text-[var(--foreground)] leading-[1.1] text-balance">
            {heroTitle}
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-base text-[var(--muted-foreground)] leading-relaxed">
            {heroSubtitle}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/"
                className="flex items-center gap-2 rounded-xl px-6 py-3 text-[14px] font-[700] text-white shadow-coral"
                style={{ background: 'var(--coral)' }}
              >
                <Sparkles className="h-4 w-4" strokeWidth={2} />
                Try Free — No signup
              </Link>
            </motion.div>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white/70 px-6 py-3 text-[14px] font-[600] text-gray-700 backdrop-blur-sm transition-all hover:border-[var(--primary)]/30 hover:shadow-md"
            >
              See how it works ↓
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ─── Stats strip ───────────────────────────────────────────────────────────────

function StatsStrip({ stats }: { stats: Array<{ value: string; label: string }> }) {
  return (
    <div className="border-y border-[var(--border)] bg-white/70 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6">
          {stats.map((s) => (
            <FadeIn key={s.label} className="flex items-baseline gap-2.5">
              <span className="text-[2rem] font-[750] tracking-tight text-[var(--foreground)]">{s.value}</span>
              <span className="text-sm text-[var(--muted-foreground)]">{s.label}</span>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── How it works ──────────────────────────────────────────────────────────────

function HowItWorks({ steps }: { steps: Array<{ step: string; title: string; desc: string }> }) {
  const icons = [
    // Upload icon
    <svg key="upload" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>,
    // Settings icon
    <svg key="settings" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
      <path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
    </svg>,
    // Download icon
    <svg key="download" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>,
  ]

  return (
    <section id="how-it-works" className="py-24 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn className="mx-auto mb-16 max-w-xl text-center">
          <h2 className="mb-3 text-[2.2rem] font-[750] tracking-[-0.03em] text-[var(--foreground)] leading-[1.1]">
            How it works
          </h2>
          <p className="text-[var(--muted-foreground)]">Three simple steps to get your result.</p>
        </FadeIn>

        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] top-8 hidden h-px bg-[var(--border)] md:block" />
          {steps.map(({ step, title, desc }, i) => (
            <FadeIn key={step} delay={i * 0.1} className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)] shadow-[0_8px_24px_rgba(79,70,229,0.25)]">
                {icons[i]}
              </div>
              <span className="mb-2 text-[10px] font-[700] uppercase tracking-[0.18em] text-[var(--primary)]">Step {step}</span>
              <h3 className="mb-2 text-[14px] font-[700] text-[var(--foreground)] tracking-[-0.01em]">{title}</h3>
              <p className="text-[13px] text-[var(--muted-foreground)] leading-relaxed max-w-[220px]">{desc}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Use Cases ─────────────────────────────────────────────────────────────────

function UseCases({ useCases }: { useCases: Array<{ icon: string; title: string; desc: string }> }) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn className="mx-auto mb-14 max-w-xl text-center">
          <h2 className="mb-3 text-[2.2rem] font-[750] tracking-[-0.03em] text-[var(--foreground)] leading-[1.1]">
            Who uses this tool?
          </h2>
          <p className="text-[var(--muted-foreground)]">Built for professionals across every industry.</p>
        </FadeIn>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {useCases.map((uc, i) => (
            <FadeIn key={uc.title} delay={i * 0.07}>
              <div className="h-full rounded-2xl border border-[var(--border)] bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-[var(--primary)]/30 hover:shadow-lg">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)] text-xl">
                  {uc.icon}
                </div>
                <h3 className="mb-2 text-[15px] font-[700] text-[var(--foreground)] tracking-[-0.01em]">{uc.title}</h3>
                <p className="text-[13px] text-[var(--muted-foreground)] leading-relaxed">{uc.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ Accordion ─────────────────────────────────────────────────────────────

function FAQSection({ faq }: { faq: Array<{ q: string; a: string }> }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-24 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn className="mb-12 text-center">
          <h2 className="mb-3 text-[2.2rem] font-[750] tracking-[-0.03em] text-[var(--foreground)] leading-[1.1]">
            Frequently asked questions
          </h2>
          <p className="text-[var(--muted-foreground)]">
            Still have questions?{' '}
            <a href="mailto:hello@cleanify.ai" className="font-[600] text-[var(--primary)] hover:underline">
              Chat with us
            </a>
          </p>
        </FadeIn>

        <div className="space-y-0.5">
          {faq.map((item, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div className="border-b border-[var(--border)] last:border-b-0">
                <button
                  className="group flex w-full items-center justify-between gap-4 py-5 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span
                    className={cn(
                      'text-[13px] font-[600] transition-colors',
                      open === i
                        ? 'text-[var(--primary)]'
                        : 'text-[var(--foreground)] group-hover:text-[var(--primary)]',
                    )}
                  >
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all',
                      open === i
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)]',
                    )}
                  >
                    {open === i ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  </span>
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    open === i ? 'max-h-48 pb-5' : 'max-h-0',
                  )}
                >
                  <p className="text-[13px] text-[var(--muted-foreground)] leading-relaxed">{item.a}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA section ───────────────────────────────────────────────────────────────

function CTASection({ toolName }: { toolName: string }) {
  return (
    <section className="relative overflow-hidden bg-[var(--primary)] py-24">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")` }} />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <FadeIn>
          <h2 className="mb-5 text-[2.4rem] font-[750] tracking-[-0.03em] text-white leading-[1.1] text-balance">
            Ready to try {toolName}?
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-base text-white/75 leading-relaxed">
            Join thousands of creators, designers, and teams who use Cleanify.ai every day. Start free — no signup required.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/"
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[14px] font-[700] text-[var(--primary)] shadow-lg transition-colors hover:bg-white/90"
              >
                <Zap className="h-4 w-4" strokeWidth={2.5} />
                Open Studio — Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <Link
              to="/"
              className="rounded-xl border border-white/30 px-6 py-3 text-[14px] font-[650] text-white transition-colors hover:bg-white/10"
            >
              See all tools
            </Link>
          </div>
          <p className="mt-5 text-[12px] text-white/50">No credit card required · 500 free images on signup</p>
        </FadeIn>
      </div>
    </section>
  )
}

// ─── 404 fallback ──────────────────────────────────────────────────────────────

function ToolNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-6xl">🔍</div>
      <h1 className="text-[2rem] font-[750] text-[var(--foreground)] tracking-tight">Tool not found</h1>
      <p className="text-[var(--muted-foreground)] max-w-sm">
        We could not find a tool with that name. Head back to the homepage to browse all available tools.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-[14px] font-[700] text-white shadow-sm hover:bg-[var(--primary-hover)] transition-colors"
      >
        Back to Cleanify.ai
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

// ─── ToolPage ──────────────────────────────────────────────────────────────────

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>()
  const tool = slug ? getToolBySlug(slug) : undefined

  if (!tool) {
    return (
      <div className="min-h-screen">
        <MeshBackground />
        <ToolNotFound />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <MeshBackground />
      <ToolNav toolName={tool.name} category={tool.category} />
      <ToolHero emoji={tool.emoji} heroTitle={tool.heroTitle} heroSubtitle={tool.heroSubtitle} />
      <StatsStrip stats={tool.stats} />
      <HowItWorks steps={tool.howItWorks} />
      <UseCases useCases={tool.useCases} />
      <FAQSection faq={tool.faq} />
      <CTASection toolName={tool.name} />
    </div>
  )
}
