/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        revx: {
          dark: '#080b0f',
          surface: '#0f161e',
          card: '#151d27',
          cardHover: '#1c2633',
          border: '#222f3e',
          borderGlow: 'rgba(16, 185, 129, 0.25)',
          emerald: '#10b981',
          emeraldDark: '#059669',
          emeraldGlow: '#34d399',
          hazard: '#ef4444',
          warning: '#f59e0b',
          platinum: '#f8fafc',
          titanium: '#94a3b8',
          carbon: '#1a222c',
        },
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'glow-subtle': '0 0 15px -3px rgba(16, 185, 129, 0.12)',
        'automotive-card': '0 10px 30px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
