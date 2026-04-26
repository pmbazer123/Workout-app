'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, BookOpen, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/cn'

const ITEMS = [
  { href: '/dashboard', label: 'HOME',     icon: LayoutGrid },
  { href: '/exercises', label: 'LIBRARY',  icon: BookOpen   },
  { href: '/progress',  label: 'PROGRESS', icon: TrendingUp },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-off-black/95 backdrop-blur-sm border-t border-dark-border pb-safe">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href)) ||
            (href === '/dashboard' && (pathname === '/dashboard' || pathname.startsWith('/workout')))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-5 py-2 transition-colors duration-150',
                active ? 'text-blaze' : 'text-text-muted hover:text-text-secondary',
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-stencil text-[9px] tracking-widest">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
