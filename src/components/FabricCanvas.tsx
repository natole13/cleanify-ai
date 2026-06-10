import { useEffect, useRef, useState, useCallback } from 'react'
import { Canvas, FabricImage } from 'fabric'
import { ImageIcon, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
interface WatermarkPartial {
  x_pct?: number; y_pct?: number; w_pct?: number; h_pct?: number; angle?: number
}

interface Props {
  mainImageUrl: string | null
  watermarkUrl: string | null
  watermarkOpacity: number
  onMainImageDrop: (files: File[]) => void
  onWatermarkChange: (partial: WatermarkPartial) => void
}

export function FabricCanvasEditor({
  mainImageUrl,
  watermarkUrl,
  watermarkOpacity,
  onMainImageDrop,
  onWatermarkChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const mainImgRef = useRef<FabricImage | null>(null)
  const wmImgRef = useRef<FabricImage | null>(null)
  const onChangeRef = useRef(onWatermarkChange)
  const [canvasSize, setCanvasSize] = useState(600)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    onChangeRef.current = onWatermarkChange
  }, [onWatermarkChange])

  // Measure container
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setCanvasSize(Math.max(200, Math.floor(Math.min(width, height)) - 48))
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Init Fabric canvas once
  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return

    const canvas = new Canvas(canvasElRef.current, {
      width: canvasSize,
      height: canvasSize,
      backgroundColor: '#F8FAFC',
    })
    fabricRef.current = canvas

    const report = () => {
      const wm = wmImgRef.current
      const cv = fabricRef.current
      if (!wm || !cv?.width || !cv?.height) return
      const cw = cv.width
      const ch = cv.height
      onChangeRef.current({
        x_pct: pct(wm.left ?? 0, cw),
        y_pct: pct(wm.top ?? 0, ch),
        w_pct: pct(wm.getScaledWidth(), cw),
        h_pct: pct(wm.getScaledHeight(), ch),
        angle: Math.round(wm.angle ?? 0),
      })
    }

    canvas.on('object:modified', report)
    canvas.on('object:moving', report)
    canvas.on('object:scaling', report)
    canvas.on('object:rotating', report)

    return () => {
      canvas.dispose()
      fabricRef.current = null
      mainImgRef.current = null
      wmImgRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Resize canvas
  useEffect(() => {
    if (!fabricRef.current) return
    fabricRef.current.setDimensions({ width: canvasSize, height: canvasSize })
    if (mainImgRef.current) fitImage(mainImgRef.current, canvasSize)
    fabricRef.current.renderAll()
  }, [canvasSize])

  // Load main image
  useEffect(() => {
    if (!fabricRef.current) return
    const canvas = fabricRef.current
    let cancelled = false

    if (!mainImageUrl) {
      if (mainImgRef.current) { canvas.remove(mainImgRef.current); mainImgRef.current = null }
      canvas.renderAll()
      return
    }

    FabricImage.fromURL(mainImageUrl)
      .then((img) => {
        if (cancelled || !fabricRef.current) return
        if (mainImgRef.current) fabricRef.current.remove(mainImgRef.current)
        fitImage(img, canvasSize)
        img.set({ selectable: false, evented: false, hoverCursor: 'default' })
        fabricRef.current.add(img)
        fabricRef.current.sendObjectToBack(img)
        mainImgRef.current = img
        fabricRef.current.renderAll()
      })
      .catch(() => {})

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainImageUrl])

  // Load watermark
  useEffect(() => {
    if (!fabricRef.current) return
    const canvas = fabricRef.current
    let cancelled = false

    if (!watermarkUrl) {
      if (wmImgRef.current) { canvas.remove(wmImgRef.current); wmImgRef.current = null }
      canvas.renderAll()
      return
    }

    FabricImage.fromURL(watermarkUrl)
      .then((img) => {
        if (cancelled || !fabricRef.current) return
        const cv = fabricRef.current
        if (wmImgRef.current) cv.remove(wmImgRef.current)

        const size = canvasSize
        const maxSide = size * 0.3
        const scale = Math.min(maxSide / (img.width ?? maxSide), maxSide / (img.height ?? maxSide))
        img.scale(scale)

        const left = (size - img.getScaledWidth()) / 2
        const top = (size - img.getScaledHeight()) / 2
        img.set({
          left,
          top,
          opacity: watermarkOpacity,
          originX: 'left',
          originY: 'top',
          cornerSize: 8,
          cornerColor: '#1E293B',
          cornerStrokeColor: '#FFFFFF',
          cornerStyle: 'circle',
          transparentCorners: false,
          borderColor: 'rgba(99,102,241,0.8)',
          borderScaleFactor: 1.5,
        })

        cv.add(img)
        cv.setActiveObject(img)
        wmImgRef.current = img
        cv.renderAll()

        onChangeRef.current({
          x_pct: pct(left, size),
          y_pct: pct(top, size),
          w_pct: pct(img.getScaledWidth(), size),
          h_pct: pct(img.getScaledHeight(), size),
          angle: 0,
        })
      })
      .catch(() => {})

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watermarkUrl])

  // Sync watermark opacity
  useEffect(() => {
    if (!wmImgRef.current || !fabricRef.current) return
    wmImgRef.current.set({ opacity: watermarkOpacity })
    fabricRef.current.renderAll()
  }, [watermarkOpacity])

  // Drag & drop
  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (files.length > 0) onMainImageDrop(files)
  }, [onMainImageDrop])

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center p-6"
      onDragEnter={onDrag}
      onDragOver={onDrag}
      onDragLeave={onDrag}
      onDrop={onDrop}
    >
      <div
        className="relative overflow-hidden rounded-xl shadow-md"
        style={{
          width: canvasSize,
          height: canvasSize,
          backgroundImage: `
            linear-gradient(45deg, #E8ECEF 25%, transparent 25%),
            linear-gradient(-45deg, #E8ECEF 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #E8ECEF 75%),
            linear-gradient(-45deg, transparent 75%, #E8ECEF 75%)
          `,
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          backgroundColor: '#F8FAFC',
        }}
      >
        <canvas ref={canvasElRef} />

        {!mainImageUrl && (
          <div
            className={cn(
              'pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4',
              'rounded-xl border-2 border-dashed transition-all duration-200',
              isDragging
                ? 'border-[var(--primary)] bg-[var(--accent)]'
                : 'border-gray-200 bg-transparent'
            )}
          >
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
                isDragging ? 'bg-[var(--primary)]/10' : 'bg-gray-100'
              )}
            >
              {isDragging
                ? <Upload className="h-6 w-6 text-[var(--primary)]" strokeWidth={1.5} />
                : <ImageIcon className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
              }
            </div>
            <div className="space-y-1 text-center">
              <p className={cn('text-sm font-semibold', isDragging ? 'text-[var(--primary)]' : 'text-gray-600')}>
                {isDragging ? 'Drop to upload' : 'Drop product image here'}
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP · or click Upload in sidebar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function fitImage(img: FabricImage, size: number) {
  const w = img.width ?? 1
  const h = img.height ?? 1
  const scale = Math.min((size * 0.88) / w, (size * 0.88) / h)
  img.scale(scale)
  img.set({
    left: (size - img.getScaledWidth()) / 2,
    top: (size - img.getScaledHeight()) / 2,
    originX: 'left',
    originY: 'top',
  })
  img.setCoords()
}

function pct(value: number, total: number) {
  return Math.round((value / total) * 1000) / 10
}
