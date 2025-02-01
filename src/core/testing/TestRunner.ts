import { PerformanceMetrics } from '../performance/PerformanceMetrics';
import { ValidationUtils } from '../types/ValidationUtils';

export interface TestCase {
  name: string;
  description?: string;
  setup?: () => Promise<void>;
  execute: () => Promise<void>;
  teardown?: () => Promise<void>;
  timeout?: number;
  categories?: string[];
}

export interface TestSuite {
  name: string;
  description?: string;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  tests: TestCase[];
}

export interface TestResult {
  suiteName: string;
  testName: string;
  passed: boolean;
  error?: Error;
  duration: number;
  memoryUsage?: number;
  perfMetrics?: Record<string, number>;
}

export type TestFilter = (test: TestCase) => boolean;

export class TestRunner {
  private suites: TestSuite[] = [];
  private readonly performanceMetrics: PerformanceMetrics;
  private results: TestResult[] = [];
  
  constructor(performanceMetrics: PerformanceMetrics) {
    this.performanceMetrics = performanceMetrics;
  }

  registerSuite(suite: TestSuite): void {
    ValidationUtils.assertNonNull(suite, 'Test suite cannot be null');
    ValidationUtils.assertNonNull(suite.tests, 'Test suite must contain tests');
    this.suites.push(suite);
  }

  async runAll(filter?: TestFilter): Promise<TestResult[]> {
    this.results = [];
    
    for (const suite of this.suites) {
      await this.runSuite(suite, filter);
    }

    return this.results;
  }

  private async runSuite(suite: TestSuite, filter?: TestFilter): Promise<void> {
    try {
      if (suite.setup) {
        await suite.setup();
      }

      for (const test of suite.tests) {
        if (filter && !filter(test)) {
          continue;
        }

        await this.runTest(suite, test);
      }
    } finally {
      if (suite.teardown) {
        await suite.teardown();
      }
    }
  }

  private async runTest(suite: TestSuite, test: TestCase): Promise<void> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;
    let error: Error | undefined;
    let passed = false;

    try {
      if (test.setup) {
        await test.setup();
      }

      await Promise.race([
        test.execute(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), test.timeout || 5000)
        )
      ]);

      passed = true;
    } catch (e) {
      error = e as Error;
      passed = false;
    } finally {
      if (test.teardown) {
        await test.teardown();
      }
    }

    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;

    const result: TestResult = {
      suiteName: suite.name,
      testName: test.name,
      passed,
      error,
      duration: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      perfMetrics: this.collectPerformanceMetrics()
    };

    this.results.push(result);
    this.reportTestResult(result);
  }

  private collectPerformanceMetrics(): Record<string, number> {
    const metrics: Record<string, number> = {};
    
    ['FPS', 'FRAME_TIME', 'MEMORY_USAGE', 'LOAD_TIME'].forEach(metricType => {
      const summary = this.performanceMetrics.getSummary(metricType as any);
      metrics[metricType] = summary.average;
    });

    return metrics;
  }

  private reportTestResult(result: TestResult): void {
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${status} ${result.suiteName} - ${result.testName}`);
    
    if (!result.passed && result.error) {
      console.error(`  Error: ${result.error.message}`);
      console.error(`  Stack: ${result.error.stack}`);
    }

    console.log(`  Duration: ${result.duration}ms`);
    console.log(`  Memory Delta: ${(result.memoryUsage || 0) / 1024 / 1024}MB`);
    
    if (result.perfMetrics) {
      console.log('  Performance Metrics:');
      Object.entries(result.perfMetrics).forEach(([key, value]) => {
        console.log(`    ${key}: ${value}`);
      });
    }
  }

  getResults(): TestResult[] {
    return [...this.results];
  }

  clearResults(): void {
    this.results = [];
  }
}