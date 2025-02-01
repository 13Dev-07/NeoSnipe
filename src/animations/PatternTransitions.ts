import { SacredPattern, TransitionConfig, AnimationState } from '../types/sacred-geometry';
import { TransitionError, TransitionCacheConfig } from '../types/sacred-geometry/transition-types';
import { SACRED_RATIOS } from '../shared/constants';

const { PHI, PI } = SACRED_RATIOS;

const DEFAULT_CACHE_CONFIG: TransitionCacheConfig = {
  maxSize: 100,
  ttl: 3600000 // 1 hour
};

export class PatternTransitions {
  private static instance: PatternTransitions;
  private transitionCache: Map<string, { config: TransitionConfig; timestamp: number }>;
  private currentState: AnimationState;
  private worker: Worker;
  private cacheConfig: TransitionCacheConfig;

  private webglResourcePool: WebGLResourcePool | null = null;
  private activeTransitions: Map<string, AnimationState> = new Map();
  private transitionCache: Map<string, TransitionConfig> = new Map();

  private constructor(cacheConfig: TransitionCacheConfig = DEFAULT_CACHE_CONFIG) {
    // Initialize WebGL resource pool if WebGL2 is available
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (gl) {
      this.webglResourcePool = new WebGLResourcePool(gl);
    }
    this.transitionCache = new Map();
    this.cacheConfig = cacheConfig;
    this.currentState = {
      currentPattern: 'metatrons-cube',
      progress: 0,
      isTransitioning: false,
    };
    this.worker = new Worker(new URL('../workers/transition-worker.ts', import.meta.url));
  }

  static getInstance(): PatternTransitions {
    if (!PatternTransitions.instance) {
      PatternTransitions.instance = new PatternTransitions();
    }
    return PatternTransitions.instance;
  }

