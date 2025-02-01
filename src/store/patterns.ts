import create from 'zustand';
import { SacredPattern, PatternState, AnimationState } from '../types/sacred-geometry';
import PatternTransitions from '../animations/PatternTransitions';
import EnergyFlowVisualizer from '../systems/EnergyFlowVisualizer';
import { SACRED_RATIOS } from '../shared/constants';

const { PHI } = SACRED_RATIOS;

interface PatternStore {
  currentPattern: SacredPattern;
  patternState: PatternState;
  animationState: AnimationState;
  transitionDuration: number;
  energyFlowIntensity: number;
  setPattern: (pattern: SacredPattern) => void;
  updateAnimationState: (deltaTime: number) => void;
  setEnergyFlowIntensity: (intensity: number) => void;
  resetState: () => void;
}

export const usePatternStore = create<PatternStore>((set, get) => ({
  currentPattern: 'metatrons-cube',
  patternState: {
    intensity: 1.0,
    scale: 1.0,
    rotation: 0,
  },
  animationState: {
    currentPattern: 'metatrons-cube',
    progress: 0,
    isTransitioning: false,
  },
  transitionDuration: PHI,
  energyFlowIntensity: 1.0,

  setPattern: (pattern: SacredPattern) => {
    const current = get().currentPattern;
    if (current === pattern) return;

    const transitions = PatternTransitions.getInstance();
    const transitionConfig = transitions.transition(
      current,
      pattern,
      get().transitionDuration
    );

    set(state => ({
      currentPattern: pattern,
      animationState: {
        ...state.animationState,
        isTransitioning: true,
        targetPattern: pattern,
        transitionConfig,
      }
    }));
  },

  updateAnimationState: (deltaTime: number) => {
    const { animationState } = get();
    if (!animationState.isTransitioning) return;

    PatternTransitions.getInstance().update(deltaTime);
    EnergyFlowVisualizer.getInstance().update(deltaTime);

    const newState = PatternTransitions.getInstance().getCurrentState();
    set({ animationState: newState });
  },

  setEnergyFlowIntensity: (intensity: number) => {
    set({ energyFlowIntensity: intensity });
  },

  resetState: () => {
    set({
      currentPattern: 'metatrons-cube',
      patternState: {
        intensity: 1.0,
        scale: 1.0,
        rotation: 0,
      },
      animationState: {
        currentPattern: 'metatrons-cube',
        progress: 0,
        isTransitioning: false,
      },
      energyFlowIntensity: 1.0,
    });
  },
}));

export default usePatternStore;