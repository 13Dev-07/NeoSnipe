// Sacred geometry animations
export const animations = {
  sacredSpin: {
    keyframes: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(calc(360deg * var(--golden-ratio)))' }
    },
    duration: '5s',
    timing: 'linear',
    iteration: 'infinite'
  },
  energyPulse: {
    keyframes: {
      '0%': { opacity: 0.5, transform: 'scale(1)' },
      '50%': { opacity: 1, transform: 'scale(calc(1 * var(--golden-ratio)))' },
      '100%': { opacity: 0.5, transform: 'scale(1)' }
    },
    duration: '3s',
    timing: 'ease-in-out',
    iteration: 'infinite'
  }
};