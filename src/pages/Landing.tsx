import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  ArrowRight,
  Check,
  Menu,
  X,
  Eraser,
  ImageIcon,
  ArrowUp,
  BarChart3,
  Clock,
  ShieldCheck,
  Star,
  ChevronRight,
  Layers,
  Sparkles,
  Plus,
  Minus,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { cn } from '@/lib/utils'

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-[var(--foreground)]">
              Cleanify<span className="text-[var(--primary)]">.ai</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {['Features', 'Pricing', 'Docs', 'Blog'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded-lg hover:bg-[var(--muted)]"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm">
                Start free trial
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--muted)]"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[var(--border)] py-3 space-y-1 bg-white">
            {['Features', 'Pricing', 'Docs', 'Blog'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg mx-1"
              >
                {item}
              </a>
            ))}
            <div className="pt-2 px-1 flex gap-2">
              <Link to="/dashboard" className="flex-1"><Button variant="outline" className="w-full" size="sm">Log in</Button></Link>
              <Link to="/dashboard" className="flex-1"><Button className="w-full" size="sm">Start free</Button></Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

// Fake product image: before (with watermark overlay)
function ProductBefore() {
  return (
    <div className="absolute inset-0">
      <div
        className="w-full h-full"
        style={{
          background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)',
        }}
      />
      {/* Product silhouette */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
        <rect x="80" y="40" width="240" height="170" rx="8" fill="#334155" />
        <rect x="100" y="55" width="200" height="140" rx="4" fill="#94a3b8" />
        <circle cx="200" cy="125" r="40" fill="#64748b" />
        <rect x="140" y="100" width="120" height="5" rx="2" fill="#cbd5e1" />
        <rect x="155" y="115" width="90" height="4" rx="2" fill="#cbd5e1" />
        <rect x="165" y="130" width="70" height="4" rx="2" fill="#cbd5e1" />
      </svg>
      {/* Watermark text overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          <p
            className="text-3xl font-black tracking-widest select-none"
            style={{
              color: 'rgba(71, 85, 105, 0.55)',
              transform: 'rotate(-25deg)',
              textShadow: '1px 1px 2px rgba(255,255,255,0.3)',
              letterSpacing: '0.3em',
            }}
          >
            WATERMARK
          </p>
          <p
            className="text-xl font-black tracking-widest select-none mt-2"
            style={{
              color: 'rgba(71, 85, 105, 0.4)',
              transform: 'rotate(-25deg)',
              letterSpacing: '0.5em',
            }}
          >
            © SAMPLE
          </p>
        </div>
      </div>
      {/* Corner logo watermark */}
      <div
        className="absolute bottom-4 right-4 px-2 py-1 rounded"
        style={{ background: 'rgba(71, 85, 105, 0.45)' }}
      >
        <span className="text-xs font-bold text-white/70 tracking-wider">STOCK PHOTO</span>
      </div>
    </div>
  )
}

