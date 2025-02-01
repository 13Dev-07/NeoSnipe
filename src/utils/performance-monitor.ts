import { PERFORMANCE_THRESHOLDS } from '@/shared/constants';

export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fps: number = 0;
  private frameTimes: number[] = [];
  private readonly maxFrameTimes = 60;
  private warningsIssued = 0;
  private readonly maxWarnings = 3;

  constructor() {
    this.lastTime = performance.now();
  }

  update(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.frameTimes.push(deltaTime);

    if (this.frameTimes.length > this.maxFrameTimes) {
      this.frameTimes.shift();
    }

    this.frameCount++;

    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
      this.checkPerformance();
    }
  }

  private checkPerformance(): void {
    if (this.fps < PERFORMANCE_THRESHOLDS.MIN_FPS && this.warningsIssued < this.maxWarnings) {
      console.warn(`Performance warning: FPS dropped to ${this.fps}`);
      this.warningsIssued++;
    }
  }

  getFPS(): number {
    return this.fps;
  }

  getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    const sum = this.frameTimes.reduce((a, b) => a + b, 0);
    return sum / this.frameTimes.length;
  }

  shouldReduceQuality(): boolean {
    return this.fps < PERFORMANCE_THRESHOLDS.MIN_FPS;
  }

  getPerformanceScore(): number {
    const targetFPS = PERFORMANCE_THRESHOLDS.TARGET_FPS;
    const minFPS = PERFORMANCE_THRESHOLDS.MIN_FPS;
    const currentFPS = this.fps;

    if (currentFPS >= targetFPS) return 1;
    if (currentFPS <= minFPS) return 0;

    return (currentFPS - minFPS) / (targetFPS - minFPS);
  }

  getMetrics() {
    return {
      fps: this.fps,
      averageFrameTime: this.getAverageFrameTime(),
      performanceScore: this.getPerformanceScore(),
      warningsIssued: this.warningsIssued,
    };
  }

  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 0;
    this.frameTimes = [];
    this.warningsIssued = 0;
  }
}

export const globalPerformanceMonitor = new PerformanceMonitor();