import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, FabricImage, FabricText, PencilBrush, Rect } from 'fabric'
import {
  Upload, ImagePlus, Loader2,
  ChevronLeft, ChevronRight, Wand2, Trash2, X, FolderOpen, Sparkles, Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BatchFile, PipelineConfig } from '@/types/pipeline'

interface BatchProgress {
  active: boolean
  current: number
  total: number
}

interface Props {
  batchFiles: BatchFile[]
  currentIndex: number
  onChangeIndex: (i: number) => void
  onFilesUpload: (files: File[]) => void
  config: PipelineConfig
  onMaskSave?: (fileId: string, maskDataUrl: string) => void
  batchProgress?: BatchProgress | null
  onRemoveBg?: () => Promise<void>
}

// ─── Folder-aware drop helpers ────────────────────────────────────────────────

async function readEntryFiles(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    return new Promise((resolve) => {
      (entry as FileSystemFileEntry).file(f => resolve([f]), () => resolve([]))
    })
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader()
    const allEntries: FileSystemEntry[] = []
    // readEntries may return chunks — keep reading until empty
    while (true) {
      const batch: FileSystemEntry[] = await new Promise((res, rej) =>
        reader.readEntries(res, rej)
      )
      if (batch.length === 0) break
      allEntries.push(...batch)
    }
    const nested = await Promise.all(allEntries.map(readEntryFiles))
    return nested.flat()
  }
  return []
}

async function getFilesFromDataTransfer(dt: DataTransfer): Promise<File[]> {
  if (dt.items?.length) {
    const entries = Array.from(dt.items)
      .filter(i => i.kind === 'file')
      .map(i => i.webkitGetAsEntry())
      .filter(Boolean) as FileSystemEntry[]
    const nested = await Promise.all(entries.map(readEntryFiles))
    return nested.flat()
  }
  return Array.from(dt.files)
}

