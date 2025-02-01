import { PerformanceOptimizer } from '../../src/utils/performance-optimizer';
import { GeometryCalculator } from '../../src/utils/geometry-calculations';

describe('Geometry Performance Benchmarks', () => {
  let optimizer: PerformanceOptimizer;
  let calculator: GeometryCalculator;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    optimizer = new PerformanceOptimizer(gl);
    calculator = new GeometryCalculator();
  });

  test('Pattern Generation Performance', async () => {
    const startTime = performance.now();
    
    // Generate complex pattern
    const pattern = calculator.generateComplexPattern({
      segments: 12,
      layers: 5,
      radius: 100
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Assert reasonable performance
    expect(duration).toBeLessThan(100); // Should complete within 100ms
    
    // Record metrics
    optimizer.recordDrawCall(pattern.triangles.length / 3);
    const metrics = optimizer.getPerformanceMetrics();

    expect(metrics.averageFrameTime).toBeLessThan(16.67); // Target 60fps
    expect(metrics.cacheEfficiency).toBeGreaterThan(0.8); // 80% cache hit rate
  });

  test('Memory Usage', () => {
    const patterns = [];
    const startHeap = performance.memory?.usedJSHeapSize;

    // Generate multiple patterns
    for (let i = 0; i < 100; i++) {
      patterns.push(calculator.generateComplexPattern({
        segments: 8,
        layers: 3,
        radius: 50
      }));
    }

    const endHeap = performance.memory?.usedJSHeapSize;
    const memoryUsed = endHeap - startHeap;

    // Assert reasonable memory usage
    expect(memoryUsed).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
  });

  test('Cache Performance', () => {
    const pattern = calculator.generateComplexPattern({
      segments: 10,
      layers: 4,
      radius: 75
    });

    // First access - cache miss
    optimizer.cacheGeometry('test-pattern', pattern);
    
    // Second access - should hit cache
    const cached = optimizer.getGeometry('test-pattern');
    
    const metrics = optimizer.getPerformanceMetrics();
    expect(metrics.cacheHits).toBe(1);
    expect(metrics.cacheMisses).toBe(1);
    expect(metrics.cacheEfficiency).toBe(0.5);
  });
});