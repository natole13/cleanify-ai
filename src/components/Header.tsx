import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ChevronDown, Sparkles, Image, Video, Coins, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Tool data ─────────────────────────────────────────────────────────────────

const IMAGE_COL1 = [
  { label: 'Watermark Remover',     emoji: '🪄', slug: 'watermark-remover' },
  { label: 'Nano Banana AI',        emoji: '🍌', slug: 'nano-banana-ai' },
  { label: 'Object Remover',        emoji: '✂️', slug: 'object-remover' },
  { label: 'AI Photo Editor',       emoji: '🎨', slug: 'ai-photo-editor' },
  { label: 'PDF Watermark Remover', emoji: '📄', slug: 'pdf-watermark-remover' },
  { label: 'Remove Text',           emoji: '✏️', slug: 'remove-text' },
  { label: 'Unblur Image',          emoji: '🔭', slug: 'unblur-image' },
  { label: 'Photo Enhancer',        emoji: '⚡', slug: 'photo-enhancer' },
]

const IMAGE_COL2 = [
  { label: 'Batch Watermark Remover', emoji: '📦', slug: 'batch-watermark-remover', featured: true },
  { label: 'Background Remover',      emoji: '🖼️', slug: 'background-remover' },
  { label: 'Magic Eraser',            emoji: '🧹', slug: 'magic-eraser' },
  { label: 'GIF Watermark Remover',   emoji: '🎬', slug: 'gif-watermark-remover' },
  { label: 'Remove Logo',             emoji: '🚫', slug: 'remove-logo' },
  { label: 'Add Watermark',           emoji: '💧', slug: 'add-watermark' },
  { label: 'Image Upscaler',          emoji: '📐', slug: 'image-upscaler' },
]

const VIDEO_COL1 = [
  { label: 'Video Watermark Remover', emoji: '🎥', slug: 'video-watermark-remover' },
  { label: 'Video Text Remover',      emoji: '📝', slug: 'video-text-remover' },
  { label: 'Unblur Video',            emoji: '🔭', slug: 'unblur-video' },
]

const VIDEO_COL2 = [
  { label: 'Video Subtitles Remover', emoji: '💬', slug: 'video-subtitles-remover' },
  { label: 'Video Enhancer',          emoji: '✨', slug: 'video-enhancer' },
  { label: 'Video Upscaler',          emoji: '📐', slug: 'video-upscaler' },
]

// ─── Animation variants ────────────────────────────────────────────────────────

const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.97, filter: 'blur(3px)' },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: {
      type: 'spring' as const, stiffness: 420, damping: 28,
      staggerChildren: 0.035, delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0, y: -4, scale: 0.97, filter: 'blur(2px)',
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as [number,number,number,number] },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -5 },
  visible: {
    opacity: 1, x: 0,
    transition: { type: 'spring' as const, stiffness: 380, damping: 26 },
  },
}

// ─── MegaDropdown ──────────────────────────────────────────────────────────────

interface ToolItem { label: string; emoji: string; slug: string; featured?: boolean }

