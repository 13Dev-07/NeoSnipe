import { PerformanceMetrics, MetricType, MetricSummary } from './PerformanceMetrics';
import { ResourceManager } from '../memory/ResourceManager';

export interface OptimizationStrategy {
  name: string;
  condition: (metrics: PerformanceMetrics) => boolean;
  action: () => Promise<void>;
  cooldown: number; // ms
  lastRun?: number;
}

export class PerformanceOptimizer {
  private metrics: PerformanceMetrics;
  private resourceManager: ResourceManager;
  private strategies: OptimizationStrategy[] = [];
  private isOptimizing: boolean = false;

  constructor(metrics: PerformanceMetrics, resourceManager: ResourceManager) {
    this.metrics = metrics;
    this.resourceManager = resourceManager;
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.strategies = [
      {
        name: 'Memory Cleanup',
        condition: (metrics: PerformanceMetrics) => {
          const memorySummary = metrics.getSummary('MEMORY_USAGE');
          return memorySummary.average > 0.8 * this.resourceManager.getTotalMemoryUsage();
        },
        action: async () => {
          this.resourceManager.performEmergencyCleanup();
        },
        cooldown: 30000 // 30 seconds
      },
      {
        name: 'Texture Quality Reduction',
        condition: (metrics: PerformanceMetrics) => {
          const fpsSummary = metrics.getSummary('FPS');
          return fpsSummary.average < 30;
        },
        action: async () => {
          // TODO: Implement texture quality reduction
          console.log('Reducing texture quality');
        },
        cooldown: 60000 // 1 minute
      },
      {
        name: 'Draw Call Batching',
        condition: (metrics: PerformanceMetrics) => {
          const drawCallsSummary = metrics.getSummary('DRAW_CALLS');
          return drawCallsSummary.average > 1000;
        },
        action: async () => {
          // TODO: Implement draw call batching
          console.log('Optimizing draw calls');
        },
        cooldown: 45000 // 45 seconds
      }
    ];
  }

  async optimize(): Promise<void> {
    if (this.isOptimizing) {
      return;
    }

    this.isOptimizing = true;
    const now = Date.now();

    try {
      for (const strategy of this.strategies) {
        if (strategy.lastRun && now - strategy.lastRun < strategy.cooldown) {
          continue;
        }

        if (strategy.condition(this.metrics)) {
          console.log(`Applying optimization strategy: ${strategy.name}`);
          await strategy.action();
          strategy.lastRun = now;
        }
      }
    } finally {
      this.isOptimizing = false;
    }
  }

  addStrategy(strategy: OptimizationStrategy): void {
    this.strategies.push(strategy);
  }

  removeStrategy(name: string): void {
    this.strategies = this.strategies.filter(s => s.name !== name);
  }

  getStrategies(): OptimizationStrategy[] {
    return [...this.strategies];
  }

  startAutoOptimization(intervalMs: number = 5000): void {
    setInterval(() => {
      this.optimize().catch(console.error);
    }, intervalMs);
  }
}