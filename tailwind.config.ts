import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'matte-black':   '#0A0A0A',
        'off-black':     '#111111',
        'dark-surface':  '#1A1A1A',
        'dark-border':   '#2A2A2A',
        'olive-drab':    '#556B2F',
        'olive-light':   '#6B8E23',
        'olive-dark':    '#3D4F22',
        'desert-tan':    '#C8A97C',
        'desert-light':  '#D4B896',
        'desert-dark':   '#A8895C',
        'blaze':         '#FF5722',
        'blaze-light':   '#FF7043',
        'blaze-dark':    '#E64A19',
        'mission-red':   '#CC2200',
        'success-green': '#4CAF50',
        'warning-amber': '#FFC107',
        'text-primary':  '#E8E0D0',
        'text-secondary':'#9A8E7E',
        'text-muted':    '#5A5248',
      },
      fontFamily: {
        heading: ['var(--font-bebas-neue)', 'Impact', 'sans-serif'],
        body:    ['var(--font-inter)',      'system-ui', 'sans-serif'],
      },
      fontSize: {
        display:  ['4.5rem', { lineHeight: '1',    letterSpacing: '0.05em' }],
        headline: ['3rem',   { lineHeight: '1.05', letterSpacing: '0.04em' }],
        title:    ['2rem',   { lineHeight: '1.1',  letterSpacing: '0.03em' }],
        stencil:  ['0.875rem',{ lineHeight: '1',   letterSpacing: '0.2em'  }],
      },
      boxShadow: {
        'dog-tag':    '0 4px 6px -1px rgba(0,0,0,0.6), 0 2px 4px -1px rgba(0,0,0,0.4), inset 0 1px 0 rgba(200,169,124,0.08)',
        'ammo':       '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        'stamp':      '0 0 24px rgba(204,34,0,0.5), inset 0 0 12px rgba(204,34,0,0.1)',
        'glow-olive': '0 0 20px rgba(85,107,47,0.4)',
        'glow-blaze': '0 0 20px rgba(255,87,34,0.4)',
        'glow-tan':   '0 0 20px rgba(200,169,124,0.3)',
      },
      animation: {
        'stamp-in':    'stampIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker':     'flicker 4s ease-in-out infinite',
        'slide-up':    'slideUp 0.3s ease-out forwards',
        'slide-in':    'slideIn 0.35s ease-out forwards',
        'shake':       'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'fade-in':     'fadeIn 0.4s ease-out forwards',
        'bar-grow':    'barGrow 0.6s ease-out forwards',
        'badge-pop':   'badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        stampIn: {
          '0%':   { opacity: '0', transform: 'rotate(-15deg) scale(2.2)' },
          '60%':  { opacity: '1', transform: 'rotate(3deg) scale(0.93)' },
          '80%':  { transform: 'rotate(-1deg) scale(1.03)' },
          '100%': { opacity: '1', transform: 'rotate(2deg) scale(1)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '48%':      { opacity: '1' },
          '50%':      { opacity: '0.82' },
          '52%':      { opacity: '1' },
          '54%':      { opacity: '0.9' },
          '56%':      { opacity: '1' },
        },
        shake: {
          '10%, 90%':    { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%':    { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-3px, 0, 0)' },
          '40%, 60%':    { transform: 'translate3d(3px, 0, 0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        barGrow: {
          '0%':   { width: '0%' },
          '100%': { width: '100%' },
        },
        badgePop: {
          '0%':   { opacity: '0', transform: 'scale(0.5)' },
          '70%':  { transform: 'scale(1.1)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.clip-dogtag': {
          clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
        },
        '.clip-dogtag-sm': {
          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
        },
        '.clip-dogtag-xs': {
          clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
        },
        '.text-stencil': {
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        },
        '.border-dogtag': {
          outline: '1px solid #556B2F',
          outlineOffset: '2px',
        },
      })
    }),
  ],
}

export default config
