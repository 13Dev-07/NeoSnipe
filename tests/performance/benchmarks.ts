import { PerformanceOptimizer } from '../../src/utils/performance-optimizer';
import { GeometryCalculator } from '../../src/utils/geometry-calculations';
import { mockWebGL2Context } from '../mocks/webgl';
import { performance } from 'perf_hooks';

describe('Performance Benchmarks', () => {
  let gl: WebGL2RenderingContext;
  let optimizer: PerformanceOptimizer;
  let geometryCalculator: GeometryCalculator;

  beforeEach(() => {
    gl = mockWebGL2Context();
    optimizer = new PerformanceOptimizer(gl);
    geometryCalculator = GeometryCalculator.getInstance();
  });

  afterEach(() => {
    optimizer.dispose();
  });

  describe('Geometry Calculations', () => {
    it('should calculate Metatron\'s Cube within performance budget', () => {
      const start = performance.now();
      const result = geometryCalculator.calculateMetatronsCube();
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(16.67); // Target: 60fps frame budget
      expect(result).toBeDefined();
    });

    it('should benefit from geometry caching', () => {
      const uncachedStart = performance.now();
      geometryCalculator.calculateMetatronsCube();
      const uncachedDuration = performance.now() - uncachedStart;

      const cachedStart = performance.now();
      geometryCalculator.calculateMetatronsCube();
      const cachedDuration = performance.now() - cachedStart;

      expect(cachedDuration).toBeLessThan(uncachedDuration * 0.1);
    });
  });

  describe('Shader Compilation', () => {
    it('should compile shaders within acceptable time', () => {
      const shaderCode = `
        #version 300 es
        precision highp float;
        uniform float time;
        out vec4 fragColor;
        void main() {
          fragColor = vec4(sin(time), cos(time), 0.5, 1.0);
        }
      `;

      const start = performance.now();
      const shader = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(shader, shaderCode);
      gl.compileShader(shader);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100); // Shader compilation budget
      expect(gl.getShaderParameter(shader, gl.COMPILE_STATUS)).toBe(true);
    });
  });

  describe('Memory Usage', () => {
    it('should maintain stable memory usage during pattern transitions', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Simulate pattern transitions
      for (let i = 0; i < 100; i++) {
        geometryCalculator.calculateMetatronsCube();
        geometryCalculator.calculateVesicaPiscis();
        geometryCalculator.calculateFlowerOfLife();
      }

      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal due to caching
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB limit
    });
  });

  describe('Rendering Performance', () => {
    it('should maintain target frame rate with multiple patterns', () => {
      const frameMetrics: number[] = [];
      const targetFPS = 60;
      const targetFrameTime = 1000 / targetFPS;

      // Simulate 60 frames of rendering
      for (let i = 0; i < 60; i++) {
        const frameStart = performance.now();
        
        optimizer.beginFrame();
        // Simulate rendering operations
        optimizer.recordDrawCall(1000); // Simulate 1000 triangles
        optimizer.endFrame();

        const frameDuration = performance.now() - frameStart;
        frameMetrics.push(frameDuration);
      }

      const averageFrameTime = frameMetrics.reduce((a, b) => a + b) / frameMetrics.length;
      expect(averageFrameTime).toBeLessThan(targetFrameTime);
    });
  });
});