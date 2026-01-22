import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal - Tonos tierra sofisticados
        primary: {
          50: '#f8f7f4',
          100: '#edeae3',
          500: '#8b7355', // Base
          600: '#6b5943',
          900: '#2d241c',
        },
        // Acento - Verde oliva
        accent: {
          500: '#7a8450',
          600: '#5f6a3c',
        },
        // Neutros premium
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          800: '#292524',
          900: '#1c1917',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}

export default config

Instrucciones para otra sesión:

Usar primary-500 para botones principales
accent-500 para CTAs secundarios
font-display para títulos grandes
font-sans para texto general
Generoso whitespace (py-18, gap-12)