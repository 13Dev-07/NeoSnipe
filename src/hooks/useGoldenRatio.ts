import { sacredAnimations } from '@/utils/sacred-geometry/motion-presets';

export const useGoldenRatio = () => {
  return {
    scale: sacredAnimations.scale,
    duration: sacredAnimations.duration,
    transition: sacredAnimations.transition
  };
};