import { AnimationConfig } from '../types/sacred-geometry';
import { preferences } from './preferences-manager';
import { analytics } from './analytics';

interface AnimationState {
  startTime: number;
  currentTime: number;
  progress: number;
  isPlaying: boolean;
}

type EasingFunction = (t: number) => number;

export class AnimationSystem {
  private animations: Map<string, AnimationState>;
  private rafId: number | null;
  private easingFunctions: Map<string, EasingFunction>;

  constructor() {
    this.animations = new Map();
    this.rafId = null;
    this.setupEasingFunctions();
  }

  /**
   * Set up easing functions
   */
  private setupEasingFunctions(): void {
    this.easingFunctions = new Map([
      ['linear', (t: number) => t],
      ['ease-in', (t: number) => t * t],
      ['ease-out', (t: number) => t * (2 - t)],
      ['ease-in-out', (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t]
    ]);
  }

  /**
   * Start animation loop
   */
  private startAnimationLoop(): void {
    if (this.rafId !== null) return;

    const animate = (timestamp: number) => {
      this.updateAnimations(timestamp);
      this.rafId = requestAnimationFrame(animate);
    };

    this.rafId = requestAnimationFrame(animate);
  }

  /**
   * Stop animation loop
   */
  private stopAnimationLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Update animations
   */
  private updateAnimations(timestamp: number): void {
    for (const [id, state] of this.animations.entries()) {
      if (!state.isPlaying) continue;

      const config = this.getAnimationConfig(id);
      if (!config) continue;

      const elapsed = timestamp - state.startTime;
      const duration = config.duration * preferences.getPreferences().accessibility.animationSpeedFactor;
      
      state.currentTime = elapsed;
      state.progress = Math.min(elapsed / duration, 1);

      if (state.progress >= 1) {
        if (config.loop) {
          state.startTime = timestamp;
          state.progress = 0;
        } else {
          state.isPlaying = false;
          this.onAnimationComplete(id);
        }
      }
    }

    if (this.animations.size === 0 || ![...this.animations.values()].some(state => state.isPlaying)) {
      this.stopAnimationLoop();
    }
  }

  /**
   * Get animation configuration
   */
  private getAnimationConfig(id: string): AnimationConfig | null {
    // Implementation depends on how configurations are stored
    return null;
  }

  /**
   * Handle animation completion
   */
  private onAnimationComplete(id: string): void {
    analytics.trackEvent('animation', 'complete', id);
    // Additional completion handling
  }

  /**
   * Start animation
   */
  public startAnimation(id: string, config: AnimationConfig): void {
    const state: AnimationState = {
      startTime: performance.now(),
      currentTime: 0,
      progress: 0,
      isPlaying: true
    };

    this.animations.set(id, state);
    this.startAnimationLoop();
    
    analytics.trackEvent('animation', 'start', id);
  }

  /**
   * Pause animation
   */
  public pauseAnimation(id: string): void {
    const state = this.animations.get(id);
    if (state) {
      state.isPlaying = false;
      analytics.trackEvent('animation', 'pause', id);
    }
  }

  /**
   * Resume animation
   */
  public resumeAnimation(id: string): void {
    const state = this.animations.get(id);
    if (state) {
      state.startTime = performance.now() - state.currentTime;
      state.isPlaying = true;
      this.startAnimationLoop();
      analytics.trackEvent('animation', 'resume', id);
    }
  }

  /**
   * Stop animation
   */
  public stopAnimation(id: string): void {
    this.animations.delete(id);
    analytics.trackEvent('animation', 'stop', id);
  }

  /**
   * Stop all animations
   */
  public stopAllAnimations(): void {
    this.animations.clear();
    this.stopAnimationLoop();
    analytics.trackEvent('animation', 'stopAll');
  }

  /**
   * Get animation progress
   */
  public getProgress(id: string): number {
    return this.animations.get(id)?.progress ?? 0;
  }

  /**
   * Check if animation is playing
   */
  public isPlaying(id: string): boolean {
    return this.animations.get(id)?.isPlaying ?? false;
  }

  /**
   * Apply easing function
   */
  public applyEasing(value: number, easing: string = 'linear'): number {
    const easingFn = this.easingFunctions.get(easing) ?? this.easingFunctions.get('linear');
    return easingFn(value);
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.stopAllAnimations();
    this.animations.clear();
  }
}

// Export singleton instance
export const animationSystem = new AnimationSystem();