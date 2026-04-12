import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold:       '#E8B931',
          'gold-dim': '#BA7517',
          'gold-bg':  'rgba(232,185,49,0.08)',
          dark:       '#0F0F0F',
          surface:    '#1A1A1A',
          card:       '#222222',
          border:     '#2D2D2D',
          'text-primary':   '#F5F5F5',
          'text-secondary': '#A0A0A0',
          'text-muted':     '#666666',
          blue:   '#378ADD',
          teal:   '#1D9E75',
          coral:  '#D85A30',
          purple: '#7F77DD',
          pink:   '#D4537E',
          red:    '#E24B4A',
        },
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'monospace'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
