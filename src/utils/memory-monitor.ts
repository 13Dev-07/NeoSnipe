const MEMORY_THRESHOLD = 0.9; // 90% of available memory

export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private memoryWarningCallback?: () => void;
  private interval?: NodeJS.Timer;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  public startMonitoring(warningCallback?: () => void) {
    this.memoryWarningCallback = warningCallback;

    this.interval = setInterval(() => {
      this.checkMemoryUsage();
    }, 10000); // Check every 10 seconds
  }

  public stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private checkMemoryUsage() {
    if (performance?.memory) {
      const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
      const ratio = usedJSHeapSize / jsHeapSizeLimit;

      if (ratio > MEMORY_THRESHOLD) {
        console.warn(`High memory usage detected: ${(ratio * 100).toFixed(1)}%`);
        this.memoryWarningCallback?.();
      }
    }
  }

  public cleanup() {
    // Force garbage collection if possible
    if (global.gc) {
      global.gc();
    }
  }
}