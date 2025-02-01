import { PHI, SACRED_TIMING } from '../sacred-constants.js';

export const sacredAnimations = {
  scale: {
    up: PHI,
    down: 1 / PHI
  },
  duration: SACRED_TIMING.BASE,
  transition: {
    type: 'spring',
    stiffness: 161.8,
    damping: 10
  }
};

export const webGLCompatibleMotion = {
  ...sacredAnimations,
  transition: {
    ...sacredAnimations.transition,
    restDelta: 0.001,
    restSpeed: 0.001
  }
};