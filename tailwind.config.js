/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-space': '#06071b',
        'neon-teal': '#00FFCC',
        'cosmic-purple': '#9674d4',
        'golden': '#FFD700',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slower': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'geometric-morph': 'morph 89s infinite',
      },
      keyframes: {
        morph: {
          '0%, 100%': { 'clip-path': 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
          '25%': { 'clip-path': 'polygon(50% 0%, 100% 100%, 50% 100%, 0% 0%)' },
          '50%': { 'clip-path': 'polygon(100% 0%, 100% 100%, 0% 100%, 0% 0%)' },
          '75%': { 'clip-path': 'polygon(50% 0%, 50% 100%, 0% 100%, 100% 0%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      dropShadow: {
        'neon': '0 0 10px rgba(0, 255, 204, 0.5)',
      },
    },
  },
  plugins: [],
};