  async transition(
    fromPattern: SacredPattern, 
    toPattern: SacredPattern, 
    duration: number = 1.0,
    onProgress?: (progress: number) => void,
    cancelToken?: AbortSignal
  ): Promise<TransitionConfig> {
    const transitionKey = `${fromPattern}-${toPattern}`;
    
    // Check cache first
    const cachedTransition = this.transitionCache.get(transitionKey);
    if (cachedTransition) {
      return this.prepareTransition(cachedTransition, duration);
    }
    if (!fromPattern || !toPattern) {
      throw this.createError('INVALID_PATTERN', 'Source or target pattern is undefined', { fromPattern, toPattern });
    }

    const transitionKey = `${fromPattern}-${toPattern}-${duration}`;
    const cached = this.transitionCache.get(transitionKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheConfig.ttl!) {
      return cached.config;
    }

    try {
      return await new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          const { type, payload } = event.data;
          if (type === 'TRANSITION_RESULT') {
            this.worker.removeEventListener('message', handleMessage);
            if (payload.error) {
              reject(payload.error);
            } else {
              this.transitionCache.set(transitionKey, {
                config: payload.config,
                timestamp: Date.now()
              });
              this.manageCache();
              resolve(payload.config);
            }
          }
        };

        this.worker.addEventListener('message', handleMessage);
        this.worker.postMessage({
          type: 'CALCULATE_TRANSITION',
          payload: { fromPattern, toPattern, duration }
        });
      });
    } catch (error) {
      throw this.createError('INVALID_STATE', 'Failed to calculate transition', { fromPattern, toPattern, state: error.message });
    }
  }

  private createPhiBasedEasing(): (t: number) => number {
    return (t: number) => {
      // Golden ratio based easing function
      return 1 - Math.pow(1 - t, PHI);
    };
  }

  private calculateInterpolationPoints(from: SacredPattern, to: SacredPattern): number[][] {
    // Calculate intermediate states for smooth transitions
    const points: number[][] = [];
    const steps = Math.floor(PHI * 10);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push(this.interpolatePatternState(from, to, t));
    }

    return points;
  }

  private interpolatePatternState(from: SacredPattern, to: SacredPattern, t: number): number[] {
    // Enhanced pattern-specific interpolation logic with sophisticated state vectors
    switch(from) {
      case 'metatrons-cube':
        return this.interpolateFromMetatronsCube(to, t);
      case 'vesica-piscis':
        return this.interpolateFromVesicaPiscis(to, t);
      case 'flower-of-life':
        return this.interpolateFromFlowerOfLife(to, t);
      case 'seed-of-life':
        return this.interpolateFromSeedOfLife(to, t);
      case 'tree-of-life':
        return this.interpolateFromTreeOfLife(to, t);
      case 'fruit-of-life':
        return this.interpolateFromFruitOfLife(to, t);
      case 'egg-of-life':
        return this.interpolateFromEggOfLife(to, t);
      default:
        return this.defaultInterpolation(t);
    }
  }

  private interpolateFromMetatronsCube(toPattern: SacredPattern, t: number): number[] {
    const baseState = [1, 1, 1, 0, 0, 0];
    const targetState = this.getTargetState(toPattern);
    return baseState.map((v, i) => v + (targetState[i] - v) * t);
  }

  private interpolateFromVesicaPiscis(toPattern: SacredPattern, t: number): number[] {
    const baseState = [0, 1, 1, 1, 0, 0];
    const targetState = this.getTargetState(toPattern);
    return baseState.map((v, i) => v + (targetState[i] - v) * t);
  }

  private interpolateFromFlowerOfLife(toPattern: SacredPattern, t: number): number[] {
    const baseState = [0, 0, 1, 1, 1, 1];
    const targetState = this.getTargetState(toPattern);
    return baseState.map((v, i) => v + (targetState[i] - v) * t);
  }

  private interpolateFromSeedOfLife(toPattern: SacredPattern, t: number): number[] {
    const baseState = [1, 0, 1, 0, 1, 0];
    const targetState = this.getTargetState(toPattern);
    return baseState.map((v, i) => v + (targetState[i] - v) * t);
  }

  private interpolateFromTreeOfLife(toPattern: SacredPattern, t: number): number[] {
    const baseState = [1, 1, 0, 1, 1, 0];
    const targetState = this.getTargetState(toPattern);
    return baseState.map((v, i) => v + (targetState[i] - v) * t);
  }

  private interpolateFromFruitOfLife(toPattern: SacredPattern, t: number): number[] {
    const baseState = [0, 1, 1, 0, 1, 1];
    const targetState = this.getTargetState(toPattern);
    return baseState.map((v, i) => v + (targetState[i] - v) * t);
  }

  private interpolateFromEggOfLife(toPattern: SacredPattern, t: number): number[] {
    const baseState = [1, 0, 0, 1, 1, 0];
    const targetState = this.getTargetState(toPattern);
    return baseState.map((v, i) => v + (targetState[i] - v) * t);
  }

  private getTargetState(pattern: SacredPattern): number[] {
    switch(pattern) {
      case 'metatrons-cube':
        return [1, 1, 1, 0, 0, 0];
      case 'vesica-piscis':
        return [0, 1, 1, 1, 0, 0];
      case 'flower-of-life':
        return [0, 0, 1, 1, 1, 1];
      default:
        return [0, 0, 0, 0, 0, 0];
    }
  }

  private defaultInterpolation(t: number): number[] {
    return [t, t, t, t, t, t];
  }

  private calculateEnergyFlowTransition(from: SacredPattern, to: SacredPattern): any {
    // Calculate energy flow patterns during transition
    const baseFlow = this.getBaseEnergyFlow(from);
    const targetFlow = this.getBaseEnergyFlow(to);
    
    return {
      flowPattern: 'phi-spiral',
      intensity: PHI,
      rotationSpeed: PI / PHI,
      baseFlow,
      targetFlow,
    };
  }

  private getBaseEnergyFlow(pattern: SacredPattern): any {
    switch(pattern) {
      case 'metatrons-cube':
        return {
          type: 'radial',
          frequency: PHI,
          amplitude: 1.0,
        };
      case 'vesica-piscis':
        return {
          type: 'linear',
          frequency: PHI * 0.5,
          amplitude: 0.8,
        };
      case 'flower-of-life':
        return {
          type: 'spiral',
          frequency: PHI * 0.618,
          amplitude: 1.2,
        };
      default:
        return {
          type: 'default',
          frequency: 1.0,
          amplitude: 1.0,
        };
    }
  }

  private createError(code: TransitionError['code'], message: string, details: TransitionError['details']): TransitionError {
    const error = new Error(message) as TransitionError;
    error.code = code;
    error.details = details;
    return error;
  }

  private manageCache(): void {
    if (this.transitionCache.size > this.cacheConfig.maxSize!) {
      // Remove oldest entries when cache exceeds max size
      const entries = Array.from(this.transitionCache.entries());
      const oldestEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, entries.length - this.cacheConfig.maxSize!);
      
      oldestEntries.forEach(([key]) => this.transitionCache.delete(key));
    }

    // Clean expired entries
    const now = Date.now();
    for (const [key, value] of this.transitionCache.entries()) {
      if (now - value.timestamp > this.cacheConfig.ttl!) {
        this.transitionCache.delete(key);
      }
    }
  }

  update(deltaTime: number): void {
    if (!this.currentState.isTransitioning || !this.currentState.duration) return;

    try {
      this.currentState.progress = Math.min(
        this.currentState.progress + deltaTime / this.currentState.duration,
        1.0
      );

      if (this.currentState.progress >= 1.0) {
        if (!this.currentState.targetPattern) {
          throw this.createError('INVALID_STATE', 'Target pattern undefined during transition completion', 
            { state: 'COMPLETION' });
        }
        this.currentState.isTransitioning = false;
        this.currentState.progress = 0;
        this.currentState.currentPattern = this.currentState.targetPattern;
        this.currentState.targetPattern = undefined;
        this.currentState.duration = undefined;
      }
    } catch (error) {
      console.error('Error during transition update:', error);
      this.resetState();
    }
  }

  getCurrentState(): AnimationState {
    return { ...this.currentState };
  }

  private resetState(): void {
    this.currentState = {
      currentPattern: this.currentState.currentPattern,
      progress: 0,
      isTransitioning: false,
      targetPattern: undefined,
      duration: undefined
    };
  }

  clearCache(): void {
    this.transitionCache.clear();
  }

  destroy(): void {
    this.worker.terminate();
    this.transitionCache.clear();
    this.resetState();
  }
}

export default PatternTransitions.getInstance();