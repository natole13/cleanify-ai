import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, Eraser, Layers, ArrowUpCircle, Sparkles,
  Wand2, Scissors, ImagePlus, Stamp, Play,
  Copy, Check, Terminal, ChevronRight,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { buildPipelineJSON, WATERMARK_FONTS } from '@/types/pipeline'
import type { PipelineConfig, BatchFile, WatermarkFont, HPosition, VPosition } from '@/types/pipeline'

interface Props {
  config: PipelineConfig
  onChange: (partial: Partial<PipelineConfig>) => void
  batchFiles: BatchFile[]
  onFilesUpload: (files: File[]) => void
  onRemoveFromBatch: (id: string) => void
  onClearBatch: () => void
  onRun: () => void
}

const sidebarContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
}
const sidebarItem = {
  hidden: { opacity: 0, x: 8 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 28 } },
}

function highlight(json: string): string {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}[\],])/g,
      (match) => {
        if (/^"/.test(match)) {
          return /:$/.test(match)
            ? `<span class="token-key">${match}</span>`
            : `<span class="token-string">${match}</span>`
        }
        if (/true|false/.test(match)) return `<span class="token-boolean">${match}</span>`
        if (/null/.test(match)) return `<span class="token-null">${match}</span>`
        if (/^[{}\[\],]$/.test(match)) return `<span class="token-brace">${match}</span>`
        return `<span class="token-number">${match}</span>`
      }
    )
}

