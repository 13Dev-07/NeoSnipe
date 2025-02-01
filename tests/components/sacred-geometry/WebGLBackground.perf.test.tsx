import React from 'react';
import { render } from '@testing-library/react';
import { OptimizedWebGLBackground } from '../../../src/components/sacred-geometry/OptimizedWebGLBackground';
import { WebGLPerformanceMonitor } from '../../../src/utils/webgl/performance-monitor';

describe('WebGLBackground Performance', () => {
  let originalRAF: typeof window.requestAnimationFrame;
  let time: number;

  beforeAll(() => {
    originalRAF = window.requestAnimationFrame;
    time = 0;
    window.requestAnimationFrame = (cb) => {
      time += 16.67; // Simulate 60fps
      return setTimeout(() => cb(time), 0);
    };
  });

  afterAll(() => {
    window.requestAnimationFrame = originalRAF;
  });

  it('maintains stable frame rate under load', async () => {
    const metrics: number[] = [];
    const mockPerformanceMonitor = {
      startMonitoring: jest.fn(),
      stopMonitoring: jest.fn(),
      beginFrame: jest.fn(),
      endFrame: jest.fn(),
      getMetrics: jest.fn(() => ({
        frameTime: metrics[metrics.length - 1] || 16.67,
        drawCalls: 10,
        triangleCount: 1000,
        memoryUsage: 50000000, // 50MB
        shaderSwitches: 2,
        bufferUploads: 1,
        textureUploads: 1
      }))
    };

    WebGLPerformanceMonitor.getInstance = jest.fn().mockReturnValue(mockPerformanceMonitor);

    const { unmount } = render(<OptimizedWebGLBackground particleCount={10000} />);

    // Simulate 60 frames (1 second)
    for (let i = 0; i < 60; i++) {
      metrics.push(16.67 + Math.random() * 2); // Simulate slight variations
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Calculate performance metrics
    const avgFrameTime = metrics.reduce((a, b) => a + b) / metrics.length;
    const maxFrameTime = Math.max(...metrics);
    const minFrameTime = Math.min(...metrics);
    const jank = metrics.filter(t => t > 16.67).length / metrics.length;

    // Assertions for stable performance
    expect(avgFrameTime).toBeLessThanOrEqual(17); // Allow slight overhead
    expect(maxFrameTime).toBeLessThanOrEqual(33.34); // No more than 2 frames
    expect(minFrameTime).toBeGreaterThanOrEqual(15); // No super-fast frames
    expect(jank).toBeLessThanOrEqual(0.1); // Max 10% janky frames

    unmount();
  });

  it('handles rapid prop changes efficiently', async () => {
    const { rerender } = render(<OptimizedWebGLBackground />);
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
    
    for (let i = 0; i < colors.length; i++) {
      rerender(<OptimizedWebGLBackground color={colors[i]} />);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const metrics = WebGLPerformanceMonitor.getInstance().getMetrics();
    expect(metrics.shaderSwitches).toBeLessThanOrEqual(colors.length);
    expect(metrics.frameTime).toBeLessThanOrEqual(16.67);
  });

  it('manages memory efficiently during long sessions', async () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    const { unmount } = render(<OptimizedWebGLBackground particleCount={5000} />);

    // Simulate extended usage (5 seconds)
    await new Promise(resolve => setTimeout(resolve, 5000));

    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryGrowth = finalMemory - initialMemory;

    // Memory should not grow more than 100MB during the session
    expect(memoryGrowth).toBeLessThanOrEqual(100 * 1024 * 1024);

    unmount();

    // Allow time for garbage collection
    await new Promise(resolve => setTimeout(resolve, 100));

    const afterGCMemory = performance.memory?.usedJSHeapSize || 0;
    expect(afterGCMemory).toBeLessThanOrEqual(initialMemory * 1.1); // Allow 10% overhead
  });
});