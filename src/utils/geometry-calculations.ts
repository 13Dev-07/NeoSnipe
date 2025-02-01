import { GeometryData, Point2D, SacredPattern } from '../types/sacred-geometry';
import { SACRED_RATIOS } from '../shared/constants';

const { PHI, PI } = SACRED_RATIOS;

export class GeometryCalculator {
  private static instance: GeometryCalculator;
  private calculationCache: Map<string, GeometryData>;

  private constructor() {
    this.calculationCache = new Map();
  }

  static getInstance(): GeometryCalculator {
    if (!GeometryCalculator.instance) {
      GeometryCalculator.instance = new GeometryCalculator();
    }
    return GeometryCalculator.instance;
  }

  calculateMetatronsCube(size: number = 1): GeometryData {
    const cacheKey = `metatrons-cube-${size}`;
    if (this.calculationCache.has(cacheKey)) {
      return this.calculationCache.get(cacheKey)!;
    }

    const vertices: Point2D[] = [];
    const indices: number[] = [];
    const centerPoint: Point2D = [0, 0];

    // Calculate vertices for the central hexagon
    for (let i = 0; i < 6; i++) {
      const angle = (i * PI) / 3;
      vertices.push([
        size * Math.cos(angle),
        size * Math.sin(angle)
      ]);
    }

    // Calculate vertices for the inner circles
    for (let i = 0; i < 6; i++) {
      const angle = (i * PI) / 3;
      const radius = size * 0.5;
      vertices.push([
        radius * Math.cos(angle),
        radius * Math.sin(angle)
      ]);
    }

    // Add indices for connections
    for (let i = 0; i < 6; i++) {
      indices.push(i);
      indices.push((i + 1) % 6);
    }

    const geometryData: GeometryData = {
      vertices,
      indices,
      centerPoint,
      size,
      type: 'metatrons-cube'
    };

    this.calculationCache.set(cacheKey, geometryData);
    return geometryData;
  }

  calculateVesicaPiscis(size: number = 1): GeometryData {
    const cacheKey = `vesica-piscis-${size}`;
    if (this.calculationCache.has(cacheKey)) {
      return this.calculationCache.get(cacheKey)!;
    }

    const radius = size / 2;
    const centerDistance = radius;
    const vertices: Point2D[] = [];
    const indices: number[] = [];

    // Calculate vertices for the two circles
    const segments = 64;
    for (let i = 0; i < segments; i++) {
      const angle = (2 * PI * i) / segments;
      
      // Left circle
      vertices.push([
        -centerDistance + radius * Math.cos(angle),
        radius * Math.sin(angle)
      ]);
      
      // Right circle
      vertices.push([
        centerDistance + radius * Math.cos(angle),
        radius * Math.sin(angle)
      ]);
    }

    // Add indices for the circles
    for (let i = 0; i < segments; i++) {
      indices.push(i);
      indices.push((i + 1) % segments);
      indices.push(i + segments);
      indices.push(((i + 1) % segments) + segments);
    }

    const geometryData: GeometryData = {
      vertices,
      indices,
      centerPoint: [0, 0],
      size,
      type: 'vesica-piscis'
    };

    this.calculationCache.set(cacheKey, geometryData);
    return geometryData;
  }

  calculateFlowerOfLife(size: number = 1): GeometryData {
    const cacheKey = `flower-of-life-${size}`;
    if (this.calculationCache.has(cacheKey)) {
      return this.calculationCache.get(cacheKey)!;
    }

    const vertices: Point2D[] = [];
    const indices: number[] = [];
    const centerPoint: Point2D = [0, 0];
    const radius = size / 3;

    // Calculate vertices for central circle
    const segments = 32;
    for (let i = 0; i < segments; i++) {
      const angle = (2 * PI * i) / segments;
      vertices.push([
        radius * Math.cos(angle),
        radius * Math.sin(angle)
      ]);
    }

    // Calculate vertices for surrounding circles
    for (let ring = 0; ring < 2; ring++) {
        const circlesInRing = 6 * ring;
        for (let i = 0; i < circlesInRing; i++) {
            const centerAngle = (2 * PI * i) / circlesInRing;
            const centerRadius = radius * (ring + 1);
            const centerX = centerRadius * Math.cos(centerAngle);
            const centerY = centerRadius * Math.sin(centerAngle);

            for (let j = 0; j < segments; j++) {
                const angle = (2 * PI * j) / segments;
                vertices.push([
                    centerX + radius * Math.cos(angle),
                    centerY + radius * Math.sin(angle)
                ]);
            }
        }
    }

    // Add indices for all circles
    for (let circle = 0; circle < vertices.length / segments; circle++) {
        const offset = circle * segments;
        for (let i = 0; i < segments; i++) {
            indices.push(offset + i);
            indices.push(offset + ((i + 1) % segments));
        }
    }

    const geometryData: GeometryData = {
      vertices,
      indices,
      centerPoint,
      size,
      type: 'flower-of-life'
    };

    this.calculationCache.set(cacheKey, geometryData);
    return geometryData;
  }

  getGeometryForPattern(pattern: SacredPattern, size: number = 1): GeometryData {
    switch (pattern) {
      case 'metatrons-cube':
        return this.calculateMetatronsCube(size);
      case 'vesica-piscis':
        return this.calculateVesicaPiscis(size);
      case 'flower-of-life':
        return this.calculateFlowerOfLife(size);
      default:
        throw new Error(`Unsupported pattern: ${pattern}`);
    }
  }

  clearCache(): void {
    this.calculationCache.clear();
  }
}

export default GeometryCalculator.getInstance();