import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/Header'
import { WorkspaceCanvas } from '@/components/WorkspaceCanvas'
import { Sidebar } from '@/components/Sidebar'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { Badge } from '@/components/ui/badge'
import { defaultConfig } from '@/types/pipeline'
import type { PipelineConfig, BatchFile } from '@/types/pipeline'
import { cn } from '@/lib/utils'
import {
  Zap, ArrowRight, Check, Eraser, ImageIcon, ArrowUp,
  BarChart3, Clock, ShieldCheck, Star, ChevronRight, ChevronDown,
  Layers, Sparkles, Plus, Minus, X,
} from 'lucide-react'

// ─── Mesh gradient background ────────────────────────────────────────────────

function MeshBackground() {
  return (
    <>
      <div className="mesh-blob mesh-blob-1" />
      <div className="mesh-blob mesh-blob-2" />
      <div className="mesh-blob mesh-blob-3" />
    </>
  )
}

// ─── Scroll hint ──────────────────────────────────────────────────────────────

function ScrollHint() {
  return (
    <motion.a
      href="#discover"
      animate={{ y: [0, 7, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400/70 hover:text-gray-500 transition-colors z-10"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">Discover</span>
      <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
    </motion.a>
  )
}

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────

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

// ─── Before/After placeholder images ─────────────────────────────────────────

function ProductBefore() {
  return (
    <div className="absolute inset-0">
      <div className="w-full h-full" style={{ background: 'linear-gradient(135deg,#e2e8f0 0%,#cbd5e1 50%,#e2e8f0 100%)' }} />
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
        <rect x="80" y="40" width="240" height="170" rx="8" fill="#334155" />
        <rect x="100" y="55" width="200" height="140" rx="4" fill="#94a3b8" />
        <circle cx="200" cy="125" r="40" fill="#64748b" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="text-2xl font-black tracking-widest select-none" style={{ color: 'rgba(71,85,105,0.55)', transform: 'rotate(-25deg)', letterSpacing: '0.3em' }}>
          WATERMARK
        </p>
      </div>
      <div className="absolute bottom-3 right-3 px-2 py-1 rounded" style={{ background: 'rgba(71,85,105,0.45)' }}>
        <span className="text-[10px] font-bold text-white/70 tracking-wider">STOCK</span>
      </div>
    </div>
  )
}

function ProductAfter() {
  return (
    <div className="absolute inset-0">
      <div className="w-full h-full" style={{ background: 'linear-gradient(135deg,#e2e8f0 0%,#cbd5e1 50%,#e2e8f0 100%)' }} />
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
        <rect x="80" y="40" width="240" height="170" rx="8" fill="#334155" />
        <rect x="100" y="55" width="200" height="140" rx="4" fill="#94a3b8" />
        <circle cx="200" cy="125" r="40" fill="#64748b" />
      </svg>
    </div>
  )
}

// ─── Stats strip ──────────────────────────────────────────────────────────────

const STATS = [
  { value: '500k+', label: 'Creators & teams' },
  { value: '12M+', label: 'Images processed' },
  { value: '99.4%', label: 'Accuracy rate' },
  { value: '1.3s', label: 'Avg per image' },
]

function StatsStrip() {
  return (
    <div className="border-y border-[var(--border)] bg-white/70 backdrop-blur-sm py-7">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-5">
          {STATS.map((s) => (
            <FadeIn key={s.label} className="flex items-baseline gap-2.5">
              <span className="text-2xl font-[750] tracking-tight text-[var(--foreground)]">{s.value}</span>
              <span className="text-sm text-[var(--muted-foreground)]">{s.label}</span>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Logo strip ───────────────────────────────────────────────────────────────

const BRANDS = ['Adobe', 'Canva', 'Getty Images', 'Unsplash', 'Vimeo', '500px', 'Behance', 'Frame.io']

function LogoStrip() {
  return (
    <section className="bg-white/60 backdrop-blur-sm py-10">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <p className="mb-6 text-center text-[10px] font-[700] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Trusted by creators at
          </p>
        </FadeIn>
        <FadeIn delay={0.05} className="flex flex-wrap items-center justify-center gap-8">
          {BRANDS.map((name) => (
            <span key={name} className="text-sm font-[700] text-gray-300 hover:text-[var(--muted-foreground)] transition-colors cursor-default select-none">
              {name}
            </span>
          ))}
        </FadeIn>
      </div>
    </section>
  )
}

// ─── Marquee ──────────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  { icon: '🪄', label: 'Auto watermark detection' },
  { icon: '✂️', label: 'Background removal' },
  { icon: '🔭', label: '4x AI upscaling' },
  { icon: '📦', label: '10,000 images / batch' },
  { icon: '🎨', label: 'Custom background fill' },
  { icon: '⚡', label: 'REST API access' },
  { icon: '🔒', label: 'SOC 2 certified' },
  { icon: '📐', label: 'AVIF & TIFF export' },
  { icon: '🔄', label: 'Batch presets' },
  { icon: '🖼️', label: 'PNG transparent export' },
  { icon: '📊', label: 'Processing analytics' },
  { icon: '🎬', label: 'GIF & video support' },
  { icon: '✏️', label: 'Manual wand correction' },
  { icon: '🌍', label: 'Works on any image type' },
  { icon: '👥', label: 'Team workspaces' },
]

function Marquee() {
  return (
    <div className="overflow-hidden border-y border-[var(--border)] bg-[var(--accent)]/40 py-4">
      <style>{`
        @keyframes marquee-scroll { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        .marquee-track { display:flex; width:max-content; animation: marquee-scroll 30s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16" style={{ background: 'linear-gradient(to right, rgba(238,241,251,0.9), transparent)' }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16" style={{ background: 'linear-gradient(to left, rgba(238,241,251,0.9), transparent)' }} />
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div key={i} className="mx-1.5 flex shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 px-4 py-1.5">
              <span className="text-[13px]">{item.icon}</span>
              <span className="whitespace-nowrap text-[11px] font-[600] text-[var(--muted-foreground)]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Eraser,
    color: 'text-[var(--primary)]',
    bg: 'bg-[var(--accent)]',
    border: 'hover:border-[var(--primary)]/30',
    title: 'Watermark Removal',
    description: 'AI detects and removes any watermark — text, logo, overlay, or semi-transparent stamp — leaving your image pristine.',
    bullets: ['Works on overlapping & tiled watermarks', 'Sub-pixel inpainting reconstruction', 'Manual brush for stubborn areas'],
  },
  {
    icon: ImageIcon,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'hover:border-purple-200',
    title: 'Background Removal',
    description: 'Isolate your subject in one click. Export transparent PNG, solid color, or composite onto a new scene.',
    bullets: ['Hair & fur precision edge detection', 'Replace with any color or image', 'Shadow & reflection preservation'],
  },
  {
    icon: ArrowUp,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'hover:border-amber-200',
    title: 'AI Upscaling',
    description: 'Double or quadruple resolution with our generative upscaler. Recover lost detail from compressed or low-res files.',
    bullets: ['2× and 4× modes', '300 DPI print-ready TIFF export', 'Preserves original color grading'],
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <Badge variant="accent" className="mb-4 gap-1.5">
            <Sparkles className="h-3 w-3" />
            One pipeline, every use case
          </Badge>
          <h2 className="mb-4 text-[2.6rem] font-[750] tracking-[-0.03em] text-[var(--foreground)] leading-[1.1]">
            Your images, exactly as you need them
          </h2>
          <p className="text-base text-[var(--muted-foreground)] leading-relaxed">
            Apply one operation or chain all of them in a single batch — whether you're a solo photographer or a studio processing thousands.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <FadeIn key={f.title} delay={i * 0.07}>
                <div className={cn('group h-full rounded-2xl border border-[var(--border)] bg-white/80 backdrop-blur-sm p-6 transition-all duration-200 hover:shadow-lg', f.border)}>
                  <div className={cn('mb-5 flex h-11 w-11 items-center justify-center rounded-xl', f.bg)}>
                    <Icon className={cn('h-5 w-5', f.color)} strokeWidth={1.8} />
                  </div>
                  <h3 className="mb-2 text-[15px] font-[700] text-[var(--foreground)] tracking-[-0.01em]">{f.title}</h3>
                  <p className="mb-4 text-[13px] text-[var(--muted-foreground)] leading-relaxed">{f.description}</p>
                  <ul className="space-y-2">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-[12px] text-[var(--muted-foreground)]">
                        <Check className={cn('h-3.5 w-3.5 shrink-0', f.color)} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Before / After showcase ──────────────────────────────────────────────────

const COMPARISONS = [
  { label: 'Photo watermarks', desc: 'Logos, text, stamps', color: 'text-[var(--primary)]' },
  { label: 'Background removal', desc: 'Clean subject extraction', color: 'text-purple-500' },
  { label: 'Logo removal', desc: 'Brand mark erasure', color: 'text-amber-600' },
  { label: 'Text erasure', desc: 'Remove captions & overlays', color: 'text-emerald-600' },
]

function ShowcaseSection() {
  return (
    <section className="py-20 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="text-[2.2rem] font-[750] tracking-[-0.03em] text-[var(--foreground)] leading-[1.1] mb-3">
            See the results for yourself
          </h2>
          <p className="text-[var(--muted-foreground)]">Drag the slider on any example to compare before and after.</p>
        </FadeIn>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {COMPARISONS.map((item, i) => (
            <FadeIn key={item.label} delay={i * 0.06}>
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white/80 backdrop-blur-sm transition-shadow hover:shadow-md">
                <BeforeAfterSlider before={<ProductBefore />} after={<ProductAfter />} className="rounded-none" />
                <div className="p-4">
                  <h3 className={cn('mb-0.5 text-[13px] font-[700]', item.color)}>{item.label}</h3>
                  <p className="text-[11px] text-[var(--muted-foreground)]">{item.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Scale section ────────────────────────────────────────────────────────────

function ScaleSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <FadeIn>
            <Badge variant="accent" className="mb-5 gap-1.5">
              <BarChart3 className="h-3 w-3" />
              Built for any scale
            </Badge>
            <h2 className="mb-5 text-[2.4rem] font-[750] tracking-[-0.03em] text-[var(--foreground)] leading-[1.1]">
              10,000 images in one click.<br />
              <span className="text-[var(--primary)]">Results in minutes.</span>
            </h2>
            <p className="mb-8 text-[var(--muted-foreground)] leading-relaxed">
              Whether you're cleaning up one shoot or processing a whole season's catalog, our infrastructure scales instantly. Same speed for 10 or 10,000 images.
            </p>
            <div className="mb-8 space-y-4">
              {[
                { icon: Layers, label: 'Up to 10,000 images per batch', desc: 'No splitting or multiple uploads needed' },
                { icon: Clock, label: 'Average 1.3s per image', desc: 'Parallel processing across distributed nodes' },
                { icon: ShieldCheck, label: 'SOC 2 Type II certified', desc: 'Images encrypted, deleted after 24h, never used for training' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]">
                    <Icon className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[13px] font-[650] text-[var(--foreground)]">{label}</p>
                    <p className="text-[12px] text-[var(--muted-foreground)]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="#pricing" className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-[13px] font-[650] text-white shadow-sm hover:bg-[var(--primary-hover)] transition-colors">
              See pricing
              <ChevronRight className="h-4 w-4" />
            </a>
          </FadeIn>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '10,000', label: 'Images / batch', color: 'text-[var(--primary)]' },
              { value: '1.3s', label: 'Avg processing', color: 'text-amber-600' },
              { value: '99.4%', label: 'Accuracy', color: 'text-purple-500' },
              { value: '24h', label: 'Max data retention', color: 'text-emerald-600' },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.07}>
                <div className="rounded-2xl border border-[var(--border)] bg-white/80 backdrop-blur-sm p-6 hover:shadow-md transition-shadow">
                  <p className={cn('mb-1 text-[2.2rem] font-[750] tracking-tight leading-none', stat.color)}>{stat.value}</p>
                  <p className="text-[12px] font-[500] text-[var(--muted-foreground)]">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── How it works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section className="py-24 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn className="mx-auto mb-16 max-w-xl text-center">
          <h2 className="mb-3 text-[2.2rem] font-[750] tracking-[-0.03em] text-[var(--foreground)] leading-[1.1]">
            Three steps, perfect results
          </h2>
          <p className="text-[var(--muted-foreground)]">No technical skills required. Upload, configure, download.</p>
        </FadeIn>

        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] top-8 hidden h-px bg-[var(--border)] md:block" />
          {[
            {
              step: '01', title: 'Upload your batch',
              desc: 'Drag & drop up to 10,000 images. JPG, PNG, WEBP, AVIF, and TIFF supported.',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              ),
            },
            {
              step: '02', title: 'Configure the pipeline',
              desc: 'Toggle watermark removal, background, upscaling. Save as a preset for future runs.',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
                  <path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
                </svg>
              ),
            },
            {
              step: '03', title: 'Download results',
              desc: 'Processed images ready in minutes. Download as ZIP or integrate via REST API.',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              ),
            },
          ].map(({ step, title, desc, icon }, i) => (
            <FadeIn key={step} delay={i * 0.1} className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)] shadow-[0_8px_24px_rgba(79,70,229,0.25)]">
                {icon}
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

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  { quote: "I shoot 600+ portraits per wedding. Cleanify removes watermarks from my reference shots and strips backgrounds in under 3 minutes. Saved my weekends.", author: "Emma Laurent", role: "Wedding Photographer · Paris", avatar: "EL", rating: 5 },
  { quote: "My thumbnail workflow went from 90 minutes to 8 minutes. The background removal handles complex hair better than anything I've tried — and I've tried everything.", author: "Thomas Wagner", role: "YouTube Creator · 2.4M subscribers", avatar: "TW", rating: 5 },
  { quote: "We use Cleanify for every client pitch deck — clean product shots, no messy backgrounds. My junior designers used to spend half their day on this.", author: "Priya Sharma", role: "Creative Director · Arkh Studio", avatar: "PS", rating: 5 },
  { quote: "As a photojournalist, I receive dozens of reference images with agency watermarks. Cleanify handles them in seconds — the reconstruction is remarkably clean.", author: "Julien Moreau", role: "Photojournalist · AFP", avatar: "JM", rating: 5 },
  { quote: "I build game asset libraries. Cleanify strips backgrounds and upscales sprites to 4x without the jagged edges I got from every other tool. Genuinely impressive.", author: "Marcus Okafor", role: "Indie Game Developer", avatar: "MO", rating: 5 },
  { quote: "Our social content team publishes 40 posts a week. The batch processing is a lifesaver — we drop a folder, get back clean images, done. No subscriptions to five different tools.", author: "Sofia Nascimento", role: "Head of Social · Pulse Agency", avatar: "SN", rating: 5 },
  { quote: "I archive historical photographs for a museum. Cleanify's upscaler brings out detail in century-old scans that we thought was lost forever.", author: "Dr. Aiko Tanaka", role: "Digital Archivist · National Museum", avatar: "AT", rating: 5 },
  { quote: "I'm a fashion blogger. Every brand sends me product images with their stock watermarks still on them. One drag-and-drop and I have clean shots for my posts.", author: "Riley Anderson", role: "Fashion & Lifestyle Blogger", avatar: "RA", rating: 5 },
  { quote: "Tried rembg, PhotoRoom, remove.bg — Cleanify's background removal is on another level for complex subjects like jewelry on reflective surfaces.", author: "Lena Fischer", role: "Product Photographer · Berlin", avatar: "LF", rating: 5 },
]

function Testimonials() {
  const [page, setPage] = useState(0)
  const total = Math.ceil(TESTIMONIALS.length / 3)
  const visible = TESTIMONIALS.slice(page * 3, page * 3 + 3)

  return (
    <section id="testimonials" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="mb-2 text-[2.2rem] font-[750] tracking-[-0.03em] text-[var(--foreground)] leading-[1.1]">
            Loved by creators, photographers & studios
          </h2>
          <p className="text-[var(--muted-foreground)]">Real reviews from real customers.</p>
        </FadeIn>

        <div className="grid min-h-[220px] grid-cols-1 gap-5 md:grid-cols-3">
          {visible.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col rounded-2xl border border-[var(--border)] bg-white/80 backdrop-blur-sm p-6 hover:shadow-md transition-all"
            >
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mb-5 flex-1 text-[13px] text-[var(--foreground)] leading-relaxed italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[11px] font-[700] text-white">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-[12px] font-[650] text-[var(--foreground)]">{t.author}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn('h-2 rounded-full transition-all duration-300', i === page ? 'w-8 bg-[var(--primary)]' : 'w-2 bg-[var(--border)]')}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

const PRICING = [
  {
    name: 'Free', price: 0, period: 'forever', highlight: false, badge: null,
    creditHeadline: '1 credit / day', creditSub: '= 10 images · resets every morning',
    pill: '🎁 No card required',
    features: ['10 images per day', 'Watermark removal', 'Background removal', '1 batch at a time', 'Standard resolution'],
    cta: 'Get started free',
    ctaHref: '#studio',
  },
  {
    name: 'Premium', price: 15, period: '/mo', highlight: false, badge: null,
    creditHeadline: '50 credits / month', creditSub: '≈ 500 images · unused credits roll forward',
    pill: '🚀 Best for creators',
    features: ['500+ images / month', 'All AI operations', '2× upscaling', 'Batch up to 200 images', 'Email support'],
    cta: 'Start Premium',
    ctaHref: '#',
  },
  {
    name: 'Pro', price: 25, period: '/mo', highlight: true, badge: 'Most popular',
    creditHeadline: '200 credits / month', creditSub: '≈ 2,000 images + 5 bonus / day',
    pill: '⚡ = 2,000+ images / month',
    features: ['2,000+ images / month', 'All AI operations', '4× upscaling', 'API access', 'Priority support', 'Batch presets & history'],
    cta: 'Start free trial',
    ctaHref: '#',
  },
  {
    name: 'Enterprise', price: null, period: '', highlight: false, badge: null,
    creditHeadline: 'Custom volume', creditSub: 'Tailored for your team, studio, or platform',
    pill: '🏢 Always quoted on demand',
    features: ['Unlimited images', 'Custom AI fine-tuning', 'SLA + dedicated infra', 'SSO / SAML', 'Dedicated account manager', 'Custom integrations'],
    cta: 'Contact sales',
    ctaHref: 'mailto:hello@cleanify.ai',
  },
]

function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="py-24 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-[2.4rem] font-[750] tracking-[-0.03em] text-[var(--foreground)] leading-[1.1]">
            Simple, transparent pricing
          </h2>
          <p className="mb-6 text-[var(--muted-foreground)]">Start free. Scale as you grow. No hidden fees.</p>
          <div className="inline-flex items-center rounded-xl border border-[var(--border)] bg-white/80 p-1">
            {(['Monthly', 'Annual'] as const).map((label) => (
              <button
                key={label}
                onClick={() => setAnnual(label === 'Annual')}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-1.5 text-[13px] font-[600] transition-all',
                  (label === 'Annual') === annual ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--muted-foreground)]'
                )}
              >
                {label}
                {label === 'Annual' && <span className="text-[9px] font-[700] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">-20%</span>}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Credit system explainer */}
        <FadeIn>
          <div className="mx-auto mb-10 flex max-w-2xl items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/80 px-5 py-3.5 backdrop-blur-sm">
            <span className="text-xl">🪙</span>
            <p className="text-[13px] text-[var(--muted-foreground)]">
              <span className="font-[700] text-[var(--foreground)]">1 credit = 10 images processed.</span>{' '}
              Credits cover all operations — watermark removal, background, upscaling — in a single pass.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PRICING.map((plan, i) => {
            const price = plan.price !== null ? (annual && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price) : null
            return (
              <FadeIn key={plan.name} delay={i * 0.07}>
                <div className={cn(
                  'relative flex h-full flex-col rounded-2xl border p-7 transition-all',
                  plan.highlight
                    ? 'border-[var(--primary)] bg-white shadow-[0_8px_32px_rgba(79,70,229,0.15)] scale-[1.02]'
                    : 'border-[var(--border)] bg-white/80 backdrop-blur-sm hover:shadow-md'
                )}>
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="shadow-sm text-[10px]">{plan.badge}</Badge>
                    </div>
                  )}

                  <h3 className="mb-1 text-[14px] font-[700] text-[var(--foreground)]">{plan.name}</h3>

                  {/* Price */}
                  <div className="mb-4">
                    {price !== null
                      ? <div className="flex items-baseline gap-1">
                          <span className="text-[2.4rem] font-[750] text-[var(--foreground)] tracking-tight leading-none">
                            {price === 0 ? 'Free' : `€${price}`}
                          </span>
                          {price > 0 && <span className="text-[13px] text-[var(--muted-foreground)]">{plan.period}</span>}
                        </div>
                      : <span className="text-[2rem] font-[750] text-[var(--foreground)]">Custom</span>
                    }
                  </div>

                  {/* Credit highlight box */}
                  <div className={cn(
                    'mb-5 rounded-xl p-3',
                    plan.highlight ? 'bg-[var(--accent)]' : 'bg-gray-50'
                  )}>
                    <p className={cn('text-[14px] font-[750] tracking-tight', plan.highlight ? 'text-[var(--primary)]' : 'text-[var(--foreground)]')}>
                      🪙 {plan.creditHeadline}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">{plan.creditSub}</p>
                    <span className="mt-2 inline-block rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-[650] text-[var(--muted-foreground)]">
                      {plan.pill}
                    </span>
                  </div>

                  <ul className="mb-7 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className={cn('mt-0.5 h-4 w-4 shrink-0', plan.highlight ? 'text-[var(--primary)]' : 'text-emerald-500')} />
                        <span className="text-[12px] text-[var(--muted-foreground)]">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={plan.ctaHref}
                    className={cn(
                      'block w-full rounded-xl py-2.5 text-center text-[13px] font-[650] transition-all',
                      plan.highlight
                        ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]'
                        : plan.name === 'Enterprise'
                          ? 'bg-gray-900 text-white hover:bg-gray-700'
                          : 'border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                    )}
                  >
                    {plan.cta}
                  </a>
                </div>
              </FadeIn>
            )
          })}
        </div>
        <FadeIn>
          <p className="mt-8 text-center text-[12px] text-[var(--muted-foreground)]">
            No credit card required · 500 free images on signup · Cancel anytime
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "I'm a photographer, not a business. Is Cleanify.ai for me?",
    a: "Absolutely. Cleanify.ai is used by solo photographers, content creators, digital artists, archivists, researchers, and game developers just as much as by studios and agencies. If you have images to clean up, it works for you.",
  },
  {
    q: 'What image formats are supported?',
    a: 'Input: PNG, JPG, JPEG, WEBP, GIF, AVIF, and TIFF. Output: all of the above plus transparent PNG. RAW format support (.CR2, .ARW, .NEF) is on our roadmap for Q3.',
  },
  {
    q: 'How many images can I process at once?',
    a: 'Up to 10,000 images per batch on the Pro plan, with no limit on total batches per month. On the Free plan, batches are capped at 10 images.',
  },
  {
    q: 'Does it work on screenshots and social media images?',
    a: "Yes. Cleanify handles any JPEG, PNG, or WEBP regardless of where it came from — screenshots, stock photos, social media exports, scanned documents. The AI adapts to the image content automatically.",
  },
  {
    q: 'What is the difference between Auto and Manual Wand modes?',
    a: "Auto mode uses AI to detect and erase watermarks with zero input from you. Manual Wand lets you paint over a specific area with a red brush — perfect for overlapping watermarks, unusual placements, or anything the AI misses. Both modes can be used together.",
  },
  {
    q: 'Can I replace a removed background with a custom image?',
    a: "Right now you can replace the background with a solid color (transparent, white, black, or any hex value). Custom background image replacement is coming in the next release — it's already in our beta.",
  },
  {
    q: 'Is my data private and secure?',
    a: 'SOC 2 Type II certified. All uploads are encrypted in transit (TLS 1.3) and at rest (AES-256). Images are automatically and permanently deleted after 24 hours. We never use your images to train our models — ever.',
  },
  {
    q: 'Can I use Cleanify.ai via API?',
    a: 'Yes. REST API access is included from the Pro plan onward. We provide SDKs for JavaScript/Node.js, Python, and PHP. Async webhooks are supported for batch job notifications.',
  },
  {
    q: 'What is the maximum file size per image?',
    a: 'Up to 50 MB per file on the Free and Pro plans. Enterprise customers can request higher limits. The AI handles resolutions up to 100 megapixels.',
  },
  {
    q: 'Does Cleanify work on video thumbnails and GIFs?',
    a: 'Yes for GIFs — watermark removal and background removal both support animated GIFs and process each frame. Video thumbnail images work like any other JPEG/PNG. Full video file processing is available for video tools (Watermark Remover, Subtitles Remover, etc.).',
  },
  {
    q: 'Do unused credits roll over to the next month?',
    a: "Credits reset every billing cycle and don't roll over. You can purchase additional credit packs at any time without upgrading your plan. Daily bonus credits also reset each morning.",
  },
  {
    q: 'Can I share access with my team?',
    a: 'Team workspaces are available on the Pro plan — up to 5 seats share a single credit pool. Enterprise plans support unlimited seats with role-based access control and SSO/SAML.',
  },
  {
    q: 'Is there a desktop or mobile app?',
    a: "Cleanify.ai is a web app that works on any browser. We're building a desktop app (Mac, Windows) for offline batch processing — join the waitlist in your account settings. A mobile companion app is planned for later this year.",
  },
  {
    q: 'Can I try it before subscribing?',
    a: "Yes — every new account gets 500 free credits with no credit card required. That's enough to process up to 500 images. No time limit.",
  },
  {
    q: 'Does the AI upscaler preserve my original color grading?',
    a: 'Yes. Our upscaler is a detail-recovery model, not a re-colorizer. It enhances sharpness and texture without shifting hues, shadows, or any color grade you applied in Lightroom or Capture One.',
  },
  {
    q: 'What happens if the result is not good enough?',
    a: "Use the Manual Wand tool to paint corrections directly on the image. If a batch job fails or produces poor results, we credit your account automatically. You can also reach our support team — we review every flagged result.",
  },
  {
    q: 'How do I cancel or get a refund?',
    a: "You can cancel your subscription at any time from your account settings — no penalties, no hoops. If you're unhappy within the first 7 days of a paid plan, contact us for a full refund.",
  },
  {
    q: 'Does Cleanify.ai work offline?',
    a: "The Studio (browser tool) requires an internet connection for AI processing. A local/offline CLI for power users is on the roadmap. All your downloaded results are yours to keep forever, of course.",
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn className="mb-12 text-center">
          <h2 className="mb-3 text-[2.2rem] font-[750] tracking-[-0.03em] text-[var(--foreground)] leading-[1.1]">
            Frequently asked questions
          </h2>
          <p className="text-[var(--muted-foreground)]">
            Can't find what you're looking for?{' '}
            <a href="mailto:hello@cleanify.ai" className="font-[600] text-[var(--primary)] hover:underline">Chat with us</a>
          </p>
        </FadeIn>

        <div className="space-y-0.5">
          {FAQ_ITEMS.map((item, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div className="border-b border-[var(--border)] last:border-b-0">
                <button
                  className="group flex w-full items-center justify-between gap-4 py-5 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className={cn('text-[13px] font-[600] transition-colors', open === i ? 'text-[var(--primary)]' : 'text-[var(--foreground)] group-hover:text-[var(--primary)]')}>
                    {item.q}
                  </span>
                  <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all', open === i ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]')}>
                    {open === i ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  </span>
                </button>
                <div className={cn('overflow-hidden transition-all duration-300', open === i ? 'max-h-64 pb-5' : 'max-h-0')}>
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

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="relative overflow-hidden bg-[var(--primary)] py-24">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")` }} />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <FadeIn>
          <h2 className="mb-5 text-[2.6rem] font-[750] tracking-[-0.03em] text-white leading-[1.1] text-balance">
            Your images, exactly how you need them.
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base text-white/75 leading-relaxed">
            Photographers, creators, designers, agencies — 500,000+ people trust Cleanify.ai. Start free, no credit card required.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#studio" className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[13px] font-[700] text-[var(--primary)] shadow-lg hover:bg-white/90 transition-colors">
              <Zap className="h-4 w-4" strokeWidth={2.5} />
              Start for free
              <ArrowRight className="h-4 w-4" />
            </a>
            <button className="rounded-xl border border-white/30 px-6 py-3 text-[13px] font-[650] text-white hover:bg-white/10 transition-colors">
              Talk to sales
            </button>
          </div>
          <p className="mt-5 text-[12px] text-white/50">No credit card required · 500 free images · Cancel anytime</p>
        </FadeIn>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-white/80 backdrop-blur-sm py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)]">
                <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[15px] font-[700] tracking-[-0.02em]">
                Cleanify<span className="text-[var(--primary)]">.ai</span>
              </span>
            </div>
            <p className="max-w-[220px] text-[12px] text-[var(--muted-foreground)] leading-relaxed">
              AI-powered image processing for creators, photographers, and studios. Remove watermarks, clean backgrounds, upscale at any volume.
            </p>
          </div>
          {[
            { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }, { label: 'Changelog', href: '#' }, { label: 'Roadmap', href: '#' }] },
            { title: 'Resources', links: [{ label: 'Documentation', href: '#' }, { label: 'API Reference', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Status', href: '#' }] },
            { title: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Careers', href: '#' }, { label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-[10px] font-[700] uppercase tracking-[0.15em] text-[var(--foreground)]">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-[12px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] pt-8 sm:flex-row">
          <p className="text-[11px] text-[var(--muted-foreground)]">© 2026 Cleanify.ai · Made with ⚡ for creators everywhere</p>
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
            <span className="text-[11px] text-[var(--muted-foreground)]">SOC 2 Certified</span>
            <span className="text-[11px] text-[var(--muted-foreground)]">·</span>
            <span className="text-[11px] text-[var(--muted-foreground)]">GDPR Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Google Auth Modal ────────────────────────────────────────────────────────

function AuthModal({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleGoogle = () => {
    setLoading(true)
    // TODO: replace with real Google OAuth flow
    // e.g. window.location.href = '/auth/google'
    setTimeout(() => {
      setLoading(false)
      onSuccess()
    }, 1200)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,15,30,0.55)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]">
            <Sparkles className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <h3 className="text-[1.25rem] font-[750] text-[var(--foreground)] tracking-tight">Sign in to process images</h3>
          <p className="mt-1.5 text-[13px] text-[var(--muted-foreground)]">
            Create a free account to run the pipeline.<br />No credit card required.
          </p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 text-[14px] font-[600] text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-70"
        >
          {loading ? (
            <svg className="h-5 w-5 animate-spin text-[var(--primary)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-100" />
          <span className="text-[11px] text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-100" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="mt-4 w-full rounded-xl border border-[var(--border)] bg-[var(--accent)] py-2.5 text-center text-[13px] font-[650] text-[var(--primary)] transition-all hover:bg-white disabled:opacity-70"
        >
          Sign up with email
        </button>

        <p className="mt-5 text-center text-[11px] text-gray-400">
          By continuing you agree to our{' '}
          <a href="#" className="underline hover:text-gray-600">Terms</a> &amp;{' '}
          <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [batchFiles,    setBatchFiles]   = useState<BatchFile[]>([])
  const [config,        setConfig]       = useState<PipelineConfig>(defaultConfig)
  const [currentIndex,  setCurrentIndex] = useState(0)
  const [masks,         setMasks]        = useState<Record<string, string>>({})
  const [batchProgress, setBatchProgress] = useState<{ active: boolean; current: number; total: number } | null>(null)
  const [isLoggedIn,    setIsLoggedIn]   = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [undoStack,     setUndoStack]    = useState<{ files: BatchFile[]; index: number }[]>([])
  const batchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup interval on unmount
  useEffect(() => () => { if (batchIntervalRef.current) clearInterval(batchIntervalRef.current) }, [])

  const canUndo = undoStack.length > 0

  const handleUndo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev
      const { files, index } = prev[prev.length - 1]
      setBatchFiles(files)
      setCurrentIndex(index)
      return prev.slice(0, -1)
    })
  }, [])

  // Ctrl/Cmd+Z keyboard shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleUndo])

  const handleAddToBatch = useCallback((files: BatchFile[]) => {
    setBatchFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name))
      return [...prev, ...files.filter((f) => !existing.has(f.name))]
    })
  }, [])

  const handleRemoveFromBatch = useCallback((id: string) => {
    setBatchFiles((prev) => {
      const removed = prev.find((f) => f.id === id)
      if (removed?.source === 'upload') URL.revokeObjectURL(removed.url)
      const next = prev.filter((f) => f.id !== id)
      setCurrentIndex((i) => Math.min(i, Math.max(0, next.length - 1)))
      return next
    })
  }, [])

  const handleClearBatch = useCallback(() => {
    setBatchFiles((prev) => {
      prev.forEach((f) => { if (f.source === 'upload') URL.revokeObjectURL(f.url) })
      return []
    })
    setCurrentIndex(0)
  }, [])

  const handleFilesUpload = useCallback((files: File[]) => {
    const newItems: BatchFile[] = files.map((f) => ({
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      name: f.name.replace(/\.[^.]+$/, ''),
      url: URL.createObjectURL(f),
      source: 'upload' as const,
    }))
    handleAddToBatch(newItems)
  }, [handleAddToBatch])

  const handleConfigChange = useCallback((partial: Partial<PipelineConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }))
  }, [])

  const handleMaskSave = useCallback((fileId: string, maskDataUrl: string) => {
    setMasks((prev) => ({ ...prev, [fileId]: maskDataUrl }))
  }, [])

  const handleRemoveBg = useCallback(async () => {
    const current = batchFiles[currentIndex]
    if (!current) return

    const snapshot = { files: batchFiles, index: currentIndex }

    const raw = await fetch(current.url)
    const blob = await raw.blob()
    const form = new FormData()
    form.append('file', blob, current.name + '.png')

    const res = await fetch('/api/v1/remove-background', { method: 'POST', body: form })
    if (!res.ok) throw new Error('Background removal failed')

    const resultBlob = await res.blob()
    const newUrl = URL.createObjectURL(resultBlob)

    if (current.source === 'upload') URL.revokeObjectURL(current.url)

    setUndoStack(prev => [...prev.slice(-19), snapshot])
    setBatchFiles((prev) =>
      prev.map((f, i) => i === currentIndex ? { ...f, url: newUrl } : f)
    )
  }, [batchFiles, currentIndex])

  const handleUpdateFile = useCallback((fileId: string, newUrl: string) => {
    setBatchFiles(prev => prev.map(f => {
      if (f.id !== fileId) return f
      if (f.source === 'upload') URL.revokeObjectURL(f.url)
      return { ...f, url: newUrl }
    }))
  }, [])

  const runBatch = useCallback(async () => {
    const files = batchFiles
    const total = files.length
    if (total === 0) return
    if (batchIntervalRef.current) clearInterval(batchIntervalRef.current)

    const snapshot = { files: [...batchFiles], index: currentIndex }

    setBatchProgress({ active: true, current: 0, total })
    setCurrentIndex(0)

    const ops = {
      remove_watermark:  config.remove_watermark,
      remove_background: config.remove_background,
      upscale:           config.upscale,
      upscale_factor:    config.upscale_factor,
      resize:            config.resize.enabled,
      resize_w:          config.resize.width,
      resize_h:          config.resize.height,
      compress:          config.compress,
      compress_quality:  config.compress_quality,
      output_format:     config.output.format,
      enhance:           config.enhance,
      brightness:        config.brightness / 100,
      contrast:          config.contrast   / 100,
      saturation:        config.saturation / 100,
      sharpness:         config.sharpness  / 100,
      unblur:            config.unblur,
      unblur_strength:   config.unblur_strength,
    }

    const results: Array<{ id: string; newUrl: string; oldUrl: string; source: BatchFile['source'] }> = []

    for (let i = 0; i < total; i++) {
      setCurrentIndex(i)
      setBatchProgress({ active: true, current: i + 1, total })
      const file = files[i]
      try {
        const raw  = await fetch(file.url)
        const blob = await raw.blob()
        const form = new FormData()
        form.append('file', blob, file.name + '.png')
        form.append('operations', JSON.stringify({
          ...ops,
          ...(masks[file.id] ? { mask_dataurl: masks[file.id] } : {}),
        }))
        const res = await fetch('/api/v1/process-image', { method: 'POST', body: form })
        if (res.ok) {
          const out = await res.blob()
          results.push({ id: file.id, newUrl: URL.createObjectURL(out), oldUrl: file.url, source: file.source })
        }
      } catch { /* backend offline — skip */ }
    }

    if (results.length > 0) {
      setUndoStack(prev => [...prev.slice(-19), snapshot])
      setBatchFiles(prev => prev.map(f => {
        const r = results.find(x => x.id === f.id)
        if (!r) return f
        if (r.source === 'upload') URL.revokeObjectURL(r.oldUrl)
        return { ...f, url: r.newUrl }
      }))
    }

    setBatchProgress(null)
    setCurrentIndex(0)
  }, [batchFiles, config, masks])

  const handleRun = useCallback(() => {
    runBatch()
  }, [runBatch])

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onSuccess={() => { setIsLoggedIn(true); setShowAuthModal(false); runBatch() }}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </AnimatePresence>

      <MeshBackground />
      <Header />

      {/* Studio — fills the first viewport */}
      <section id="studio" className="relative flex overflow-hidden" style={{ height: 'calc(100vh - 60px)' }}>
        <WorkspaceCanvas
          batchFiles={batchFiles}
          currentIndex={currentIndex}
          onChangeIndex={setCurrentIndex}
          onFilesUpload={handleFilesUpload}
          config={config}
          onMaskSave={handleMaskSave}
          onUpdateFile={handleUpdateFile}
          batchProgress={batchProgress}
          onRemoveBg={handleRemoveBg}
          onUndo={handleUndo}
          canUndo={canUndo}
        />
        <Sidebar
          config={config}
          onChange={handleConfigChange}
          batchFiles={batchFiles}
          onFilesUpload={handleFilesUpload}
          onRemoveFromBatch={handleRemoveFromBatch}
          onClearBatch={handleClearBatch}
          onRun={handleRun}
        />
        <ScrollHint />
      </section>

      {/* Marketing sections — revealed on scroll */}
      <div id="discover">
        <StatsStrip />
        <LogoStrip />
        <Marquee />
        <FeaturesSection />
        <ShowcaseSection />
        <ScaleSection />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTASection />
        <Footer />
      </div>
    </div>
  )
}
