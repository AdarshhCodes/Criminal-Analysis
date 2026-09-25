/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forge: {
          bg: 'rgb(var(--forge-bg) / <alpha-value>)',
          panel: 'rgb(var(--forge-panel) / <alpha-value>)',
          card: 'rgb(var(--forge-card) / <alpha-value>)',
          cardHover: 'rgb(var(--forge-card-hover) / <alpha-value>)',
          border: 'rgb(var(--forge-border) / <alpha-value>)',
          borderLight: 'rgb(var(--forge-border-light) / <alpha-value>)',
          cyan: 'rgb(var(--forge-cyan) / <alpha-value>)',
          cyanLight: 'rgb(var(--forge-cyan-light) / <alpha-value>)',
          emerald: 'rgb(var(--forge-emerald) / <alpha-value>)',
          amber: 'rgb(var(--forge-amber) / <alpha-value>)',
          rose: 'rgb(var(--forge-rose) / <alpha-value>)',
          purple: 'rgb(var(--forge-purple) / <alpha-value>)',
          indigo: 'rgb(var(--forge-indigo) / <alpha-value>)',
          text: {
            primary: 'rgb(var(--forge-text-primary) / <alpha-value>)',
            secondary: 'rgb(var(--forge-text-secondary) / <alpha-value>)',
            muted: 'rgb(var(--forge-text-muted) / <alpha-value>)',
          }
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'panel': 'var(--forge-shadow-panel)',
        'cyan-glow': '0 0 15px -3px rgba(6, 182, 212, 0.3)',
        'amber-glow': '0 0 15px -3px rgba(245, 158, 11, 0.3)',
      }
    },
  },
  plugins: [],
}
