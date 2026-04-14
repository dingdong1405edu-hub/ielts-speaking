import type { Config } from 'tailwindcss'

/**
 * Tailwind CSS v4 configuration.
 * Theme tokens live in app/globals.css via @theme.
 * This file only provides darkMode strategy + content paths.
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
}

export default config
