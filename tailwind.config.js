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
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        pillar: {
          prayer: '#10b981',
          health: '#f43f5e',
          addiction: '#f97316',
          projects: '#8b5cf6',
          skills: '#3b82f6',
          vision: '#eab308',
        },
      },
      borderRadius: {
        'card': '16px',
        'pill': '9999px',
        'sheet': '24px',
      },
      fontFamily: {
        sans: ['SF Pro', 'system-ui', 'sans-serif'],
        rounded: ['SF Pro Rounded', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'monospace'],
      },
      animation: {
        'spring': 'spring 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'bounce-in': 'bounceIn 0.2s cubic-bezier(0.6, 0.0, 0.4, 1.2)',
      },
      keyframes: {
        spring: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}