export function WorkspaceCanvas({
  batchFiles, currentIndex, onChangeIndex, onFilesUpload,
  config, onMaskSave, batchProgress, onRemoveBg,
}: Props) {
  const containerRef    = useRef<HTMLDivElement>(null)
  const canvasElRef     = useRef<HTMLCanvasElement>(null)
  const fabricRef       = useRef<Canvas | null>(null)
  const baseImgRef      = useRef<FabricImage | null>(null)
  const wmObjRef        = useRef<FabricText | null>(null)
  const zoneRectObjRef  = useRef<Rect | null>(null)
  const inputRef        = useRef<HTMLInputElement>(null)
  const folderInputRef  = useRef<HTMLInputElement | null>(null)
  const sizeRef         = useRef({ w: 0, h: 0 })

  // Keep refs synced to avoid stale closures in stable callbacks
  const configRef = useRef(config)
  const batchRef  = useRef(batchFiles)
  const idxRef    = useRef(currentIndex)

  const [dragging,     setDragging]     = useState(false)
  const [detecting,    setDetecting]    = useState(false)
  const [detected,     setDetected]     = useState(false)
  const [wandActive,   setWandActive]   = useState(false)
  const [hasMask,      setHasMask]      = useState(false)
  const [fading,       setFading]       = useState(false)
  const [removingBg,   setRemovingBg]   = useState(false)
  const [zoneMode,     setZoneMode]     = useState(false)
  const [zoneRect,     setZoneRect]     = useState<{x:number,y:number,w:number,h:number}|null>(null)

  const hasImages   = batchFiles.length > 0
  const hasMultiple = batchFiles.length > 1
  const fileName    = batchFiles[currentIndex]?.name ?? ''

  useEffect(() => { configRef.current = config },       [config])
  useEffect(() => { batchRef.current  = batchFiles },   [batchFiles])
  useEffect(() => { idxRef.current    = currentIndex }, [currentIndex])

  // ── Watermark live preview ─────────────────────────────────────────────────
  const updateWatermark = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const cfg = configRef.current

    if (wmObjRef.current) {
      canvas.remove(wmObjRef.current)
      wmObjRef.current = null
    }

    const wm = cfg.watermark
    if (!wm.enabled || wm.type !== 'text' || !baseImgRef.current || !wm.text) {
      canvas.renderAll()
      return
    }

    const { w: cw, h: ch } = sizeRef.current
    if (cw < 10) { canvas.renderAll(); return }

    const fontSize = Math.max(10, Math.round(cw * wm.size / 100))

    const textObj = new FabricText(wm.text, {
      fontSize,
      fontFamily: wm.font ?? 'Space Grotesk',
      fill: wm.color,
      opacity: wm.opacity / 100,
      angle: wm.rotation,
      selectable: false,
      evented: false,
      originX: 'center' as const,
      originY: 'center' as const,
    })

    const pad = cw * 0.06
    const br  = textObj.getBoundingRect()
    const tw  = br.width
    const th  = br.height

    const xMap: Record<string, number> = {
      left:   pad + tw / 2,
      center: cw / 2,
      right:  cw - pad - tw / 2,
      tiled:  cw / 2,
    }
    const yMap: Record<string, number> = {
      top:    pad + th / 2,
      center: ch / 2,
      bottom: ch - pad - th / 2,
      tiled:  ch / 2,
    }

    textObj.set({
      left: xMap[wm.h_position] ?? cw / 2,
      top:  yMap[wm.v_position] ?? ch / 2,
    })

    canvas.add(textObj)
    wmObjRef.current = textObj
    canvas.renderAll()
  }, [])

  // ── Load image into Fabric ─────────────────────────────────────────────────
  const loadImage = useCallback(async () => {
    const canvas = fabricRef.current
    if (!canvas) return

    const { w: cw, h: ch } = sizeRef.current
    if (cw < 10 || ch < 10) return  // container not measured yet

    const url = batchRef.current[idxRef.current]?.url

    // Preserve drawn paths (mask objects) before clearing
    const drawnPaths = canvas.getObjects().filter(
      o => o !== baseImgRef.current && o !== wmObjRef.current && o !== zoneRectObjRef.current
    )

    if (baseImgRef.current) { canvas.remove(baseImgRef.current); baseImgRef.current = null }
    if (wmObjRef.current)   { canvas.remove(wmObjRef.current);   wmObjRef.current   = null }
    drawnPaths.forEach(o => canvas.remove(o))
    setHasMask(false)

    if (!url) { canvas.renderAll(); return }

    try {
      const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
      const iw  = img.width  ?? 1
      const ih  = img.height ?? 1
      const scale = Math.min((cw * 0.95) / iw, (ch * 0.95) / ih)

      img.scale(scale)
      img.set({
        left: (cw - img.getScaledWidth())  / 2,
        top:  (ch - img.getScaledHeight()) / 2,
        selectable: false,
        evented: false,
        hoverCursor: 'default',
      })

      canvas.add(img)
      baseImgRef.current = img
      canvas.sendObjectToBack(img)
      canvas.renderAll()
      updateWatermark()
    } catch (err) {
      console.warn('Failed to load image into canvas:', err)
    }
  }, [updateWatermark])

  // ── Container measurement + Fabric resize (separate from init) ────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const applySize = (w: number, h: number) => {
      if (w < 10 || h < 10) return
      sizeRef.current = { w, h }
      const canvas = fabricRef.current
      if (!canvas) return
      canvas.setDimensions({ width: w, height: h })
      // Make Fabric wrapper fill the container
      const wrap = canvas.wrapperEl as HTMLElement | null
      if (wrap) {
        wrap.style.cssText = `position:absolute;top:0;left:0;width:${w}px;height:${h}px;`
      }
      // Re-fit image if already loaded
      if (baseImgRef.current) {
        const img = baseImgRef.current
        const iw = img.width ?? 1
        const ih = img.height ?? 1
        const scale = Math.min((w * 0.95) / iw, (h * 0.95) / ih)
        img.scale(scale)
        img.set({
          left: (w - img.getScaledWidth()) / 2,
          top: (h - img.getScaledHeight()) / 2,
        })
        img.setCoords()
      }
      if (wmObjRef.current) updateWatermark()
      if (fabricRef.current) fabricRef.current.renderAll()
    }

    // Measure immediately
    applySize(container.offsetWidth, container.offsetHeight)

    const obs = new ResizeObserver(entries => {
      const e = entries[0]
      applySize(Math.floor(e.contentRect.width), Math.floor(e.contentRect.height))
    })
    obs.observe(container)
    return () => obs.disconnect()
  }, [updateWatermark])

  // ── Init Fabric.js (once) ──────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return

    const canvas = new Canvas(canvasElRef.current, {
      selection: false,
      enableRetinaScaling: false,
    })
    fabricRef.current = canvas

    const wrap = canvas.wrapperEl as HTMLElement | null
    if (wrap) {
      wrap.style.position = 'absolute'
      wrap.style.top = '0'
      wrap.style.left = '0'
    }

    canvas.on('path:created', () => setHasMask(true))

    // Zone selection: capture rectangular selection
    canvas.on('selection:created', (e) => {
      const sel = e.selected?.[0]
      if (!sel) return
      const br = sel.getBoundingRect()
      setZoneRect({ x: Math.round(br.left), y: Math.round(br.top), w: Math.round(br.width), h: Math.round(br.height) })
    })

    return () => {
      canvas.dispose()
      fabricRef.current  = null
      baseImgRef.current = null
      wmObjRef.current   = null
      zoneRectObjRef.current = null
    }
  }, [])

  // ── Reload when batch / index changes ────────────────────────────────────
  useEffect(() => {
    if (!fabricRef.current) return
    setFading(true)
    const t = setTimeout(async () => {
      await loadImage()
      setFading(false)
    }, 70)
    return () => clearTimeout(t)
  }, [currentIndex, batchFiles, loadImage])

  // ── Live watermark on config change ──────────────────────────────────────
  useEffect(() => {
    if (fabricRef.current) updateWatermark()
  }, [config.watermark, updateWatermark])

  // ── Drawing mode ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    if (wandActive) {
      canvas.isDrawingMode = true
      const brush = new PencilBrush(canvas)
      brush.color = 'rgba(239,68,68,0.55)'
      brush.width = 22
      canvas.freeDrawingBrush = brush
    } else {
      canvas.isDrawingMode = false
    }
  }, [wandActive])

  // ── Zone mode: toggle Fabric selection ────────────────────────────────────
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.selection = zoneMode
    if (!zoneMode) {
      // Clear selection when exiting zone mode
      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }, [zoneMode])

  // ── Zone rect overlay ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    // Remove previous zone rect object
    if (zoneRectObjRef.current) {
      canvas.remove(zoneRectObjRef.current)
      zoneRectObjRef.current = null
    }
    if (zoneRect) {
      const rect = new Rect({
        left: zoneRect.x,
        top: zoneRect.y,
        width: zoneRect.w,
        height: zoneRect.h,
        fill: 'rgba(245,158,11,0.18)',
        stroke: 'rgba(245,158,11,0.85)',
        strokeWidth: 2,
        strokeDashArray: [5, 4],
        selectable: false,
        evented: false,
      })
      canvas.add(rect)
      zoneRectObjRef.current = rect
      canvas.renderAll()
    }
  }, [zoneRect])

  // ── Navigation ─────────────────────────────────────────────────────────────
  const navigate = useCallback((dir: 1 | -1) => {
    onChangeIndex((currentIndex + dir + batchFiles.length) % batchFiles.length)
  }, [currentIndex, batchFiles.length, onChangeIndex])

  // ── File inputs ────────────────────────────────────────────────────────────
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const all = await getFilesFromDataTransfer(e.dataTransfer)
    const images = all.filter(f => f.type.startsWith('image/'))
    if (images.length) onFilesUpload(images)
  }, [onFilesUpload])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/'))
    if (files.length) { onFilesUpload(files); e.target.value = '' }
  }, [onFilesUpload])

  const handleFolderInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/'))
    if (files.length) { onFilesUpload(files); e.target.value = '' }
  }, [onFilesUpload])

  // ── Auto-detect ────────────────────────────────────────────────────────────
  const handleAutoDetect = useCallback(() => {
    if (detecting || !hasImages) return
    setDetecting(true)
    setDetected(false)
    setTimeout(() => {
      setDetecting(false)
      setDetected(true)
      setTimeout(() => setDetected(false), 2500)
    }, 1800)
  }, [detecting, hasImages])

  // ── Mask operations ────────────────────────────────────────────────────────
  const clearMask = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.getObjects()
      .filter(o => o !== baseImgRef.current && o !== wmObjRef.current && o !== zoneRectObjRef.current)
      .forEach(o => canvas.remove(o))
    canvas.renderAll()
    setHasMask(false)
  }, [])

  const saveMask = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || !onMaskSave) return

    const wasBaseVisible = baseImgRef.current?.visible ?? true
    const wasWmVisible   = wmObjRef.current?.visible   ?? true

    if (baseImgRef.current) baseImgRef.current.set({ visible: false })
    if (wmObjRef.current)   wmObjRef.current.set({ visible: false })
    canvas.renderAll()

    const dataUrl = canvas.toDataURL({ format: 'png' as const, multiplier: 1 })

    if (baseImgRef.current) baseImgRef.current.set({ visible: wasBaseVisible })
    if (wmObjRef.current)   wmObjRef.current.set({ visible: wasWmVisible })
    canvas.renderAll()

    const fileId = batchRef.current[idxRef.current]?.id
    if (fileId) {
      onMaskSave(fileId, dataUrl)
      setWandActive(false)
      setHasMask(false)
    }
  }, [onMaskSave])

  return (
    <div
      ref={containerRef}
      className={cn(
        'canvas-workspace relative flex flex-1 overflow-hidden',
        dragging && 'ring-4 ring-[var(--primary)]/40 ring-inset'
      )}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {/* File inputs */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />
      <input
        ref={el => {
          folderInputRef.current = el
          if (el) { el.setAttribute('webkitdirectory', ''); el.setAttribute('directory', '') }
        }}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFolderInput}
      />

      {/* Fabric.js canvas — always mounted */}
      <canvas
        ref={canvasElRef}
        className="absolute inset-0 transition-opacity duration-100"
        style={{
          visibility: hasImages ? 'visible' : 'hidden',
          opacity: fading ? 0 : 1,
          cursor: wandActive ? 'crosshair' : 'default',
        }}
      />

      {/* Wand active ring */}
      {wandActive && hasImages && (
        <div className="pointer-events-none absolute inset-0 z-10 ring-2 ring-red-400/50 ring-inset" />
      )}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!hasImages && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="z-10 flex w-full flex-col items-center justify-center gap-5 text-center"
          >
            <motion.div
              animate={dragging ? { scale: 1.04 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                'glass-card flex h-64 w-80 cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed transition-all',
                dragging
                  ? 'border-[var(--primary)]/60 bg-[var(--accent)]/60'
                  : 'border-[var(--border)] hover:border-[var(--primary)]/35 hover:bg-white/50'
              )}
              onClick={() => inputRef.current?.click()}
            >
              <motion.div
                animate={{ y: dragging ? -6 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors',
                  dragging
                    ? 'border-[var(--primary)]/30 bg-[var(--primary)] text-white'
                    : 'border-gray-200/80 bg-white text-gray-400'
                )}
              >
                {dragging
                  ? <Upload className="h-6 w-6" strokeWidth={1.75} />
                  : <ImagePlus className="h-6 w-6" strokeWidth={1.5} />
                }
              </motion.div>
              <div>
                <p className="text-[15px] font-[600] tracking-[-0.02em] text-gray-700">
                  {dragging ? 'Drop to upload' : 'Drop your catalog folder here'}
                </p>
                <p className="mt-1 text-[12px] font-[300] text-gray-400">PNG · JPG · WEBP · up to 10,000 images</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white/70 px-4 py-2 text-[12px] font-[600] text-gray-600 shadow-sm backdrop-blur-sm hover:bg-white hover:text-[var(--primary)] transition-all"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Browse Files
              </button>
              <button
                onClick={() => folderInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white/70 px-4 py-2 text-[12px] font-[600] text-gray-600 shadow-sm backdrop-blur-sm hover:bg-white hover:text-[var(--primary)] transition-all"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Upload Folder
              </button>
            </div>

            <AutoDetectButton detecting={false} detected={false} onClick={() => {}} disabled />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Auto-Detect button (images loaded) ──────────────────────────────── */}
      <AnimatePresence>
        {hasImages && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute bottom-16 left-1/2 z-20 -translate-x-1/2"
          >
            <AutoDetectButton detecting={detecting} detected={detected} onClick={handleAutoDetect} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── File name badge ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasImages && fileName && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 max-w-[260px] truncate rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-[500] text-white/80 backdrop-blur-sm"
          >
            {fileName.length > 34 ? fileName.slice(0, 32) + '…' : fileName}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Batch navigation ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasMultiple && hasImages && !batchProgress?.active && (
          <>
            <motion.button
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              whileHover={{ scale: 1.1, x: 2 }} whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-white/85 shadow-md backdrop-blur-md hover:bg-white transition-all"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" strokeWidth={2} />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
              whileHover={{ scale: 1.1, x: -2 }} whileTap={{ scale: 0.92 }}
              onClick={() => navigate(1)}
              className="absolute right-16 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-white/85 shadow-md backdrop-blur-md hover:bg-white transition-all"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" strokeWidth={2} />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-black/55 px-3.5 py-2 backdrop-blur-md"
            >
              <span className="font-mono text-[11px] font-[600] text-white/90">
                {currentIndex + 1} / {batchFiles.length}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(batchFiles.length, 7) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onChangeIndex(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-200',
                      i === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                    )}
                  />
                ))}
                {batchFiles.length > 7 && (
                  <span className="text-[9px] font-[600] text-white/50 ml-0.5">+{batchFiles.length - 7}</span>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Remove BG button ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasImages && onRemoveBg && !batchProgress?.active && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
            whileHover={!removingBg ? { scale: 1.06 } : {}} whileTap={!removingBg ? { scale: 0.94 } : {}}
            disabled={removingBg}
            onClick={async () => {
              if (removingBg) return
              setRemovingBg(true)
              try { await onRemoveBg() } catch {}
              finally { setRemovingBg(false) }
            }}
            className={cn(
              'absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-[600] shadow-md backdrop-blur-md transition-all',
              removingBg
                ? 'bg-white/85 text-[var(--primary)]'
                : 'bg-white/85 text-gray-700 hover:bg-white hover:text-purple-600'
            )}
          >
            {removingBg
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <span className="text-[13px] leading-none">✂️</span>
            }
            {removingBg ? 'Removing…' : 'Remove BG'}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Manual Wand button ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasImages && !batchProgress?.active && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={() => setWandActive(v => !v)}
            className={cn(
              'absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-[600] shadow-md backdrop-blur-md transition-all',
              wandActive
                ? 'bg-red-500 text-white shadow-red-200'
                : 'bg-white/85 text-gray-700 hover:bg-white hover:text-[var(--primary)]'
            )}
          >
            {wandActive ? <X className="h-3.5 w-3.5" /> : <Wand2 className="h-3.5 w-3.5" strokeWidth={1.75} />}
            {wandActive ? 'Exit Wand' : 'Manual Wand'}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Select Zone button ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasImages && !batchProgress?.active && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={() => {
              setZoneMode(v => !v)
              setWandActive(false)
            }}
            className={cn(
              'absolute right-4 top-[52px] z-20 flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-[600] shadow-md backdrop-blur-md transition-all',
              zoneMode
                ? 'bg-amber-500 text-white shadow-amber-200'
                : 'bg-white/85 text-gray-700 hover:bg-white hover:text-amber-600'
            )}
          >
            {zoneMode ? <X className="h-3.5 w-3.5" /> : <span className="text-[13px]">⬜</span>}
            {zoneMode ? 'Cancel Zone' : 'Fix Zone'}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Wand toolbar ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {wandActive && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="absolute right-4 top-16 z-20 flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 shadow-lg backdrop-blur-md"
          >
            <span className="text-[11px] font-[600] text-red-500">Paint correction area</span>
            {hasMask && (
              <>
                <button
                  onClick={clearMask}
                  className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[11px] font-[600] text-red-500 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
                <button
                  onClick={saveMask}
                  className="flex items-center gap-1 rounded-lg bg-[var(--primary)] px-2.5 py-1 text-[11px] font-[600] text-white hover:bg-[var(--primary-hover)] transition-colors"
                >
                  Validate mask
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Zone toolbar — shown when a zone is defined ──────────────────────── */}
      <AnimatePresence>
        {zoneRect && !wandActive && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="absolute right-4 top-24 z-20 flex items-center gap-2 rounded-2xl bg-amber-50/95 px-3 py-2 shadow-lg backdrop-blur-md border border-amber-200/60"
          >
            <span className="text-[11px] font-[600] text-amber-700">
              Zone {zoneRect.w}×{zoneRect.h} @ ({zoneRect.x},{zoneRect.y})
            </span>
            <button
              onClick={() => {
                // Clear zone rect from canvas
                const canvas = fabricRef.current
                if (canvas && zoneRectObjRef.current) {
                  canvas.remove(zoneRectObjRef.current)
                  zoneRectObjRef.current = null
                  canvas.renderAll()
                }
                setZoneRect(null)
              }}
              className="flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-[11px] font-[600] text-amber-700 hover:bg-amber-200 transition-colors"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
            <button
              onClick={() => {
                // Placeholder: send zone to API
                console.log('Send zone to API:', zoneRect)
              }}
              className="flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-[600] text-white hover:bg-amber-600 transition-colors"
            >
              Send Zone to API
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Export PNG button ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasImages && !batchProgress?.active && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={() => {
              const canvas = fabricRef.current
              if (!canvas) return
              const dataUrl = canvas.toDataURL({ format: 'png' as const, multiplier: 1 })
              const a = document.createElement('a')
              a.href = dataUrl
              a.download = (batchFiles[currentIndex]?.name ?? 'cleanify') + '_output.png'
              a.click()
            }}
            className="absolute bottom-[72px] right-4 z-20 flex items-center gap-1.5 rounded-xl bg-white/85 px-3 py-2 text-[12px] font-[600] text-gray-700 shadow-md backdrop-blur-md hover:bg-white hover:text-[var(--primary)] transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Export PNG
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Drag overlay ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[var(--accent)]/30 backdrop-blur-sm"
          >
            <div className="glass-card flex flex-col items-center gap-3 rounded-3xl px-10 py-8">
              <Upload className="h-10 w-10 text-[var(--primary)]" strokeWidth={1.5} />
              <p className="text-[16px] font-[600] text-[var(--primary)]">Drop to upload</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Batch Progress Overlay ───────────────────────────────────────────── */}
      <AnimatePresence>
        {batchProgress?.active && (
          <motion.div
            key="batch-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(228,233,248,0.52)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
          >
            <motion.div
              initial={{ scale: 0.86, y: 18, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="glass-card flex min-w-[340px] max-w-[420px] flex-col items-center gap-6 rounded-3xl px-10 py-9"
              style={{ boxShadow: '0 20px 64px rgba(79,70,229,0.18), 0 4px 16px rgba(0,0,0,0.07)' }}
            >
              {/* Spinning ring */}
              <div className="relative flex h-[60px] w-[60px] items-center justify-center">
                <div
                  className="absolute inset-0 animate-spin rounded-full"
                  style={{ border: '3px solid rgba(249,115,22,0.15)', borderTopColor: 'var(--coral)' }}
                />
                <div
                  className="absolute inset-[5px] rounded-full"
                  style={{ background: 'rgba(249,115,22,0.06)' }}
                />
                <Sparkles className="h-[22px] w-[22px] text-[var(--coral)]" strokeWidth={1.75} />
              </div>

              {/* Texts */}
              <div className="text-center">
                <p className="text-[19px] font-[700] tracking-[-0.025em] text-gray-900">
                  Processing Batch
                </p>
                <motion.p
                  key={batchProgress.current}
                  initial={{ opacity: 0.4, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 28 }}
                  className="mt-1.5 font-mono text-[13px] font-[600] text-[var(--primary)]"
                >
                  {batchProgress.current.toLocaleString()} / {batchProgress.total.toLocaleString()} images
                </motion.p>
              </div>

              {/* Progress bar */}
              <div className="w-full space-y-2">
                <div className="h-[7px] w-full overflow-hidden rounded-full bg-gray-200/60">
                  <motion.div
                    className="shimmer-bar progress-glow h-full rounded-full"
                    initial={{ width: '2%' }}
                    animate={{ width: `${Math.max(2, (batchProgress.current / batchProgress.total) * 100)}%` }}
                    transition={{ duration: 0.1, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-[600] text-gray-500">
                    {Math.round((batchProgress.current / batchProgress.total) * 100)}% complete
                  </span>
                  <span className="text-[11px] font-[300] text-gray-400">
                    Applying AI pipeline…
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Auto-detect feedback toast ───────────────────────────────────────── */}
      <AnimatePresence>
        {detected && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="glass-card absolute bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5 rounded-2xl px-5 py-3 shadow-lg"
          >
            <span className="text-lg">✅</span>
            <div>
              <p className="text-[13px] font-[600] text-gray-800">Auto-detection complete</p>
              <p className="text-[11px] font-[300] text-gray-500">Pipeline configured · 3 operations detected</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Auto-Detect Button ───────────────────────────────────────────────────────

function AutoDetectButton({
  detecting, detected, onClick, disabled,
}: {
  detecting: boolean; detected: boolean; onClick: () => void; disabled?: boolean
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.04 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-[600] shadow-md backdrop-blur-md transition-all',
        disabled
          ? 'cursor-default bg-white/40 text-gray-300'
          : detected
            ? 'bg-emerald-500 text-white'
            : detecting
              ? 'bg-white/80 text-[var(--primary)]'
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-[var(--primary)]'
      )}
    >
      {detecting
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <span className="text-[13px]">{detected ? '✅' : '✨'}</span>
      }
      {detecting ? 'Analysing…' : detected ? 'Pipeline ready' : 'Auto-Detect Pipeline'}
    </motion.button>
  )
}
