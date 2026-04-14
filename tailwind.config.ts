import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        primary: { DEFAULT: '#10B981', dark: '#059669', light: '#D1FAE5', foreground: '#ffffff' },
        secondary: { DEFAULT: '#6366F1', dark: '#4F46E5', light: '#E0E7FF', foreground: '#ffffff' },
        accent: { DEFAULT: '#F59E0B', dark: '#D97706', light: '#FEF3C7', foreground: '#ffffff' },
        danger: { DEFAULT: '#EF4444', light: '#FEE2E2', foreground: '#ffffff' },
        success: { DEFAULT: '#10B981', light: '#D1FAE5' },
        border: '#E2E8F0',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        muted: { DEFAULT: '#F1F5F9', foreground: '#94A3B8' },
        card: { DEFAULT: '#FFFFFF', foreground: '#1E293B' },
        popover: { DEFAULT: '#FFFFFF', foreground: '#1E293B' },
        foreground: '#1E293B',
        input: '#E2E8F0',
        ring: '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'Nunito', 'sans-serif'],
        chinese: ['Noto Sans SC', 'sans-serif'],
      },
      borderRadius: { lg: '0.75rem', md: '0.5rem', sm: '0.375rem', xl: '1rem', '2xl': '1rem', '3xl': '1.5rem' },
      boxShadow: {
        'soft': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 2px 8px -2px rgb(0 0 0 / 0.06)',
        'elevated': '0 4px 16px -2px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.04)',
        'glow-primary': '0 0 20px rgb(16 185 129 / 0.15)',
        'glow-secondary': '0 0 20px rgb(99 102 241 / 0.15)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'bounce-in': { '0%': { transform: 'scale(0.9)', opacity: '0' }, '50%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        'xp-gain': { '0%': { transform: 'translateY(0)', opacity: '1' }, '100%': { transform: 'translateY(-50px)', opacity: '0' } },
        'shake': { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
        'flip-in': { '0%': { transform: 'rotateY(-90deg)', opacity: '0' }, '100%': { transform: 'rotateY(0deg)', opacity: '1' } },
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-in': { '0%': { opacity: '0', transform: 'translateX(-12px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'pulse-soft': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
        'node-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(99 102 241 / 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgb(99 102 241 / 0)' },
        },
        'star-pop': {
          '0%': { transform: 'scale(0) rotate(-20deg)', opacity: '0' },
          '60%': { transform: 'scale(1.3) rotate(5deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'bounce-in': 'bounce-in 0.3s ease-out',
        'xp-gain': 'xp-gain 1.2s ease-out forwards',
        'shake': 'shake 0.3s ease-in-out',
        'flip-in': 'flip-in 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'node-pulse': 'node-pulse 2s ease-in-out infinite',
        'star-pop': 'star-pop 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
export default config
