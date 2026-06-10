import { useState, useCallback, useRef } from 'react'
import {
  Upload,
  X,
  ImageIcon,
  Layers,
  ArrowUp,
  Eraser,
  ChevronDown,
  ChevronUp,
  Play,
  Download,
  CheckCircle2,
  Loader2,
  Settings2,
  Plus,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { PipelineConfig, BatchFile, OutputFormat } from '@/types/pipeline'
import { defaultConfig, LOSSY_FORMATS } from '@/types/pipeline'

type ProcessingState = 'idle' | 'processing' | 'done'

export default function BatchProcessor() {
  const [files, setFiles] = useState<BatchFile[]>([])
  const [config, setConfig] = useState<PipelineConfig>(defaultConfig)
  const [dragging, setDragging] = useState(false)
  const [processingState, setProcessingState] = useState<ProcessingState>('idle')
  const [progress, setProgress] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const addFiles = useCallback((incoming: File[]) => {
    const imageFiles = incoming.filter((f) => f.type.startsWith('image/'))
    const newItems: BatchFile[] = imageFiles.map((f) => ({
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      name: f.name.replace(/\.[^.]+$/, ''),
      url: URL.createObjectURL(f),
      source: 'upload',
    }))
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name))
      return [...prev, ...newItems.filter((f) => !existing.has(f.name))]
    })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      addFiles(Array.from(e.dataTransfer.files))
    },
    [addFiles]
  )

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((f) => f.id === id)
      if (f?.source === 'upload') URL.revokeObjectURL(f.url)
      return prev.filter((f) => f.id !== id)
    })
  }

  const clearAll = () => {
    files.forEach((f) => { if (f.source === 'upload') URL.revokeObjectURL(f.url) })
    setFiles([])
    setProcessingState('idle')
    setProgress(0)
  }

  const startProcessing = () => {
    if (!files.length) return
    setProcessingState('processing')
    setProgress(0)
    let p = 0
    progressRef.current = setInterval(() => {
      p += Math.random() * 8 + 2
      if (p >= 100) {
        p = 100
        clearInterval(progressRef.current!)
        setProgress(100)
        setTimeout(() => setProcessingState('done'), 400)
      } else {
        setProgress(Math.round(p))
      }
    }, 200)
  }

  const operationsEnabled = [
    config.remove_watermark,
    config.remove_background,
    config.upscale,
    config.watermark.enabled,
  ].filter(Boolean).length

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">New Batch</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
              Upload images, configure the pipeline, and process at scale.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {processingState === 'done' && (
              <Button variant="outline" size="sm" onClick={clearAll}>
                <Plus className="h-3.5 w-3.5" />
                New Batch
              </Button>
            )}
            {processingState === 'done' && (
              <Button size="sm">
                <Download className="h-3.5 w-3.5" />
                Download All
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload + Queue */}
          <div className="lg:col-span-2 space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-dashed-upload rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 select-none',
                dragging && 'scale-[1.01] border-[var(--primary)] bg-[var(--accent)]',
                processingState !== 'idle' && 'pointer-events-none opacity-50'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
              />
              <div className={cn(
                'flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] mb-4 transition-transform',
                dragging && 'scale-110'
              )}>
                <Upload className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <p className="text-base font-semibold text-[var(--foreground)] mb-1">
                {dragging ? 'Drop your images here' : 'Drop images or click to upload'}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                PNG, JPG, WEBP, AVIF · Up to 10,000 images per batch
              </p>
            </div>

            {/* File queue */}
            {files.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[var(--primary)]" />
                      Queue
                      <Badge variant="processing">{files.length.toLocaleString()} files</Badge>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Clear all
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-64 overflow-y-auto divide-y divide-[var(--border)]">
                    {files.map((file, i) => (
                      <FileRow
                        key={file.id}
                        file={file}
                        index={i}
                        state={processingState}
                        progress={processingState === 'processing' ? Math.max(0, Math.min(100, progress - i * 2)) : processingState === 'done' ? 100 : 0}
                        onRemove={() => removeFile(file.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Processing progress */}
            {processingState !== 'idle' && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    {processingState === 'processing' ? (
                      <Loader2 className="h-5 w-5 text-[var(--primary)] animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-[oklch(0.62_0.18_150)]" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {processingState === 'processing' ? `Processing ${files.length} images...` : `${files.length} images processed`}
                        </p>
                        <span className="text-sm font-bold text-[var(--primary)]">{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  </div>
                  {processingState === 'done' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                      <CheckCircle2 className="h-4 w-4 text-[oklch(0.62_0.18_150)]" />
                      <p className="text-sm text-[oklch(0.50_0.18_150)] font-medium">
                        Batch complete · Ready to download
                      </p>
                      <Button size="sm" className="ml-auto">
                        <Download className="h-3.5 w-3.5" />
                        Download ZIP
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Pipeline settings + Run */}
          <div className="space-y-4">
            {/* Pipeline */}
            <Card>
              <CardHeader className="pb-0">
                <button
                  className="flex w-full items-center justify-between"
                  onClick={() => setSettingsOpen((v) => !v)}
                >
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-[var(--primary)]" />
                    Pipeline
                    {operationsEnabled > 0 && (
                      <Badge variant="processing">{operationsEnabled} active</Badge>
                    )}
                  </CardTitle>
                  {settingsOpen ? <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" /> : <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />}
                </button>
              </CardHeader>
              {settingsOpen && (
                <CardContent className="pt-4 space-y-3">
                  <OperationToggle
                    icon={<Eraser className="h-4 w-4" />}
                    title="Remove Watermark"
                    description="AI-powered removal"
                    enabled={config.remove_watermark}
                    onToggle={(v) => setConfig((c) => ({ ...c, remove_watermark: v }))}
                  />
                  <OperationToggle
                    icon={<ImageIcon className="h-4 w-4" />}
                    title="Remove Background"
                    description="Extract subject, transparent PNG"
                    enabled={config.remove_background}
                    onToggle={(v) => setConfig((c) => ({ ...c, remove_background: v }))}
                  >
                    {config.remove_background && (
                      <div className="mt-2 flex gap-1.5 flex-wrap">
                        {(['transparent', 'white', 'black'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setConfig((c) => ({ ...c, bg_mode: mode }))}
                            className={cn(
                              'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                              config.bg_mode === mode
                                ? 'border-[var(--primary)] bg-[var(--accent)] text-[var(--primary)]'
                                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40'
                            )}
                          >
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </OperationToggle>
                  <OperationToggle
                    icon={<ArrowUp className="h-4 w-4" />}
                    title="AI Upscale"
                    description="Enhance resolution"
                    enabled={config.upscale}
                    onToggle={(v) => setConfig((c) => ({ ...c, upscale: v }))}
                  >
                    {config.upscale && (
                      <div className="mt-2 flex gap-1.5">
                        {([2, 4] as const).map((factor) => (
                          <button
                            key={factor}
                            onClick={() => setConfig((c) => ({ ...c, upscale_factor: factor }))}
                            className={cn(
                              'px-3 py-1 rounded-lg text-xs font-medium border transition-all',
                              config.upscale_factor === factor
                                ? 'border-[var(--primary)] bg-[var(--accent)] text-[var(--primary)]'
                                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40'
                            )}
                          >
                            {factor}x
                          </button>
                        ))}
                      </div>
                    )}
                  </OperationToggle>

                  {/* Output format */}
                  <div className="pt-2 border-t border-[var(--border)]">
                    <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                      Output Format
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(['jpg', 'png', 'webp', 'avif'] as OutputFormat[]).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setConfig((c) => ({ ...c, output: { ...c.output, format: fmt } }))}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all uppercase',
                            config.output.format === fmt
                              ? 'border-[var(--primary)] bg-[var(--accent)] text-[var(--primary)]'
                              : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40'
                          )}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                    {LOSSY_FORMATS.includes(config.output.format) && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-[var(--muted-foreground)]">Quality</p>
                          <p className="text-xs font-semibold text-[var(--foreground)]">
                            {config.output.quality}%
                          </p>
                        </div>
                        <input
                          type="range"
                          min={60}
                          max={100}
                          value={config.output.quality}
                          onChange={(e) => setConfig((c) => ({ ...c, output: { ...c.output, quality: +e.target.value } }))}
                          className="w-full h-1.5 rounded-full appearance-none bg-[var(--border)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)] cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Summary & Run */}
            <Card className="border-[var(--primary)]/20">
              <CardContent className="p-5">
                <div className="space-y-2.5 mb-4">
                  <SummaryRow label="Images in queue" value={files.length.toLocaleString()} highlight={files.length > 0} />
                  <SummaryRow label="Operations" value={operationsEnabled > 0 ? `${operationsEnabled} selected` : 'None'} />
                  <SummaryRow label="Output format" value={config.output.format.toUpperCase()} />
                  <SummaryRow label="Credits required" value={
                    files.length > 0 && operationsEnabled > 0
                      ? `~${(files.length * operationsEnabled).toLocaleString()}`
                      : '—'
                  } />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={startProcessing}
                  disabled={!files.length || operationsEnabled === 0 || processingState !== 'idle'}
                >
                  {processingState === 'idle' ? (
                    <>
                      <Play className="h-4 w-4" />
                      Process {files.length > 0 ? `${files.length.toLocaleString()} Images` : 'Images'}
                    </>
                  ) : processingState === 'processing' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Completed
                    </>
                  )}
                </Button>

                {!files.length && (
                  <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
                    Upload images to get started
                  </p>
                )}
                {files.length > 0 && operationsEnabled === 0 && (
                  <p className="mt-2 text-center text-xs text-[oklch(0.55_0.18_70)]">
                    Enable at least one operation
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function FileRow({
  file,
  index,
  state,
  progress,
  onRemove,
}: {
  file: BatchFile
  index: number
  state: ProcessingState
  progress: number
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors group">
      <div className="relative h-9 w-9 rounded-lg overflow-hidden bg-[var(--muted)] shrink-0">
        <img
          src={file.url}
          alt={file.name}
          className="h-full w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        {state === 'done' && (
          <div className="absolute inset-0 bg-[oklch(0.62_0.18_150)]/80 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--foreground)] truncate">{file.name}</p>
        {state === 'processing' && progress > 0 && (
          <div className="mt-1">
            <Progress value={Math.min(progress, 100)} className="h-1" />
          </div>
        )}
        {state === 'done' && (
          <p className="text-[10px] text-[oklch(0.50_0.18_150)]">Ready to download</p>
        )}
      </div>
      <span className="text-[10px] text-[var(--muted-foreground)] shrink-0">
        #{index + 1}
      </span>
      {state === 'idle' && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[oklch(0.95_0.06_27)] transition-all"
        >
          <X className="h-3.5 w-3.5 text-[var(--muted-foreground)] hover:text-[var(--destructive)]" />
        </button>
      )}
      {state === 'done' && (
        <button className="p-1 rounded hover:bg-[var(--accent)] transition-colors">
          <Download className="h-3.5 w-3.5 text-[var(--primary)]" />
        </button>
      )}
    </div>
  )
}

function OperationToggle({
  icon,
  title,
  description,
  enabled,
  onToggle,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  enabled: boolean
  onToggle: (v: boolean) => void
  children?: React.ReactNode
}) {
  return (
    <div className={cn(
      'rounded-xl border p-3 transition-all',
      enabled ? 'border-[var(--primary)]/30 bg-[var(--accent)]' : 'border-[var(--border)] bg-white'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg',
            enabled ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
          )}>
            {icon}
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--foreground)]">{title}</p>
            <p className="text-[10px] text-[var(--muted-foreground)]">{description}</p>
          </div>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={cn(
            'relative h-5 w-9 rounded-full transition-colors duration-200',
            enabled ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
          )}
        >
          <span className={cn(
            'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
            enabled && 'translate-x-4'
          )} />
        </button>
      </div>
      {children}
    </div>
  )
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
      <span className={cn(
        'text-xs font-semibold',
        highlight ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'
      )}>
        {value}
      </span>
    </div>
  )
}
