import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '28-DAY CHALLENGE | COMBAT FITNESS',
  description: 'Military-style 28-day fitness challenge. No excuses. No days off.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0A0A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body className="bg-matte-black text-text-primary font-body min-h-screen relative overflow-x-hidden">
        {/* Full-page grain/noise texture overlay */}
        <div
          aria-hidden="true"
          className="bg-noise pointer-events-none fixed inset-0 z-[9999]"
          style={{ opacity: 0.04 }}
        />
        {children}
      </body>
    </html>
  )
}
