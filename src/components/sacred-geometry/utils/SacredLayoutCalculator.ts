import { SACRED_RATIOS } from '../../../shared/constants';
import { SacredGeometryCalculator } from './SacredGeometryCalculator';

const PHI = SACRED_RATIOS.PHI;

/**
 * Sacred Layout Calculator
 * Implements advanced layout calculations using sacred geometry principles,
 * golden ratio relationships, and harmonic proportions.
 */
export class SacredLayoutCalculator {
  /**
   * Calculates golden ratio based grid system
   * @param containerWidth Total width available
   * @param containerHeight Total height available
   * @param divisions Number of divisions (default Fibonacci numbers)
   * @returns Grid dimensions and sacred points
   */
  static calculateSacredGrid(
    containerWidth: number,
    containerHeight: number,
    divisions: number = 8
  ) {
    const fibonacci = SacredGeometryCalculator.fibonacciSequence(divisions);
    const goldenWidth = containerWidth / PHI;
    const goldenHeight = containerHeight / PHI;

    // Calculate golden sections
    const sections = {
      horizontal: [] as number[],
      vertical: [] as number[],
      intersections: [] as Array<[number, number]>
    };

    // Create horizontal golden sections
    for (let i = 1; i < divisions; i++) {
      const ratio = fibonacci[i] / fibonacci[divisions - 1];
      const position = containerHeight * ratio;
      sections.horizontal.push(position);
    }

    // Create vertical golden sections
    for (let i = 1; i < divisions; i++) {
      const ratio = fibonacci[i] / fibonacci[divisions - 1];
      const position = containerWidth * ratio;
      sections.vertical.push(position);
    }

    // Calculate sacred intersections
    sections.horizontal.forEach(y => {
      sections.vertical.forEach(x => {
        sections.intersections.push([x, y]);
      });
    });

    return {
      mainSection: {
        width: goldenWidth,
        height: goldenHeight
      },
      complementarySection: {
        width: containerWidth - goldenWidth,
        height: containerHeight - goldenHeight
      },
      grid: sections,
      phi: PHI
    };
  }

  /**
   * Calculates harmonic proportions for layout elements
   * @param baseSize Base size for calculations
   * @param harmonicLevels Number of harmonic levels to generate
   * @returns Array of harmonic sizes
   */
  static calculateHarmonicProportions(baseSize: number, harmonicLevels: number = 7) {
    const harmonics = [];
    const phi = PHI;

    // Generate harmonic series using sacred number relationships
    for (let i = -harmonicLevels; i <= harmonicLevels; i++) {
      const harmonic = baseSize * Math.pow(phi, i / harmonicLevels);
      harmonics.push(harmonic);
    }

    return {
      sizes: harmonics,
      primary: baseSize * phi,
      secondary: baseSize / phi,
      tertiary: baseSize / (phi * phi)
    };
  }

  /**
   * Generates sacred number sequence for rhythmic spacing
   * @param baseSpacing Base spacing value
   * @param count Number of values to generate
   * @returns Array of sacred spacing values
   */
  static generateSacredSpacing(baseSpacing: number, count: number = 8) {
    const spacing = [];
    const fibonacci = SacredGeometryCalculator.fibonacciSequence(count + 1);

    // Create spacing sequence using Fibonacci and phi relationships
    for (let i = 0; i < count; i++) {
      const fibonacciRatio = fibonacci[i + 1] / fibonacci[i];
      const phiRatio = Math.pow(PHI, (i - count / 2) / count);
      spacing.push(baseSpacing * fibonacciRatio * phiRatio);
    }

    return {
      sequence: spacing,
      baseUnit: baseSpacing,
      goldenUnit: baseSpacing * PHI
    };
  }

  /**
   * Calculates sacred proportions for typography
   * @param baseFontSize Base font size
   * @returns Typography scale using sacred ratios
   */
  static calculateSacredTypography(baseFontSize: number) {
    const scale = [];
    const fibonacci = SacredGeometryCalculator.fibonacciSequence(8);

    // Generate typography scale using sacred proportions
    for (let i = 0; i < fibonacci.length; i++) {
      const size = baseFontSize * (fibonacci[i] / fibonacci[3]); // Normalize to base size
      scale.push(size);
    }

    return {
      scale,
      body: baseFontSize,
      title: baseFontSize * PHI,
      subtitle: baseFontSize * Math.sqrt(PHI),
      small: baseFontSize / PHI,
      lineHeight: PHI * 1.5, // Golden ratio based line height
      letterSpacing: baseFontSize * 0.05 * PHI // Sacred letter spacing
    };
  }

  /**
   * Calculates sacred color harmony ratios
   * @param baseHue Base hue value (0-360)
   * @returns Harmonic color values
   */
  static calculateSacredColorHarmony(baseHue: number) {
    const harmony = [];
    const goldenAngle = 360 / (PHI * PHI); // Sacred angle for color harmony

    // Generate harmonic colors using golden angle
    for (let i = 0; i < 5; i++) {
      const hue = (baseHue + goldenAngle * i) % 360;
      harmony.push(hue);
    }

    return {
      primary: baseHue,
      harmony,
      complement: (baseHue + 180) % 360,
      triad: [
        baseHue,
        (baseHue + 120) % 360,
        (baseHue + 240) % 360
      ]
    };
  }

  /**
   * Calculates sacred animation timing
   * @param baseDuration Base duration in milliseconds
   * @returns Object with harmonic timing values
   */
  static calculateSacredTiming(baseDuration: number) {
    return {
      fast: baseDuration / PHI,
      normal: baseDuration,
      slow: baseDuration * PHI,
      veryFast: baseDuration / (PHI * PHI),
      verySlow: baseDuration * PHI * PHI,
      transition: {
        duration: baseDuration,
        delay: baseDuration / PHI,
        stagger: baseDuration / (PHI * PHI)
      }
    };
  }

  /**
   * Calculates responsive sacred breakpoints
   * @param baseWidth Base width in pixels
   * @returns Object with responsive breakpoints using sacred ratios
   */
  static calculateSacredBreakpoints(baseWidth: number) {
    return {
      xs: baseWidth / (PHI * PHI),
      sm: baseWidth / PHI,
      md: baseWidth,
      lg: baseWidth * PHI,
      xl: baseWidth * PHI * PHI,
      spacing: {
        compact: baseWidth / (PHI * PHI * PHI),
        normal: baseWidth / (PHI * PHI),
        comfortable: baseWidth / PHI
      }
    };
  }
}