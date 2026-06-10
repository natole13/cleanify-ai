import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--primary)] text-white',
        secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
        outline: 'border border-[var(--border)] text-[var(--foreground)]',
        accent: 'bg-[var(--accent)] text-[var(--accent-foreground)]',
        success: 'bg-[oklch(0.92_0.08_150)] text-[oklch(0.40_0.18_150)]',
        warning: 'bg-[oklch(0.95_0.06_70)] text-[oklch(0.50_0.18_70)]',
        destructive: 'bg-[oklch(0.95_0.06_27)] text-[var(--destructive)]',
        processing: 'bg-[oklch(0.95_0.08_264)] text-[var(--primary)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
