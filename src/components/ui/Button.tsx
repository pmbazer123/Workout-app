'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: React.ReactNode
}

const variants: Record<Variant, string> = {
  primary:   'bg-blaze text-white border-transparent hover:bg-blaze-light active:bg-blaze-dark',
  secondary: 'bg-dark-surface text-text-primary border-olive-drab hover:border-desert-tan hover:text-desert-tan',
  ghost:     'bg-transparent text-text-secondary border-dark-border hover:border-olive-drab hover:text-text-primary',
  danger:    'bg-mission-red text-white border-transparent hover:opacity-90',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-stencil text-xs',
  md: 'px-6 py-3 text-stencil text-sm',
  lg: 'px-8 py-4 text-stencil text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: Props) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: 0.96 }}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      disabled={isDisabled}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 font-heading tracking-widest',
        'border clip-dogtag-xs transition-colors duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </span>
      )}
      <span className={loading ? 'opacity-0' : undefined}>{children}</span>
    </motion.button>
  )
}
