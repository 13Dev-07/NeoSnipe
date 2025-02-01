/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'cosmic-black': 'var(--color-cosmic-black)',
        'neon-teal': 'var(--color-neon-teal)',
        'cosmic-purple': 'var(--color-cosmic-purple)',
        'sacred-gold': 'var(--color-sacred-gold)',
        'energy-blue': 'var(--color-energy-blue)',
        'void-gray': 'var(--color-void-gray)',
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', ...fontFamily.sans],
        orbitron: ['var(--font-orbitron)', ...fontFamily.sans],
      },
      spacing: {
        'golden': 'calc(1rem * var(--golden-ratio))',
        'silver': 'calc(1rem * var(--silver-ratio))',
      },
      animation: {
        'sacred-spin': 'sacredSpin 5s linear infinite',
        'energy-pulse': 'energyPulse 3s infinite',
      },
      backdropBlur: {
        'sacred': '12px',
      },
    },
  },
  plugins: [],
}