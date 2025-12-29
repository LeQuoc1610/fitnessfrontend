/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#05060a',
        foreground: '#f9fafb',
        muted: '#6b7280',
        neon: {
          green: '#22c55e',
          blue: '#38bdf8',
          orange: '#fb923c',
        },
        gymbro: {
          cyan: '#2dd4bf',
          cyanDark: '#06b6d4',
          teal900: '#064e3b',
          orange400: '#fb923c',
          orange500: '#f97316',
          slate900: '#0f172a'
        },
        card: '#0b0f1a',
        border: '#1f2933',
      },
      fontFamily: {
        display: ['Impact', 'Oswald', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 30px rgba(56, 189, 248, 0.25)',
        gymGlowCyan: '0 6px 32px rgba(45,212,191,0.18)',
        gymGlowOrange: '0 6px 32px rgba(249,115,22,0.14)'
      },
      backgroundImage: {
        'gym-gradient': 'linear-gradient(180deg,#0f172a 0%, #06383a 50%, #0f172a 100%)',
        'accent-cyan-teal': 'linear-gradient(90deg,#2dd4bf,#06b6d4)'
      },
    },
  },
  plugins: [],
};