function AccordionSection({
  title, icon, children, defaultOpen = false, badge,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode
  defaultOpen?: boolean; badge?: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[var(--border)]">
      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className={cn('text-[var(--primary)]', !open && 'opacity-50')}>{icon}</span>
          <span className={cn('text-[13px] tracking-[-0.01em]', open ? 'font-[600] text-gray-900' : 'font-[500] text-gray-600')}>
            {title}
          </span>
          {badge}
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="text-gray-400"
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2} />
        </motion.span>
      </motion.button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { type: 'spring', stiffness: 300, damping: 32 }, opacity: { duration: 0.18 } }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ToggleRow({
  icon, label, description, checked, onToggle, children,
}: {
  icon: React.ReactNode; label: string; description?: string
  checked: boolean; onToggle: (v: boolean) => void; children?: React.ReactNode
}) {
  return (
    <div className={cn(
      'rounded-xl border px-3 py-2.5 transition-all duration-200',
      checked ? 'border-[var(--primary)]/15 bg-[var(--accent)]/50' : 'border-transparent hover:bg-gray-50/70'
    )}>
      <div className="flex cursor-pointer items-center gap-3" onClick={() => onToggle(!checked)}>
        <div className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all',
          checked ? 'border-[var(--primary)]/20 bg-[var(--primary)] text-white' : 'border-gray-200 bg-white text-gray-400'
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-[13px] tracking-[-0.01em]', checked ? 'font-[600] text-gray-900' : 'font-[500] text-gray-700')}>
            {label}
          </p>
          {description && <p className="mt-0.5 text-[11px] font-[300] text-gray-400">{description}</p>}
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <Switch checked={checked} onCheckedChange={onToggle} />
        </div>
      </div>
      <AnimatePresence>
        {checked && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="mt-2 pl-10">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LabeledSlider({
  label, value, onChange, min, max, unit = '',
}: {
  label: string; value: number; onChange: (v: number) => void
  min?: number; max?: number; unit?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-[500] text-gray-600">{label}</span>
        <motion.span
          key={value}
          initial={{ opacity: 0.5, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="font-mono text-[12px] font-[600] text-[var(--primary)]"
        >
          {value}{unit}
        </motion.span>
      </div>
      <Slider value={value} onValueChange={onChange} min={min} max={max} />
    </div>
  )
}

export function Sidebar({ config, onChange, batchFiles, onFilesUpload, onRemoveFromBatch, onClearBatch, onRun }: Props) {
  const mainInputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [jsonFlashKey, setJsonFlashKey] = useState(0)
  const [resizeCustom, setResizeCustom] = useState(false)
  const prevJsonRef = useRef('')

  const RESIZE_PRESETS = [
    { label: '2048²', w: 2048, h: 2048 },
    { label: '1080²', w: 1080, h: 1080 },
    { label: '4K', w: 3840, h: 2160 },
  ]
  const isPreset = RESIZE_PRESETS.some(p => p.w === config.resize.width && p.h === config.resize.height)

  const hasImages   = batchFiles.length > 0
  const activeCount = [
    config.remove_watermark,
    config.remove_background,
    config.upscale,
    config.watermark.enabled,
    !!config.object_removal_prompt.trim(),
  ].filter(Boolean).length
  const canRun = hasImages && activeCount > 0

  const jsonStr = useMemo(
    () => JSON.stringify(buildPipelineJSON(config, batchFiles.length), null, 2),
    [config, batchFiles.length]
  )

  useEffect(() => {
    if (prevJsonRef.current && prevJsonRef.current !== jsonStr) setJsonFlashKey((k) => k + 1)
    prevJsonRef.current = jsonStr
  }, [jsonStr])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(jsonStr).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
  }, [jsonStr])

  const handleMainInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length) { onFilesUpload(files); e.target.value = '' }
  }, [onFilesUpload])

  const setWm = (partial: Partial<typeof config.watermark>) =>
    onChange({ watermark: { ...config.watermark, ...partial } })

  const fontOptions = WATERMARK_FONTS.map((f) => ({ value: f, label: f, style: { fontFamily: f } }))
  const hOptions: { value: HPosition; label: string }[] = [
    { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }, { value: 'tiled', label: 'Tiled' },
  ]
  const vOptions: { value: VPosition; label: string }[] = [
    { value: 'top', label: 'Top' }, { value: 'center', label: 'Center' },
    { value: 'bottom', label: 'Bottom' }, { value: 'tiled', label: 'Tiled' },
  ]

  return (
    <aside className="glass-sidebar flex h-full w-[320px] shrink-0 flex-col lg:w-[340px]">
      <input ref={mainInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleMainInput} />

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <div>
          <p className="text-[14px] font-[700] tracking-[-0.02em] text-gray-900">AI Pipeline</p>
          <p className="mt-0.5 text-[11px] font-[300] text-gray-400">
            {activeCount > 0
              ? `${activeCount} operation${activeCount !== 1 ? 's' : ''} active`
              : 'Configure your pipeline'}
            {hasImages && ` · ${batchFiles.length} image${batchFiles.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-full px-2 text-[12px] font-[700] text-white"
              style={{ background: 'var(--coral)' }}
            >
              {activeCount}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scrollable body */}
      <motion.div
        variants={sidebarContainer} initial="hidden" animate="visible"
        className="min-h-0 flex-1 overflow-y-auto"
      >

        {/* AI Magic */}
        <motion.div variants={sidebarItem}>
          <AccordionSection title="AI Magic" icon={<Wand2 className="h-4 w-4" strokeWidth={1.75} />} defaultOpen>
            <div className="space-y-2">
              <ToggleRow
                icon={<Eraser className="h-[14px] w-[14px]" strokeWidth={1.75} />}
                label="Remove Watermark" description="Detect & erase logos, stamps"
                checked={config.remove_watermark} onToggle={(v) => onChange({ remove_watermark: v })}
              />
              <ToggleRow
                icon={<Layers className="h-[14px] w-[14px]" strokeWidth={1.75} />}
                label="Remove Background" description="Isolate subject — alpha output"
                checked={config.remove_background} onToggle={(v) => onChange({ remove_background: v })}
              >
                <div className="space-y-2">
                  <div className="flex gap-1.5">
                    {(['transparent', 'white', 'black'] as const).map((m) => (
                      <button key={m} onClick={() => onChange({ bg_mode: m })}
                        className={cn('rounded-lg px-2.5 py-1 text-[11px] font-[600] capitalize transition-all',
                          config.bg_mode === m ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                        {m}
                      </button>
                    ))}
                  </div>
                  <ToggleRow
                    icon={<Sparkles className="h-[12px] w-[12px]" strokeWidth={2} />}
                    label="Generative Fill" description="AI-fill borders intelligently"
                    checked={config.generative_fill} onToggle={(v) => onChange({ generative_fill: v })}
                  />
                </div>
              </ToggleRow>
              <ToggleRow
                icon={<ArrowUpCircle className="h-[14px] w-[14px]" strokeWidth={1.75} />}
                label="Upscaling" description="Real-ESRGAN · up to 4×"
                checked={config.upscale} onToggle={(v) => onChange({ upscale: v })}
              >
                <div className="flex gap-1.5">
                  {([2, 4] as const).map((f) => (
                    <motion.button key={f} whileTap={{ scale: 0.94 }}
                      onClick={() => onChange({ upscale_factor: f })}
                      className={cn('rounded-lg px-3.5 py-1.5 text-[12px] font-[600] transition-all',
                        config.upscale_factor === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                      {f}×
                    </motion.button>
                  ))}
                </div>
              </ToggleRow>
            </div>
          </AccordionSection>
        </motion.div>

        {/* Object Removal */}
        <motion.div variants={sidebarItem}>
          <AccordionSection
            title="Object Removal" icon={<Scissors className="h-4 w-4" strokeWidth={1.75} />}
            badge={config.object_removal_prompt.trim()
              ? <span className="ml-1 rounded-full bg-[var(--coral)] px-1.5 py-0.5 text-[9px] font-[700] text-white">1</span>
              : undefined}
          >
            <div className="space-y-2">
              <p className="text-[11px] font-[300] text-gray-400">
                Describe what to remove — AI finds and erases it across all images.
              </p>
              <div className="relative">
                <input
                  type="text" value={config.object_removal_prompt}
                  onChange={(e) => onChange({ object_removal_prompt: e.target.value })}
                  placeholder='e.g. "remove all cars in background"'
                  className="w-full rounded-xl border border-white/60 bg-white/50 px-3 py-2.5 pr-9 text-[13px] text-gray-700 backdrop-blur-sm placeholder:font-[300] placeholder:text-gray-400 transition-all focus:border-[var(--primary)]/40 focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/12"
                />
                <AnimatePresence>
                  {config.object_removal_prompt && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-emerald-100 p-0.5"
                    >
                      <Check className="h-3 w-3 text-emerald-600" strokeWidth={2.5} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </AccordionSection>
        </motion.div>

        {/* Format & Optimization */}
        <motion.div variants={sidebarItem}>
          <AccordionSection title="Format & Optimization" defaultOpen icon={<Scissors className="h-4 w-4" strokeWidth={1.75} />}>
            <div className="space-y-2">
              <ToggleRow
                icon={<Scissors className="h-[14px] w-[14px]" strokeWidth={1.75} />}
                label="Crop / Resize"
                description={config.resize.enabled ? `${config.resize.width} × ${config.resize.height} px` : 'Set output dimensions'}
                checked={config.resize.enabled} onToggle={(v) => onChange({ resize: { ...config.resize, enabled: v } })}
              >
                <div className="space-y-2">
                  {/* Preset pills + Custom */}
                  <div className="flex flex-wrap gap-1.5">
                    {RESIZE_PRESETS.map((p) => (
                      <button key={p.label}
                        onClick={() => { onChange({ resize: { ...config.resize, width: p.w, height: p.h } }); setResizeCustom(false) }}
                        className={cn('rounded-lg px-2.5 py-1 text-[11px] font-[600] transition-all',
                          !resizeCustom && config.resize.width === p.w && config.resize.height === p.h
                            ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                        {p.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setResizeCustom(v => !v)}
                      className={cn('rounded-lg px-2.5 py-1 text-[11px] font-[600] transition-all',
                        resizeCustom ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      )}>
                      Custom
                    </button>
                  </div>

                  {/* Custom W×H inputs */}
                  <AnimatePresence>
                    {resizeCustom && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex-1">
                            <p className="mb-1 text-[10px] font-[600] uppercase tracking-widest text-gray-400">Width px</p>
                            <input
                              type="number" min={1} max={8192}
                              value={config.resize.width}
                              onChange={(e) => onChange({ resize: { ...config.resize, width: Math.max(1, parseInt(e.target.value) || 1) } })}
                              className="w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-[13px] font-[600] text-gray-700 backdrop-blur-sm transition-all focus:border-[var(--primary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/12"
                            />
                          </div>
                          <span className="mt-5 text-[12px] font-[500] text-gray-400">×</span>
                          <div className="flex-1">
                            <p className="mb-1 text-[10px] font-[600] uppercase tracking-widest text-gray-400">Height px</p>
                            <input
                              type="number" min={1} max={8192}
                              value={config.resize.height}
                              onChange={(e) => onChange({ resize: { ...config.resize, height: Math.max(1, parseInt(e.target.value) || 1) } })}
                              className="w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-[13px] font-[600] text-gray-700 backdrop-blur-sm transition-all focus:border-[var(--primary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/12"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ToggleRow>
              <ToggleRow
                icon={<ArrowUpCircle className="h-[14px] w-[14px]" strokeWidth={1.75} />}
                label="Compress"
                description={config.compress ? `Quality: ${config.compress_quality}%` : 'Reduce file size'}
                checked={config.compress} onToggle={(v) => onChange({ compress: v })}
              >
                <LabeledSlider label="Quality" value={config.compress_quality}
                  onChange={(v) => onChange({ compress_quality: v })} unit="%" />
              </ToggleRow>
            </div>
          </AccordionSection>
        </motion.div>

        {/* Watermark */}
        <motion.div variants={sidebarItem}>
          <AccordionSection title="Watermark" defaultOpen icon={<Stamp className="h-4 w-4" strokeWidth={1.75} />}>
            <div className="space-y-3">
              <ToggleRow
                icon={<Stamp className="h-[14px] w-[14px]" strokeWidth={1.75} />}
                label="Apply Watermark" description="Overlay text or image on output"
                checked={config.watermark.enabled} onToggle={(v) => setWm({ enabled: v })}
              />
              <AnimatePresence>
                {config.watermark.enabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 290, damping: 30 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="space-y-3 pt-1">
                      {/* Type selector */}
                      <div>
                        <p className="mb-1.5 text-[11px] font-[700] uppercase tracking-[0.1em] text-gray-400">Type</p>
                        <div className="flex gap-2">
                          {(['text', 'image'] as const).map((t) => (
                            <motion.button key={t} whileTap={{ scale: 0.95 }}
                              onClick={() => setWm({ type: t })}
                              className={cn('flex-1 rounded-xl py-2 text-[12px] font-[600] transition-all',
                                config.watermark.type === t
                                  ? 'bg-[var(--primary)] text-white shadow-sm'
                                  : 'bg-white/60 text-gray-500 hover:bg-white/80')}>
                              {t === 'text' ? '✏️ Text' : '🖼️ Image'}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Text fields */}
                      <AnimatePresence>
                        {config.watermark.type === 'text' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            style={{ overflow: 'hidden' }} className="space-y-2.5"
                          >
                            <div>
                              <p className="mb-1 text-[11px] font-[700] uppercase tracking-[0.1em] text-gray-400">Text</p>
                              <input type="text" value={config.watermark.text}
                                onChange={(e) => setWm({ text: e.target.value })}
                                className="w-full rounded-xl border border-white/60 bg-white/50 px-3 py-2 text-[13px] font-[500] backdrop-blur-sm transition-all focus:border-[var(--primary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/12"
                              />
                            </div>
                            <div>
                              <p className="mb-1 text-[11px] font-[700] uppercase tracking-[0.1em] text-gray-400">Font</p>
                              <Select value={config.watermark.font}
                                onValueChange={(v) => setWm({ font: v as WatermarkFont })}
                                options={fontOptions} />
                            </div>
                            <div className="flex items-end gap-3">
                              <div className="flex-1">
                                <p className="mb-1 text-[11px] font-[700] uppercase tracking-[0.1em] text-gray-400">Color</p>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border-2 border-white/80 shadow-sm transition-transform hover:scale-105"
                                    style={{ background: config.watermark.color }}
                                    onClick={() => document.getElementById('wm-color-input')?.click()}
                                  />
                                  <input id="wm-color-input" type="color"
                                    value={config.watermark.color}
                                    onChange={(e) => setWm({ color: e.target.value })}
                                    className="hidden" />
                                  <span className="font-mono text-[12px] font-[500] text-gray-500">
                                    {config.watermark.color.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="shrink-0">
                                <p className="mb-1.5 text-[11px] font-[700] uppercase tracking-[0.1em] text-gray-400">BG Text</p>
                                <Switch checked={config.watermark.background_text}
                                  onCheckedChange={(v) => setWm({ background_text: v })} />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Position */}
                      <div>
                        <p className="mb-1.5 text-[11px] font-[700] uppercase tracking-[0.1em] text-gray-400">Position</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="mb-1 text-[10px] font-[500] text-gray-400">Horizontal</p>
                            <Select value={config.watermark.h_position}
                              onValueChange={(v) => setWm({ h_position: v as HPosition })}
                              options={hOptions} />
                          </div>
                          <div>
                            <p className="mb-1 text-[10px] font-[500] text-gray-400">Vertical</p>
                            <Select value={config.watermark.v_position}
                              onValueChange={(v) => setWm({ v_position: v as VPosition })}
                              options={vOptions} />
                          </div>
                        </div>
                      </div>

                      {/* Sliders */}
                      <div className="space-y-3 rounded-xl bg-white/40 px-3 py-3">
                        <LabeledSlider label="Rotation" value={config.watermark.rotation}
                          onChange={(v) => setWm({ rotation: v })} min={0} max={360} unit="°" />
                        <LabeledSlider label="Size" value={config.watermark.size}
                          onChange={(v) => setWm({ size: v })} unit="%" />
                        <LabeledSlider label="Opacity" value={config.watermark.opacity}
                          onChange={(v) => setWm({ opacity: v })} unit="%" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </AccordionSection>
        </motion.div>

        {/* Media */}
        <motion.div variants={sidebarItem}>
          <AccordionSection
            title="Media" icon={<ImagePlus className="h-4 w-4" strokeWidth={1.75} />}
            badge={hasImages
              ? <span className="ml-1.5 rounded-full bg-[var(--primary)]/10 px-1.5 py-0.5 text-[10px] font-[700] text-[var(--primary)]">{batchFiles.length}</span>
              : undefined}
          >
            <div className="space-y-2">
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => mainInputRef.current?.click()}
                className="flex w-full items-center gap-2.5 rounded-xl border border-white/60 bg-white/50 px-3 py-2.5 transition-all hover:border-[var(--primary)]/25 hover:bg-white/70">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 shadow-sm">
                  <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.5} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-[500] text-gray-700">
                    {hasImages ? `${batchFiles.length} image${batchFiles.length !== 1 ? 's' : ''} loaded` : 'Upload images'}
                  </p>
                  <p className="text-[11px] font-[300] text-gray-400">
                    {hasImages ? 'Click to add more' : 'PNG · JPG · WEBP · multiple'}
                  </p>
                </div>
                {hasImages && (
                  <button onClick={(e) => { e.stopPropagation(); onClearBatch() }}
                    className="rounded-md px-2 py-0.5 text-[11px] font-[500] text-red-400 hover:bg-red-50 hover:text-red-600">
                    Clear
                  </button>
                )}
              </motion.button>
              <AnimatePresence>
                {batchFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex gap-1.5 overflow-x-auto pb-0.5"
                  >
                    {batchFiles.slice(0, 8).map((file, i) => (
                      <motion.div key={file.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }} className="group relative shrink-0">
                        <img src={file.url} alt=""
                          className="h-10 w-10 rounded-lg border border-gray-200 object-cover shadow-sm" />
                        <button onClick={() => onRemoveFromBatch(file.id)}
                          className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm group-hover:flex">
                          <span className="text-[8px] leading-none">✕</span>
                        </button>
                      </motion.div>
                    ))}
                    {batchFiles.length > 8 && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[11px] font-[600] text-gray-500">
                        +{batchFiles.length - 8}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </AccordionSection>
        </motion.div>

        {/* Export JSON Terminal */}
        <motion.div variants={sidebarItem} className="px-3 py-3">
          <motion.button whileTap={{ scale: 0.99 }} onClick={() => setTerminalOpen((v) => !v)}
            className="flex w-full items-center justify-between bg-[#161B22] px-4 py-2.5 transition-colors hover:bg-[#1C2129]"
            style={{ borderRadius: terminalOpen ? '12px 12px 0 0' : '12px' }}>
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-[#58a6ff]" strokeWidth={1.75} />
              <span className="font-mono text-[12px] font-[500] text-[#cdd9e5]">Export API Payload</span>
              <span className="rounded-full bg-[#21262D] px-1.5 py-0.5 font-mono text-[9px] font-[500] text-[#58a6ff]">JSON</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.button onClick={(e) => { e.stopPropagation(); handleCopy() }} whileTap={{ scale: 0.93 }}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-[500] text-[#8b949e] transition-colors hover:bg-[#21262D] hover:text-[#cdd9e5]">
                {copied
                  ? <><Check className="h-3 w-3 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
                  : <><Copy className="h-3 w-3" /><span>Copy</span></>
                }
              </motion.button>
              <motion.span animate={{ rotate: terminalOpen ? 180 : 0 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }} className="text-[#8b949e]">
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
              </motion.span>
            </div>
          </motion.button>
          <AnimatePresence>
            {terminalOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 30 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="terminal-panel overflow-hidden rounded-t-none border-t-0">
                  <div className="flex items-center gap-1.5 border-b border-[#21262D] px-3 py-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                    <span className="ml-2 font-mono text-[10px] text-[#8b949e]">pipeline.json</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto p-3">
                    <motion.pre
                      key={jsonFlashKey}
                      initial={{ opacity: 0.55 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }}
                      className="terminal-content whitespace-pre text-[11px] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: highlight(jsonStr) }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </motion.div>

      {/* Footer: Run */}
      <div className="shrink-0 border-t border-[var(--border)] px-3 py-3 space-y-1.5">
        <motion.button
          whileHover={canRun ? { scale: 1.01 } : {}} whileTap={canRun ? { scale: 0.97 } : {}}
          disabled={!canRun}
          onClick={canRun ? onRun : undefined}
          className={cn(
            'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[13px] font-[600] tracking-[-0.01em] transition-all',
            canRun ? 'cursor-pointer text-white shadow-coral' : 'cursor-not-allowed bg-gray-100/70 text-gray-400'
          )}
          style={canRun ? { background: 'var(--coral)' } : undefined}
        >
          <div className="flex items-center gap-2">
            <Play className="h-3.5 w-3.5" strokeWidth={2.5} fill="currentColor" />
            <span>Run Processing</span>
            {batchFiles.length > 1 && (
              <span className="rounded-lg bg-white/20 px-1.5 py-0.5 text-[10px] font-[700]">{batchFiles.length}</span>
            )}
          </div>
          <ChevronRight className="h-4 w-4 opacity-70" strokeWidth={2.5} />
        </motion.button>
        {!canRun && (
          <p className="text-center text-[11px] font-[300] text-gray-400">
            {!hasImages ? 'Upload at least one image to start' : 'Enable at least one operation'}
          </p>
        )}
      </div>
    </aside>
  )
}
