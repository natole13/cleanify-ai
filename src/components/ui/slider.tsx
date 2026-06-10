import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

interface SliderProps {
  value: number
  onValueChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, className }: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn('relative flex w-full touch-none select-none items-center py-1', className)}
      value={[value]}
      onValueChange={([v]) => onValueChange(v)}
      min={min}
      max={max}
      step={step}
    >
      <SliderPrimitive.Track
        data-radix-slider-track
        className="relative h-[3px] w-full grow overflow-hidden rounded-full bg-[rgba(203,213,225,0.7)]"
      >
        <SliderPrimitive.Range
          data-radix-slider-range
          className="absolute h-full bg-[var(--primary)]"
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-radix-slider-thumb
        className="block h-4 w-4 rounded-full border-2 border-[var(--primary)] bg-white shadow-sm outline-none transition-all hover:scale-110 focus:scale-110 focus:shadow-[0_0_0_4px_rgba(79,70,229,0.15)]"
      />
    </SliderPrimitive.Root>
  )
}
