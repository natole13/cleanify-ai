import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  style?: React.CSSProperties
}

interface SelectProps {
  value: string
  onValueChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export function Select({ value, onValueChange, options, placeholder = 'Select…', className }: SelectProps) {
  const currentStyle = options.find(o => o.value === value)?.style

  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        className={cn(
          'flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-white/60 bg-white/50 px-2.5 text-[12px] font-[500] text-gray-700 backdrop-blur-sm',
          'transition-all hover:bg-white/75 hover:border-[var(--primary)]/30',
          'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/15 focus:border-[var(--primary)]/40',
          'data-[placeholder]:text-gray-400',
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          <span style={currentStyle}>
            {options.find(o => o.value === value)?.label ?? ''}
          </span>
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="glass-dropdown z-[200] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl p-1"
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="max-h-52 overflow-y-auto">
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  'relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-[500] text-gray-700 outline-none',
                  'transition-colors hover:bg-[var(--accent)] hover:text-[var(--primary)]',
                  'data-[highlighted]:bg-[var(--accent)] data-[highlighted]:text-[var(--primary)]',
                  'data-[state=checked]:font-[600] data-[state=checked]:text-[var(--primary)]'
                )}
              >
                <SelectPrimitive.ItemText>
                  <span style={opt.style}>{opt.label}</span>
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="ml-auto">
                  <Check className="h-3 w-3" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
