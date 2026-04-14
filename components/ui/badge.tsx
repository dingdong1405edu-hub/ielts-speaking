import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary border border-primary/20',
        secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
        destructive: 'bg-danger/10 text-danger border border-danger/20',
        outline: 'border border-border text-foreground',
        accent: 'bg-accent/10 text-accent-dark border border-accent/20',
        hsk1: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        hsk2: 'bg-blue-50 text-blue-700 border border-blue-200',
        hsk3: 'bg-amber-50 text-amber-700 border border-amber-200',
        hsk4: 'bg-violet-50 text-violet-700 border border-violet-200',
        hsk5: 'bg-rose-50 text-rose-700 border border-rose-200',
        hsk6: 'bg-slate-100 text-slate-700 border border-slate-200',
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
