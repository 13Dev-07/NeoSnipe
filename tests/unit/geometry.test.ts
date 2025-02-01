import { GeometryCalculator } from '../../src/utils/geometry-calculations';
import { SACRED_RATIOS } from '../../src/shared/constants';

const { PHI, PI } = SACRED_RATIOS;

describe('GeometryCalculator', () => {
  let calculator: GeometryCalculator;

  beforeEach(() => {
    calculator = GeometryCalculator.getInstance();
    calculator.clearCache();
  });

  describe('calculateMetatronsCube', () => {
    it('should generate correct number of vertices for default size', () => {
      const result = calculator.calculateMetatronsCube();
      expect(result.vertices.length).toBe(12); // 6 for hexagon + 6 for inner circles
      expect(result.type).toBe('metatrons-cube');
    });

    it('should scale vertices according to size parameter', () => {
      const size = 2;
      const result = calculator.calculateMetatronsCube(size);
      const firstVertex = result.vertices[0];
      expect(Math.abs(Math.sqrt(firstVertex[0] * firstVertex[0] + firstVertex[1] * firstVertex[1]) - size)).toBeLessThan(0.0001);
    });

    it('should use caching for repeated calculations', () => {
      const spy = jest.spyOn(calculator as any, 'calculationCache', 'get');
      const first = calculator.calculateMetatronsCube();
      const second = calculator.calculateMetatronsCube();
      expect(spy).toHaveBeenCalled();
      expect(first).toBe(second);
    });
  });

  describe('calculateVesicaPiscis', () => {
    it('should generate correct geometry for vesica piscis', () => {
      const result = calculator.calculateVesicaPiscis();
      expect(result.type).toBe('vesica-piscis');
      expect(result.vertices.length).toBe(128); // 64 vertices per circle
    });

    it('should maintain correct proportions based on golden ratio', () => {
      const result = calculator.calculateVesicaPiscis();
      const height = Math.abs(result.vertices[0][1] - result.vertices[32][1]);
      const width = Math.abs(result.vertices[16][0] - result.vertices[48][0]);
      expect(height / width).toBeCloseTo(Math.sqrt(3), 3);
    });
  });

  describe('calculateFlowerOfLife', () => {
    it('should generate correct number of circles', () => {
      const result = calculator.calculateFlowerOfLife();
      const numCircles = result.vertices.length / 32; // 32 vertices per circle
      expect(numCircles).toBe(7); // Central circle + 6 surrounding
    });

    it('should maintain symmetry in circle placement', () => {
      const result = calculator.calculateFlowerOfLife();
      const centerDists = [];
      
      // Calculate distances from center for first point of each circle
      for (let i = 1; i < 7; i++) {
        const vertex = result.vertices[i * 32];
        const dist = Math.sqrt(vertex[0] * vertex[0] + vertex[1] * vertex[1]);
        centerDists.push(dist);
      }

      // All distances should be equal
      const firstDist = centerDists[0];
      centerDists.forEach(dist => {
        expect(Math.abs(dist - firstDist)).toBeLessThan(0.0001);
      });
    });
  });

  describe('getGeometryForPattern', () => {
    it('should return correct geometry type for each pattern', () => {
      expect(calculator.getGeometryForPattern('metatrons-cube').type).toBe('metatrons-cube');
      expect(calculator.getGeometryForPattern('vesica-piscis').type).toBe('vesica-piscis');
      expect(calculator.getGeometryForPattern('flower-of-life').type).toBe('flower-of-life');
    });

    it('should throw error for invalid pattern', () => {
      expect(() => {
        calculator.getGeometryForPattern('invalid-pattern' as any);
      }).toThrow();
    });
  });
});