function MegaDropdown({
  label, icon, col1, col2,
  col1Header = 'Tools', col2Header = 'Popular',
}: {
  label: string
  icon: React.ReactNode
  col1: ToolItem[]
  col2: ToolItem[]
  col1Header?: string
  col2Header?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openMenu  = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }, [])

  const closeMenu = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 130)
  }, [])

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div ref={ref} className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'group flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-[500] select-none transition-colors duration-150',
          open ? 'bg-white/60 text-gray-900' : 'text-gray-500 hover:bg-white/40 hover:text-gray-900'
        )}
      >
        <span className={cn('transition-colors', open ? 'text-[var(--primary)]' : 'text-gray-400 group-hover:text-gray-500')}>
          {icon}
        </span>
        <span className="tracking-[-0.01em]">{label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }}>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onMouseEnter={openMenu}
            onMouseLeave={closeMenu}
            className="glass-dropdown absolute left-0 top-full z-50 mt-2 w-[580px] overflow-hidden rounded-2xl p-1"
          >
            {/* Column headers */}
            <div className="grid grid-cols-2 gap-x-1 px-3 pb-1.5 pt-2.5">
              <p className="text-[10px] font-[700] uppercase tracking-[0.12em] text-gray-400">{col1Header}</p>
              <p className="text-[10px] font-[700] uppercase tracking-[0.12em] text-gray-400">{col2Header}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-1 pb-2">
              {/* Col 1 */}
              <div>
                {col1.map((item) => (
                  <motion.a
                    key={item.label}
                    href={item.slug === 'nano-banana-ai' ? '#' : '/tools/' + item.slug}
                    variants={itemVariants}
                    className="group/item flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-gray-600 transition-all duration-100 hover:bg-[var(--accent)] hover:text-[var(--primary)]"
                  >
                    <span className="text-[15px] leading-none">{item.emoji}</span>
                    <span className="truncate font-[400] tracking-[-0.01em]">{item.label}</span>
                  </motion.a>
                ))}
              </div>

              {/* Col 2 */}
              <div>
                {col2.map((item) => (
                  <motion.a
                    key={item.label}
                    href={item.slug === 'nano-banana-ai' ? '#' : '/tools/' + item.slug}
                    variants={itemVariants}
                    className={cn(
                      'group/item flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-all duration-100',
                      item.featured
                        ? 'border border-orange-100/70 bg-orange-50/60 font-[500] text-orange-700 hover:bg-orange-100/80'
                        : 'text-gray-600 hover:bg-[var(--accent)] hover:text-[var(--primary)]'
                    )}
                  >
                    <span className="text-[15px] leading-none">{item.emoji}</span>
                    <span className="flex-1 truncate tracking-[-0.01em]">{item.label}</span>
                    {item.featured && (
                      <span className="ml-auto shrink-0 rounded-full bg-[var(--coral)] px-1.5 py-0.5 text-[9px] font-[700] leading-none uppercase tracking-wide text-white">
                        Popular
                      </span>
                    )}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Credits display ───────────────────────────────────────────────────────────

function CreditsDisplay() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  // Mock data — replace with auth context in production
  const plan       = 'PRO'
  const monthly    = { used: 37, total: 100 }
  const daily      = { used: 2, total: 5 }
  const totalLeft  = (monthly.total - monthly.used) + (daily.total - daily.used)

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(v => !v)}
        className="credits-sparkle flex items-center gap-1.5 rounded-full border border-[var(--primary)]/20 bg-[var(--accent)] px-3.5 py-1.5 text-[13px] font-[600] text-[var(--primary)] shadow-sm transition-all hover:border-[var(--primary)]/35 hover:shadow-[0_4px_12px_rgba(79,70,229,0.15)]"
      >
        <motion.span
          animate={{ rotate: [0, -12, 12, -6, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3 }}
        >
          <Coins className="h-3.5 w-3.5" strokeWidth={2.5} />
        </motion.span>
        <span>{totalLeft * 10} Crédits</span>
        <span className="rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-[8px] font-[800] uppercase leading-none tracking-wide text-white">
          {plan}
        </span>
      </motion.button>

      {/* Click popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="glass-dropdown absolute right-0 top-full z-50 mt-2 w-[220px] rounded-2xl p-4"
          >
            <p className="mb-3 text-[10px] font-[700] uppercase tracking-[0.12em] text-gray-400">Credit Balance</p>

            {/* Monthly */}
            <div className="mb-2.5">
              <div className="mb-1 flex justify-between">
                <span className="text-[11px] font-[600] text-gray-700">Monthly</span>
                <span className="font-mono text-[11px] font-[700] text-[var(--primary)]">
                  {monthly.total - monthly.used}/{monthly.total}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((monthly.total - monthly.used) / monthly.total) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full bg-[var(--primary)]"
                />
              </div>
            </div>

            {/* Daily bonus */}
            <div className="mb-3">
              <div className="mb-1 flex justify-between">
                <span className="text-[11px] font-[600] text-gray-700">Daily bonus</span>
                <span className="font-mono text-[11px] font-[700] text-emerald-600">
                  {daily.total - daily.used}/{daily.total}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((daily.total - daily.used) / daily.total) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-emerald-500"
                />
              </div>
            </div>

            <div className="rounded-xl bg-[var(--accent)] px-3 py-2 text-center">
              <p className="text-[11px] font-[600] text-[var(--primary)]">🪙 1 credit = 10 images</p>
              <p className="text-[10px] text-gray-400">{totalLeft} credits = {totalLeft * 10} images left</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Header ────────────────────────────────────────────────────────────────────

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <header
      className={cn(
        'glass-header sticky top-0 z-50 transition-all duration-300',
        scrolled && 'shadow-md shadow-indigo-500/5'
      )}
    >
      <div className="mx-auto flex h-[60px] max-w-screen-xl items-center gap-1 px-5">

        {/* Logo */}
        <a href="#studio" className="group mr-5 flex shrink-0 items-center gap-2.5">
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
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0 md:flex">
          <MegaDropdown
            label="Image Tools"
            icon={<Image className="h-3.5 w-3.5" strokeWidth={1.5} />}
            col1={IMAGE_COL1}
            col2={IMAGE_COL2}
          />
          <MegaDropdown
            label="Video Tools"
            icon={<Video className="h-3.5 w-3.5" strokeWidth={1.5} />}
            col1={VIDEO_COL1}
            col2={VIDEO_COL2}
            col1Header="Tools"
            col2Header="Enhance"
          />

          <a
            href="#features"
            className="nav-underline flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-[500] text-gray-500 transition-colors hover:text-gray-900"
          >
            Features
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="badge-pulse rounded-full bg-[var(--coral)] px-1.5 py-[3px] text-[9px] font-[700] leading-none uppercase tracking-wide text-white"
            >
              NEW
            </motion.span>
          </a>

          <a href="#pricing" className="nav-underline rounded-xl px-3 py-2 text-[13px] font-[500] text-gray-500 transition-colors hover:text-gray-900">
            Pricing
          </a>

          <a href="#faq" className="nav-underline rounded-xl px-3 py-2 text-[13px] font-[500] text-gray-500 transition-colors hover:text-gray-900">
            FAQ
          </a>
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2.5">
          {/* Credits — desktop */}
          <div className="hidden md:block">
            <CreditsDisplay />
          </div>

          <a
            href="#"
            className="hidden rounded-xl px-3 py-2 text-[13px] font-[500] text-gray-400 transition-colors hover:text-gray-700 md:block"
          >
            Log in
          </a>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <a
              href="#studio"
              className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-[600] tracking-[-0.01em] text-white shadow-coral transition-all"
              style={{ background: 'var(--coral)' }}
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              <span className="hidden sm:inline">Open Studio</span>
              <span className="sm:hidden">Studio</span>
            </a>
          </motion.div>

          {/* Mobile menu toggle */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white/50 hover:text-gray-800 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="overflow-hidden border-t border-white/50 bg-white/80 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-1 px-5 py-4">
              {[
                { label: 'Image Tools', href: '#features' },
                { label: 'Video Tools', href: '#features' },
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Log in', href: '#' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-xl px-3 py-2.5 text-[14px] font-[500] text-gray-700 transition-colors hover:bg-white/60"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-2">
                <CreditsDisplay />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
