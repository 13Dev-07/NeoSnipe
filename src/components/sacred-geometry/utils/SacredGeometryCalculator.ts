import { SACRED_RATIOS } from '../../../shared/constants';

const PHI = SACRED_RATIOS.PHI;

/**
 * Sacred Geometry Calculator
 * Implements mathematical foundations for sacred geometry calculations using
 * golden ratio, Fibonacci sequences, and other sacred number systems.
 */
export class SacredGeometryCalculator {
  // Fibonacci sequence cache for efficient calculations
  private static fibonacciCache: Map<number, number> = new Map();

  /**
   * Calculates Fibonacci number at given position using recursive golden ratio method
   * @param n Position in sequence
   * @returns Fibonacci number
   */
  static fibonacci(n: number): number {
    if (n <= 1) return n;
    
    if (this.fibonacciCache.has(n)) {
      return this.fibonacciCache.get(n)!;
    }
    
    const result = this.fibonacci(n - 1) + this.fibonacci(n - 2);
    this.fibonacciCache.set(n, result);
    return result;
  }

  /**
   * Generates Fibonacci sequence up to n numbers
   * @param count Number of sequence elements to generate
   * @returns Array of Fibonacci numbers
   */
  static fibonacciSequence(count: number): number[] {
    return Array.from({ length: count }, (_, i) => this.fibonacci(i));
  }

  /**
   * Calculates golden ratio powers for sacred proportions
   * @param power Power to raise PHI to
   * @returns PHI^power
   */
  static goldenRatioPower(power: number): number {
    return Math.pow(PHI, power);
  }

  /**
   * Calculates Vesica Piscis dimensions and properties
   * @param radius Radius of the circles
   * @returns Object containing Vesica Piscis calculations
   */
  static calculateVesicaPiscis(radius: number) {
    // Height = r√3
    const height = radius * Math.sqrt(3);
    
    // Width = 2r
    const width = radius * 2;
    
    // Area = r²(π/2)
    const area = Math.pow(radius, 2) * (Math.PI / 2);
    
    // Center distance = r
    const centerDistance = radius;
    
    // Ratio = √3 (significant in sacred geometry)
    const ratio = Math.sqrt(3);
    
    // Arc length = πr/3
    const arcLength = (Math.PI * radius) / 3;
    
    // Perimeter = 4r(π/6)
    const perimeter = 4 * radius * (Math.PI / 6);

    return {
      height,
      width,
      area,
      centerDistance,
      ratio,
      arcLength,
      perimeter,
      // Sacred proportions
      goldenRatioRelation: height / width, // Approximates PHI
      divineRelation: perimeter / height // Sacred ratio
    };
  }

  /**
   * Calculates sacred angle using golden ratio
   * @param angle Base angle in radians
   * @returns Sacred angle in radians
   */
  static sacredAngle(angle: number): number {
    return angle * (1 / PHI);
  }

  /**
   * Calculates sacred proportion for geometry scaling
   * @param base Base dimension
   * @param level Sacred level (affects PHI power)
   * @returns Scaled dimension
   */
  static sacredProportion(base: number, level: number = 1): number {
    return base * this.goldenRatioPower(level);
  }

  /**
   * Generates harmonic ratios based on sacred numbers
   * @param fundamentalFrequency Base frequency
   * @param harmonicCount Number of harmonics to generate
   * @returns Array of harmonic frequencies
   */
  static harmonicRatios(fundamentalFrequency: number, harmonicCount: number): number[] {
    return Array.from(
      { length: harmonicCount },
      (_, i) => fundamentalFrequency * this.goldenRatioPower(i)
    );
  }

  /**
   * Calculates sacred wave pattern using golden ratio
   * @param time Current time
   * @param frequency Base frequency
   * @param amplitude Wave amplitude
   * @returns Wave value
   */
  static sacredWave(time: number, frequency: number = 1, amplitude: number = 1): number {
    return amplitude * Math.sin(time * frequency * PHI) * 0.5 + 0.5;
  }

  /**
   * Interpolates between values using sacred curve
   * @param start Start value
   * @param end End value
   * @param t Progress (0-1)
   * @returns Interpolated value
   */
  static sacredInterpolation(start: number, end: number, t: number): number {
    const phi = t * Math.PI * 2;
    return start + (end - start) * (Math.sin(phi / PHI) * 0.5 + 0.5);
  }

  /**
   * Calculates vertex positions for sacred polygons
   * @param sides Number of sides
   * @param radius Radius of circumscribed circle
   * @returns Array of vertex coordinates [x, y]
   */
  static sacredPolygonVertices(sides: number, radius: number): [number, number][] {
    const vertices: [number, number][] = [];
    const angleStep = (Math.PI * 2) / sides;
    
    for (let i = 0; i < sides; i++) {
      const angle = this.sacredAngle(angleStep * i);
      vertices.push([
        radius * Math.cos(angle),
        radius * Math.sin(angle)
      ]);
    }
    
    return vertices;
  }

  /**
   * Maps a value to sacred proportions
   * @param value Input value
   * @param inMin Input range minimum
   * @param inMax Input range maximum
   * @param outMin Output range minimum
   * @param outMax Output range maximum
   * @returns Mapped value with sacred proportions
   */
  static sacredMap(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
    const t = (value - inMin) / (inMax - inMin);
    const sacred = this.sacredInterpolation(0, 1, t);
    return outMin + (outMax - outMin) * sacred;
  }
}