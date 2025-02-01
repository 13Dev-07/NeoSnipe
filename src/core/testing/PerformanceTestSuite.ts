import { TestSuite, TestCase } from './TestRunner';
import { PerformanceMetrics, MetricType } from '../performance/PerformanceMetrics';

export interface PerformanceTestConfig {
  name: string;
  description?: string;
  load: () => Promise<void>;
  iterations: number;
  warmupIterations?: number;
  metrics: MetricType[];
  thresholds?: Partial<Record<MetricType, number>>;
}

export class PerformanceTestSuite implements TestSuite {
  readonly name: string = 'Performance Tests';
  readonly tests: TestCase[] = [];
  private metrics: PerformanceMetrics;

  constructor(metrics: PerformanceMetrics) {
    this.metrics = metrics;
  }

  addPerformanceTest(config: PerformanceTestConfig): void {
    const test: TestCase = {
      name: config.name,
      description: config.description,
      categories: ['performance'],
      
      async setup() {
        // Clear existing metrics
        config.metrics.forEach(metric => {
          this.metrics.clearMetrics(metric);
        });
      },

      async execute() {
        // Warmup phase
        const warmupIterations = config.warmupIterations || Math.min(3, config.iterations);
        for (let i = 0; i < warmupIterations; i++) {
          await config.load();
        }

        // Test phase
        for (let i = 0; i < config.iterations; i++) {
          const startTime = performance.now();
          await config.load();
          const duration = performance.now() - startTime;

          // Record metrics
          this.metrics.record('LOAD_TIME', duration);
          
          // Record other specified metrics
          config.metrics.forEach(metric => {
            const summary = this.metrics.getSummary(metric);
            if (config.thresholds?.[metric] !== undefined) {
              const threshold = config.thresholds[metric]!;
              if (summary.average > threshold) {
                throw new Error(
                  `Performance threshold exceeded for ${metric}. ` +
                  `Expected <= ${threshold}, got ${summary.average}`
                );
              }
            }
          });
        }
      },

      async teardown() {
        // Optional cleanup
      }
    };

    this.tests.push(test);
  }

  getMetricsSummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    const allMetrics = new Set<MetricType>();
    
    this.tests.forEach(test => {
      const config = test as unknown as PerformanceTestConfig;
      config.metrics.forEach(metric => allMetrics.add(metric));
    });

    allMetrics.forEach(metric => {
      const metricSummary = this.metrics.getSummary(metric);
      summary[metric] = metricSummary.average;
    });

    return summary;
  }
}