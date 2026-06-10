import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  before: React.ReactNode
  after: React.ReactNode
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export function BeforeAfterSlider({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className,
}: Props) {
  const [position, setPosition] = useState(48)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const updatePos = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const { left, width } = el.getBoundingClientRect()
    setPosition(Math.max(2, Math.min(98, ((clientX - left) / width) * 100)))
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      isDragging.current = true
      containerRef.current?.setPointerCapture(e.pointerId)
    },
    []
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return
      updatePos(e.clientX)
    },
    [updatePos]
  )

  const onPointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative select-none overflow-hidden rounded-2xl border border-white/[0.07]',
        className
      )}
      style={{ cursor: 'col-resize', aspectRatio: '16 / 10' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* After: full base layer */}
      <div className="absolute inset-0">{after}</div>

      {/* Before: clipped left layer */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {before}
      </div>

      {/* Divider glow line */}
      <div
        className="pointer-events-none absolute inset-y-0 w-[2px]"
        style={{
          left: `${position}%`,
          transform: 'translateX(-50%)',
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.85) 8%, rgba(255,255,255,0.85) 92%, transparent 100%)',
          boxShadow: '0 0 10px 2px rgba(255,255,255,0.2)',
        }}
      />

      {/* Handle circle */}
      <div
        className="pointer-events-none absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
        style={{ left: `${position}%` }}
      >
        <svg viewBox="0 0 16 16" className="h-[18px] w-[18px] text-black" fill="none">
          <path
            d="M5 3L2 8l3 5M11 3l3 5-3 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Labels */}
      <span className="pointer-events-none absolute bottom-3 left-3 rounded bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/50 backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute bottom-3 right-3 rounded border border-white/20 bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
        {afterLabel}
      </span>
    </div>
  )
}
