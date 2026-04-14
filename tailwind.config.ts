import type { Config } from 'tailwindcss'

/**
 * Tailwind CSS configuration.
 *
 * NOTE: This project uses Tailwind v4 via the @tailwindcss/postcss plugin.
 * Core theme tokens are declared in app/globals.css using @theme inline blocks.
 * This config file provides:
 *  - darkMode strategy
 *  - extended color palette for IDE auto-complete
 *  - custom animation / keyframe definitions
 *  - fontFamily extensions
 */
const config: Config = {
  // -------------------------------------------------------------------------
  // Dark mode — driven by the "dark" class on <html>
  // -------------------------------------------------------------------------
  darkMode: 'class',

  // -------------------------------------------------------------------------
  // Content paths — tell Tailwind where to look for class names
  // -------------------------------------------------------------------------
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      // -----------------------------------------------------------------------
      // Font families
      // -----------------------------------------------------------------------
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'monospace'],
      },

      // -----------------------------------------------------------------------
      // Color palette
      // -----------------------------------------------------------------------
      colors: {
        // Primary — blue
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
          DEFAULT: '#3B82F6',
        },
        // Accent — emerald
        accent: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          DEFAULT: '#10B981',
        },
        // App background surfaces
        surface: {
          base:    '#0B1120',
          subtle:  '#0F1629',
          raised:  '#1E293B',
          overlay: '#1a2740',
        },
      },

      // -----------------------------------------------------------------------
      // Keyframe definitions
      // -----------------------------------------------------------------------
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.92)', opacity: '1' },
          '80%, 100%': { transform: 'scale(1.45)', opacity: '0' },
        },
        waveform: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },

      // -----------------------------------------------------------------------
      // Named animations
      // -----------------------------------------------------------------------
      animation: {
        'pulse-ring': 'pulse-ring 1.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        waveform:     'waveform 1.2s ease-in-out infinite',
        shimmer:      'shimmer 1.8s linear infinite',
        'spin-slow':  'spin-slow 3s linear infinite',
        'fade-in-up': 'fade-in-up 0.4s ease both',
        blink:        'blink 1s step-end infinite',
        float:        'float 3s ease-in-out infinite',
      },

      // -----------------------------------------------------------------------
      // Border radius
      // -----------------------------------------------------------------------
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // -----------------------------------------------------------------------
      // Box shadow
      // -----------------------------------------------------------------------
      boxShadow: {
        'glow-blue':    '0 0 24px rgba(59, 130, 246, 0.3)',
        'glow-emerald': '0 0 24px rgba(16, 185, 129, 0.3)',
        'glow-red':     '0 0 24px rgba(239, 68, 68, 0.3)',
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'dark-md': '0 4px 16px 0 rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
      },

      // -----------------------------------------------------------------------
      // Background image
      // -----------------------------------------------------------------------
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },

      // -----------------------------------------------------------------------
      // Backdrop blur
      // -----------------------------------------------------------------------
      backdropBlur: {
        xs: '2px',
      },

      // -----------------------------------------------------------------------
      // Screen breakpoints
      // -----------------------------------------------------------------------
      screens: {
        xs: '480px',
      },
    },
  },

  plugins: [],
}

export default config