// Fake product image: after (clean)
function ProductAfter() {
  return (
    <div className="absolute inset-0">
      <div
        className="w-full h-full"
        style={{
          background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)',
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
        <rect x="80" y="40" width="240" height="170" rx="8" fill="#334155" />
        <rect x="100" y="55" width="200" height="140" rx="4" fill="#94a3b8" />
        <circle cx="200" cy="125" r="40" fill="#64748b" />
        <rect x="140" y="100" width="120" height="5" rx="2" fill="#cbd5e1" />
        <rect x="155" y="115" width="90" height="4" rx="2" fill="#cbd5e1" />
        <rect x="165" y="130" width="70" height="4" rx="2" fill="#cbd5e1" />
      </svg>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative pt-24 pb-16 overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-40"
          style={{ background: 'oklch(0.546 0.236 264 / 0.08)', filter: 'blur(80px)' }} />
        <div className="absolute top-40 -right-32 w-[400px] h-[400px] rounded-full opacity-30"
          style={{ background: 'oklch(0.65 0.20 280 / 0.10)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 -left-20 w-[300px] h-[300px] rounded-full opacity-25"
          style={{ background: 'oklch(0.62 0.18 150 / 0.10)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top text */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.85_0.08_264)] bg-[var(--accent)] px-3.5 py-1.5 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span className="text-xs font-semibold text-[var(--primary)]">
              New: v2 upscaler — 4x resolution at zero visible loss
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-[1.08] text-balance mb-5">
            Perfect product images,{' '}
            <span className="text-[var(--primary)]">at any scale</span>
          </h1>

          <p className="text-lg text-[var(--muted-foreground)] leading-relaxed text-balance mb-8 max-w-2xl mx-auto">
            Remove watermarks, clean backgrounds, upscale resolution.
            Process <strong className="font-semibold text-[var(--foreground)]">10,000 images</strong> in one batch — no Photoshop, no manual work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            <Link to="/dashboard">
              <Button size="xl" className="shadow-blue gap-2.5">
                <Zap className="h-4.5 w-4.5" />
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/billing">
              <Button variant="outline" size="xl" className="gap-2">
                <Tag className="h-4 w-4" />
                See pricing
              </Button>
            </Link>
          </div>

          <p className="text-xs text-[var(--muted-foreground)]">
            No credit card required · 500 free images on signup · Cancel anytime
          </p>
        </div>

        {/* Hero visual: Before/After slider + stats */}
        <div className="relative mx-auto max-w-4xl">
          {/* Glow */}
          <div className="absolute inset-0 blur-3xl rounded-3xl scale-90 opacity-60"
            style={{ background: 'oklch(0.546 0.236 264 / 0.12)' }} />

          <div className="relative rounded-2xl border border-[var(--border)] bg-white shadow-2xl overflow-hidden">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[oklch(0.975_0_0)]">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="flex-1 mx-3">
                <div className="h-6 rounded-lg bg-[var(--border)] flex items-center px-3">
                  <span className="text-[10px] text-[var(--muted-foreground)]">app.cleanify.ai/batch</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="h-5 w-16 rounded bg-[var(--primary)] opacity-80" />
              </div>
            </div>

            {/* Side-by-side: slider + pipeline panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Left: Before/After comparison */}
              <div className="p-5 border-r border-[var(--border)]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-[oklch(0.62_0.18_150)]" />
                  <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">
                    Watermark Removal Demo
                  </span>
                </div>
                <BeforeAfterSlider
                  before={<ProductBefore />}
                  after={<ProductAfter />}
                  beforeLabel="Before"
                  afterLabel="After"
                  className="shadow-md"
                />
                <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
                  ← Drag the slider to see the difference
                </p>
              </div>

              {/* Right: Pipeline mockup */}
              <div className="p-5 bg-[oklch(0.975_0_0)]">
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-widest mb-3">
                  Pipeline Settings
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'Remove Watermark', on: true, color: 'bg-[var(--primary)]' },
                    { label: 'Remove Background', on: true, color: 'bg-[var(--primary)]' },
                    { label: 'AI Upscale (4x)', on: false, color: 'bg-[var(--border)]' },
                  ].map((item) => (
                    <div key={item.label} className={cn(
                      'flex items-center justify-between rounded-xl p-3 border transition-all',
                      item.on ? 'border-[oklch(0.85_0.08_264)] bg-[var(--accent)]' : 'border-[var(--border)] bg-white'
                    )}>
                      <span className="text-xs font-semibold text-[var(--foreground)]">{item.label}</span>
                      <div className={cn('relative h-5 w-9 rounded-full transition-colors', item.on ? 'bg-[var(--primary)]' : 'bg-[var(--border)]')}>
                        <span className={cn('absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform', item.on && 'translate-x-4')} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <div className="text-[10px] text-[var(--muted-foreground)] mb-2 uppercase tracking-widest font-semibold">
                    Output Format
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {['JPG', 'PNG', 'WEBP', 'AVIF'].map((fmt, i) => (
                      <span key={fmt} className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold border uppercase',
                        i === 0 ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--accent)]' : 'border-[var(--border)] text-[var(--muted-foreground)]'
                      )}>{fmt}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[var(--muted-foreground)]">Processing 1,240 images...</span>
                    <span className="text-[10px] font-bold text-[var(--primary)]">67%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--border)]">
                    <div className="h-full w-[67%] rounded-full bg-[var(--primary)] transition-all" />
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-[oklch(0.92_0.08_150)] p-2.5 flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-[oklch(0.62_0.18_150)] flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[oklch(0.40_0.18_150)]">Nike Summer Batch — Done</p>
                    <p className="text-[9px] text-[oklch(0.50_0.18_150)]">3,800 images · 4m 12s</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mt-10 pt-8 border-t border-[var(--border)]">
          {[
            { value: '500+', label: 'E-commerce brands' },
            { value: '12M+', label: 'Images processed' },
            { value: '99.4%', label: 'Accuracy rate' },
            { value: '1.3s', label: 'Avg per image' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</span>
              <span className="text-sm text-[var(--muted-foreground)]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Logo strip ───────────────────────────────────────────────────────────────

const BRAND_NAMES = ['Shopify', 'WooCommerce', 'Magento', 'BigCommerce', 'PrestaShop', 'Salesforce', 'Amazon', 'Etsy']

function LogoStrip() {
  return (
    <section className="py-10 border-b border-[var(--border)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-7">
          Trusted by teams at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {BRAND_NAMES.map((name) => (
            <div key={name} className="text-sm font-bold text-[oklch(0.82_0_0)] hover:text-[var(--muted-foreground)] transition-colors cursor-default select-none">
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Scrolling marquee ────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  { icon: '🪄', label: 'Auto watermark detection' },
  { icon: '✂️', label: 'Background removal' },
  { icon: '🔭', label: '4x AI upscaling' },
  { icon: '📦', label: '10,000 images / batch' },
  { icon: '🎨', label: 'Custom background colors' },
  { icon: '⚡', label: 'REST API access' },
  { icon: '🔒', label: 'SOC 2 certified' },
  { icon: '📐', label: 'AVIF & TIFF export' },
  { icon: '🔄', label: 'Batch presets' },
  { icon: '🌐', label: 'Shopify integration' },
  { icon: '📊', label: 'Processing analytics' },
  { icon: '👥', label: 'Team collaboration' },
]

function Marquee() {
  return (
    <section className="py-5 border-y border-[var(--border)] overflow-hidden bg-[oklch(0.98_0.01_264)]">
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 28s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, oklch(0.98 0.01 264), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, oklch(0.98 0.01 264), transparent)' }} />
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-5 py-2 mx-1 rounded-full border border-[var(--border)] bg-white shrink-0">
              <span className="text-sm">{item.icon}</span>
              <span className="text-xs font-semibold text-[var(--muted-foreground)] whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Eraser,
    color: 'text-[var(--primary)]',
    bg: 'bg-[var(--accent)]',
    title: 'Watermark Removal',
    description: 'Our AI detects and removes any watermark — text, logo, overlay, or semi-transparent stamp — without leaving artifacts or blurring the subject.',
    bullets: ['Handles overlapping watermarks', 'Sub-pixel reconstruction', 'No manual masking required'],
  },
  {
    icon: ImageIcon,
    color: 'text-[oklch(0.50_0.20_300)]',
    bg: 'bg-[oklch(0.95_0.05_300)]',
    title: 'Background Removal',
    description: 'Extract the product from its background in one click. Export as transparent PNG, white, black, or any custom hex color — ready for your store.',
    bullets: ['Precision edge detection', 'Custom color replacement', 'Shadow preservation mode'],
  },
  {
    icon: ArrowUp,
    color: 'text-[oklch(0.55_0.18_70)]',
    bg: 'bg-[oklch(0.96_0.05_70)]',
    title: 'AI Upscaling',
    description: 'Double or quadruple resolution with our generative upscaler. Recover fine details, textures, and sharpness from compressed or low-res images.',
    bullets: ['2x and 4x upscaling modes', 'Texture hallucination for fabric & leather', 'TIFF / 300 DPI export for print'],
  },
]

function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <Badge variant="accent" className="mb-4">
            <Sparkles className="h-3 w-3" />
            Three tools, one pipeline
          </Badge>
          <h2 className="text-4xl font-bold text-[var(--foreground)] tracking-tight mb-4">
            Everything your catalog needs
          </h2>
          <p className="text-lg text-[var(--muted-foreground)]">
            Apply one operation or all three in a single batch. Each step is tuned specifically for e-commerce product photography.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="group rounded-2xl border border-[var(--border)] p-6 hover:border-[var(--primary)]/30 hover:shadow-lg transition-all duration-200">
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl mb-5', feature.bg)}>
                  <Icon className={cn('h-5.5 w-5.5', feature.color)} />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <Check className={cn('h-3.5 w-3.5 shrink-0', feature.color)} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Before/After showcase (scrolling cards) ──────────────────────────────────

const COMPARISONS = [
  { label: 'Photo watermarks', desc: 'Remove logos, text and stamps', color: 'text-[var(--primary)]' },
  { label: 'Background removal', desc: 'Clean subject extraction', color: 'text-[oklch(0.50_0.20_300)]' },
  { label: 'Logo removal', desc: 'Brand mark clean removal', color: 'text-[oklch(0.55_0.18_70)]' },
  { label: 'Text erasure', desc: 'Remove captions & overlays', color: 'text-[oklch(0.62_0.18_150)]' },
]

function ShowcaseSection() {
  return (
    <section className="py-20 bg-[oklch(0.975_0_0)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--foreground)] tracking-tight mb-4">
            See the results for yourself
          </h2>
          <p className="text-lg text-[var(--muted-foreground)]">
            Drag the slider on any example to compare before and after.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {COMPARISONS.map((item) => (
            <div key={item.label} className="group rounded-2xl border border-[var(--border)] bg-white overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <BeforeAfterSlider
                  before={<ProductBefore />}
                  after={<ProductAfter />}
                  beforeLabel="Before"
                  afterLabel="After"
                  className="rounded-none"
                />
              </div>
              <div className="p-4">
                <h3 className={cn('text-sm font-bold mb-0.5', item.color)}>{item.label}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Scale section ────────────────────────────────────────────────────────────

function ScaleSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge variant="accent" className="mb-5">
              <BarChart3 className="h-3 w-3" />
              Built for enterprise scale
            </Badge>
            <h2 className="text-4xl font-bold text-[var(--foreground)] tracking-tight mb-5 leading-tight">
              10,000 images in one click.<br />
              <span className="text-[var(--primary)]">Results in minutes.</span>
            </h2>
            <p className="text-base text-[var(--muted-foreground)] leading-relaxed mb-8">
              Our distributed processing infrastructure scales instantly with your batch size. Whether 10 or 10,000 images, you get results at the same speed.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: Layers, label: 'Up to 10,000 images per batch', desc: 'No splitting or multiple uploads needed' },
                { icon: Clock, label: 'Average 1.3s per image', desc: 'Parallel processing across distributed nodes' },
                { icon: ShieldCheck, label: 'SOC 2 Type II certified', desc: 'Your images are encrypted and never stored beyond 24h' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] shrink-0">
                    <Icon className="h-4 w-4 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/dashboard">
              <Button size="lg">
                Process your first batch
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '10,000', label: 'Images / batch', color: 'text-[var(--primary)]' },
              { value: '1.3s', label: 'Avg processing time', color: 'text-[oklch(0.55_0.18_70)]' },
              { value: '99.4%', label: 'Watermark accuracy', color: 'text-[oklch(0.50_0.20_300)]' },
              { value: '24h', label: 'Max data retention', color: 'text-[oklch(0.62_0.18_150)]' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-[var(--border)] p-6 hover:shadow-md transition-shadow">
                <p className={cn('text-4xl font-bold mb-1', stat.color)}>{stat.value}</p>
                <p className="text-xs text-[var(--muted-foreground)] font-medium">{stat.label}</p>
              </div>
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
    <section className="py-24 bg-[oklch(0.975_0_0)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-[var(--foreground)] tracking-tight mb-4">
            Three steps to a perfect catalog
          </h2>
          <p className="text-lg text-[var(--muted-foreground)]">
            No technical expertise required. Upload, configure, download.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-[var(--border)] z-0" />
          {[
            { step: '01', title: 'Upload your batch', desc: 'Drag & drop up to 10,000 images. We accept JPG, PNG, WEBP, AVIF, and TIFF.', icon: UploadIcon },
            { step: '02', title: 'Configure the pipeline', desc: 'Toggle watermark removal, background, and upscaling. Save as a preset for future runs.', icon: SettingsIcon },
            { step: '03', title: 'Download results', desc: 'Processed images ready in minutes. Download as ZIP or connect via API.', icon: DownloadIcon },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="relative z-10 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)] shadow-blue mb-5">
                <Icon className="h-7 w-7 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-2">Step {step}</span>
              <h3 className="text-base font-bold text-[var(--foreground)] mb-2">{title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-xs">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "We went from 3 days of manual editing to 20 minutes per catalog update. Cleanify.ai paid for itself on day one.",
    author: "Sarah Chen",
    role: "Head of E-commerce · Maison & Co",
    avatar: "SC",
    rating: 5,
  },
  {
    quote: "The watermark removal is scary good. Even on semi-transparent overlays. Our product images finally look professional.",
    author: "Marcus Lefort",
    role: "Art Director · Nomad Studio",
    avatar: "ML",
    rating: 5,
  },
  {
    quote: "We process 8,000 new SKUs per month with a two-person team. Cleanify handles the boring part, we handle the creative.",
    author: "Aisha Dubois",
    role: "Operations Lead · Volta Apparel",
    avatar: "AD",
    rating: 5,
  },
  {
    quote: "I was skeptical at first, but after trying Cleanify, I'm blown away! It removed complex watermarks from my product photos flawlessly.",
    author: "David Rodriguez",
    role: "E-commerce Owner · TrendKick",
    avatar: "DR",
    rating: 5,
  },
  {
    quote: "As a photographer, I'm very particular about image quality. Cleanify exceeded my expectations while maintaining the original resolution perfectly.",
    author: "Emily Taylor",
    role: "Professional Photographer",
    avatar: "ET",
    rating: 5,
  },
  {
    quote: "Game changer for my social media content. Our workflow is 10x faster. The background removal quality is unmatched.",
    author: "Alex Kim",
    role: "Social Media Manager · Pulse Agency",
    avatar: "AK",
    rating: 5,
  },
]

function Testimonials() {
  const [page, setPage] = useState(0)
  const total = Math.ceil(TESTIMONIALS.length / 3)

  useEffect(() => {
    const id = setInterval(() => setPage((p) => (p + 1) % total), 5000)
    return () => clearInterval(id)
  }, [total])

  const visible = TESTIMONIALS.slice(page * 3, page * 3 + 3)

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--foreground)] tracking-tight mb-2">
            Loved by 500+ e-commerce teams
          </h2>
          <p className="text-[var(--muted-foreground)]">Real reviews from real customers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[220px]">
          {visible.map((t) => (
            <div key={t.author} className="rounded-2xl border border-[var(--border)] bg-white p-6 hover:shadow-md transition-all flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 text-[oklch(0.75_0.18_70)] fill-[oklch(0.75_0.18_70)]" />
                ))}
              </div>
              <p className="text-sm text-[var(--foreground)] leading-relaxed mb-5 italic flex-1">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-white text-xs font-bold shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)]">{t.author}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === page ? 'w-8 bg-[var(--primary)]' : 'w-2 bg-[var(--border)]'
              )}
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
    name: 'Starter',
    price: 29,
    images: '1,000',
    highlight: false,
    features: ['1,000 images/month', 'Watermark + background removal', '2x upscaling', 'Email support'],
    cta: 'Start free trial',
  },
  {
    name: 'Pro',
    price: 99,
    images: '10,000',
    highlight: true,
    features: ['10,000 images/month', 'All operations + 4x upscale', 'API access', 'Priority support', 'Batch presets'],
    cta: 'Start free trial',
  },
  {
    name: 'Enterprise',
    price: null,
    images: 'Unlimited',
    highlight: false,
    features: ['Unlimited images', 'Custom AI fine-tuning', 'SLA + dedicated infra', 'SSO / SAML', 'Account manager'],
    cta: 'Contact sales',
  },
]

function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="py-24 bg-[oklch(0.975_0_0)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--foreground)] tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] mb-6">Start free. Scale as you grow. No hidden fees.</p>
          <div className="inline-flex items-center rounded-xl border border-[var(--border)] p-1 bg-white">
            <button
              onClick={() => setAnnual(false)}
              className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all', !annual ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--muted-foreground)]')}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2', annual ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--muted-foreground)]')}
            >
              Annual
              <span className="text-[10px] font-bold bg-[oklch(0.92_0.08_150)] text-[oklch(0.40_0.18_150)] px-1.5 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING.map((plan) => {
            const price = plan.price ? (annual ? Math.round(plan.price * 0.8) : plan.price) : null
            return (
              <div key={plan.name} className={cn(
                'relative rounded-2xl border p-7 flex flex-col',
                plan.highlight ? 'border-[var(--primary)] shadow-blue scale-[1.02]' : 'border-[var(--border)] bg-white hover:shadow-md transition-all'
              )}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="shadow-sm">Most popular</Badge>
                  </div>
                )}
                <h3 className="text-base font-bold text-[var(--foreground)] mb-1">{plan.name}</h3>
                <div className="mb-5">
                  {price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-[var(--foreground)]">${price}</span>
                      <span className="text-sm text-[var(--muted-foreground)]">/mo</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-[var(--foreground)]">Custom</span>
                  )}
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{plan.images} images/month</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className={cn('h-4 w-4 shrink-0 mt-0.5', plan.highlight ? 'text-[var(--primary)]' : 'text-[oklch(0.62_0.18_150)]')} />
                      <span className="text-sm text-[var(--muted-foreground)]">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/dashboard">
                  <Button variant={plan.highlight ? 'default' : 'outline'} className="w-full" size="lg">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'What image formats does Cleanify.ai support?',
    a: 'We support PNG, JPG, JPEG, WEBP, AVIF, and TIFF. You can export results in all these formats as well. RAW format support is on our roadmap.',
  },
  {
    q: 'How many images can I process in one batch?',
    a: 'Up to 10,000 images per batch on the Pro plan. There is no limit to the number of batches you can run per month within your credit allowance.',
  },
  {
    q: 'Is my data secure? How long do you store my images?',
    a: 'We are SOC 2 Type II certified. All uploads are encrypted in transit (TLS 1.3) and at rest (AES-256). Images are automatically deleted after 24 hours. We never use your images to train our models.',
  },
  {
    q: 'Can I use Cleanify.ai via API?',
    a: 'Yes. API access is included from the Pro plan onwards. We provide a REST API with SDKs for JavaScript/Node, Python, and PHP. Webhooks are also supported for async batch notifications.',
  },
  {
    q: 'What is the difference between Auto and Manual modes?',
    a: 'Auto mode uses our AI to automatically detect and remove watermarks with zero manual input. Manual mode gives you a precision brush tool to paint over stubborn or complex watermarks that require pixel-perfect control.',
  },
  {
    q: 'Do unused credits roll over to the next month?',
    a: 'Credits reset every billing cycle and do not roll over. However, you can purchase additional credit packs at any time without upgrading your plan.',
  },
  {
    q: 'Can I try before I buy?',
    a: 'Yes — every new account gets 500 free credits with no credit card required. You can process up to 500 images immediately after signup.',
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--foreground)] tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-[var(--muted-foreground)]">
            Can't find what you're looking for?{' '}
            <a href="mailto:hello@cleanify.ai" className="text-[var(--primary)] font-medium hover:underline">
              Chat with us
            </a>
          </p>
        </div>

        <div className="space-y-1">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="border-b border-[var(--border)] last:border-b-0">
              <button
                className="group w-full flex items-center justify-between gap-4 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className={cn(
                  'text-sm font-semibold transition-colors',
                  open === i ? 'text-[var(--primary)]' : 'text-[var(--foreground)] group-hover:text-[var(--primary)]'
                )}>
                  {item.q}
                </span>
                <span className={cn(
                  'shrink-0 flex h-6 w-6 items-center justify-center rounded-full transition-all',
                  open === i ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                )}>
                  {open === i
                    ? <Minus className="h-3 w-3" />
                    : <Plus className="h-3 w-3" />
                  }
                </span>
              </button>
              <div className={cn(
                'overflow-hidden transition-all duration-300',
                open === i ? 'max-h-60 pb-5' : 'max-h-0'
              )}>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="py-24 bg-[var(--primary)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")` }}
      />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5 text-balance">
          Ready to transform your entire catalog?
        </h2>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
          Join 500+ e-commerce brands that trust Cleanify.ai. Start with 500 free images, no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/dashboard">
            <Button size="xl" className="bg-white text-[var(--primary)] hover:bg-white/90 shadow-lg gap-2">
              <Zap className="h-4.5 w-4.5" />
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="xl" className="text-white hover:bg-white/10 border border-white/30">
            Talk to sales
          </Button>
        </div>
        <p className="mt-4 text-sm text-white/60">No credit card required · 500 free images · Cancel anytime</p>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-white border-t border-[var(--border)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)]">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-base font-bold">
                Cleanify<span className="text-[var(--primary)]">.ai</span>
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-xs">
              AI-powered batch image processing for e-commerce teams. Remove watermarks, clean backgrounds, upscale resolution at scale.
            </p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
            { title: 'Resources', links: ['Documentation', 'API Reference', 'Blog', 'Status'] },
            { title: 'Company', links: ['About', 'Careers', 'Privacy', 'Terms'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)] mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--muted-foreground)]">
            © 2026 Cleanify.ai · Made with ⚡ for e-commerce teams
          </p>
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
            <span className="text-xs text-[var(--muted-foreground)]">SOC 2 Certified</span>
            <span className="text-xs text-[var(--muted-foreground)]">·</span>
            <span className="text-xs text-[var(--muted-foreground)]">GDPR Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── SVG icon helpers ─────────────────────────────────────────────────────────

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <Hero />
      <LogoStrip />
      <Marquee />
      <Features />
      <ShowcaseSection />
      <ScaleSection />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  )
}
