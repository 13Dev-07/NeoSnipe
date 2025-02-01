import { GeometryData, GeometryPattern, PatternType } from '../../types/sacred-geometry';
import { PHI, SQRT_PHI, TAU } from './geometry';
import { generateMetatronPoints, METATRON_VERTEX_SHADER, METATRON_FRAGMENT_SHADER } from './metatron';
import { generatePentagram, generateFibonacciSpiral, generateTorusPattern } from './new-patterns';

export const generatePattern = (type: PatternType, scale: number = 1.0): GeometryPattern => {
  switch (type) {
    case 'flowerOfLife':
      return generateFlowerOfLife(scale);
    case 'metatronsCube':
      return generateMetatronsCube(scale);
    case 'vesicaPiscis':
      return generateVesicaPiscis(scale);
    case 'sriYantra':
      return generateSriYantra(scale);
    case 'pentagram':
      return generatePentagram(scale);
    case 'fibonacci':
      return generateFibonacciSpiral(scale);
    case 'torus':
      return generateTorusPattern(scale);
    default:
      throw new Error(`Unsupported pattern type: ${type}`);
  }
};

const generateFlowerOfLife = (scale: number): GeometryPattern => {
  const vertices: number[] = [];
  const indices: number[] = [];
  const textureCoords: number[] = [];
  
  // Generate Flower of Life geometry
  const centerPoints = generateFlowerOfLifeCenters(scale);
  centerPoints.forEach((center, i) => {
    const circleVertices = generateCircle(center[0], center[1], 0.2 * scale, 32);
    const baseIndex = vertices.length / 2;
    
    vertices.push(...circleVertices);
    for (let j = 0; j < circleVertices.length / 2 - 1; j++) {
      indices.push(baseIndex + j, baseIndex + j + 1);
    }
    
    // Add texture coordinates
    for (let j = 0; j < circleVertices.length / 2; j++) {
      const angle = (j / (circleVertices.length / 2)) * Math.PI * 2;
      textureCoords.push(0.5 + Math.cos(angle) * 0.5, 0.5 + Math.sin(angle) * 0.5);
    }
  });

  return {
    type: 'flowerOfLife',
    metrics: {
      harmonicResonance: 0.95,
      symmetry: 1.0,
      complexity: 1.2,
      ratios: [PHI, SQRT_PHI]
    },
    visualization: {
      vertices,
      indices,
      textureCoords
    },
    shaderConfig: {
      vertexShader: FLOWER_VERTEX_SHADER,
      fragmentShader: FLOWER_FRAGMENT_SHADER,
      uniforms: {
        uScale: scale,
        uRotation: 0,
        uTime: 0
      }
    }
  };
};

const generateMetatronsCube = (scale: number): GeometryPattern => {
  const vertices: number[] = [];
  const indices: number[] = [];
  const textureCoords: number[] = [];

  // Generate center point
  const center: number[] = [0, 0];
  
  // Generate the 13 main points of Metatron's Cube
  const points = generateMetatronPoints(scale);
  
  // Generate the connecting lines
  points.forEach((point, i) => {
    vertices.push(...point);
    textureCoords.push(0.5 + point[0] / (2 * scale), 0.5 + point[1] / (2 * scale));
    
    // Connect each point to every other point
    for (let j = i + 1; j < points.length; j++) {
      indices.push(i, j);
    }
  });

  // Add circles at each vertex
  points.forEach((point, i) => {
    const circleVerts = generateCircle(point[0], point[1], 0.05 * scale, 16);
    const baseIndex = vertices.length / 2;
    
    vertices.push(...circleVerts);
    for (let j = 0; j < circleVerts.length / 2 - 1; j++) {
      indices.push(baseIndex + j, baseIndex + j + 1);
    }
    
    // Add texture coordinates for circles
    for (let j = 0; j < circleVerts.length / 2; j++) {
      const angle = (j / (circleVerts.length / 2)) * TAU;
      textureCoords.push(
        0.5 + (point[0] + Math.cos(angle) * 0.05 * scale) / (2 * scale),
        0.5 + (point[1] + Math.sin(angle) * 0.05 * scale) / (2 * scale)
      );
    }
  });

  return {
    type: 'metatronsCube',
    metrics: {
      harmonicResonance: 0.98,
      symmetry: 1.0,
      complexity: 1.8,
      ratios: [PHI, SQRT_PHI, Math.sqrt(3)]
    },
    visualization: {
      vertices,
      indices,
      textureCoords
    },
    shaderConfig: {
      vertexShader: METATRON_VERTEX_SHADER,
      fragmentShader: METATRON_FRAGMENT_SHADER,
      uniforms: {
        uScale: scale,
        uRotation: 0,
        uTime: 0
      }
    }
  };
};

const generateVesicaPiscis = (scale: number): GeometryPattern => {
  const vertices: number[] = [];
  const indices: number[] = [];
  const textureCoords: number[] = [];
  
  // Generate two overlapping circles
  const radius = 0.4 * scale;
  const offset = radius * VESICA_PISCIS_OVERLAP;
  
  // First circle
  const circle1 = generateCircle(-offset, 0, radius, 64);
  const baseIndex1 = vertices.length / 2;
  vertices.push(...circle1);
  
  // Second circle
  const circle2 = generateCircle(offset, 0, radius, 64);
  const baseIndex2 = vertices.length / 2;
  vertices.push(...circle2);
  
  // Generate indices for both circles
  for (let i = 0; i < 64; i++) {
    indices.push(
      baseIndex1 + i,
      baseIndex1 + ((i + 1) % 64),
      baseIndex2 + i,
      baseIndex2 + ((i + 1) % 64)
    );
  }
  
  // Add texture coordinates
  for (let i = 0; i <= 128; i++) {
    const angle = (i / 64) * TAU;
    textureCoords.push(
      0.5 + (Math.cos(angle) * 0.5),
      0.5 + (Math.sin(angle) * 0.5)
    );
  }

  return {
    type: 'vesicaPiscis',
    metrics: {
      harmonicResonance: 0.92,
      symmetry: 1.0,
      complexity: 1.1,
      ratios: [Math.sqrt(3), PHI]
    },
    visualization: {
      vertices,
      indices,
      textureCoords
    },
    shaderConfig: {
      vertexShader: VESICA_VERTEX_SHADER,
      fragmentShader: VESICA_FRAGMENT_SHADER,
      uniforms: {
        uScale: scale,
        uRotation: 0,
        uTime: 0
      }
    }
  };
};

const generateSriYantra = (scale: number): GeometryPattern => {
  const vertices: number[] = [];
  const indices: number[] = [];
  const textureCoords: number[] = [];
  
  // Generate Sri Yantra's nine interlocking triangles
  const center: number[] = [0, 0];
  const baseRadius = 0.4 * scale;
  
  // Generate the triangles
  for (let i = 0; i < SRI_YANTRA_TRIANGLES; i++) {
    const angle = (i * TAU) / SRI_YANTRA_TRIANGLES;
    const radius = baseRadius * (1 + 0.2 * Math.sin(i * PHI));
    
    // Generate triangle points
    const p1 = [
      center[0] + Math.cos(angle) * radius,
      center[1] + Math.sin(angle) * radius
    ];
    const p2 = [
      center[0] + Math.cos(angle + TAU/3) * radius,
      center[1] + Math.sin(angle + TAU/3) * radius
    ];
    const p3 = [
      center[0] + Math.cos(angle + 2*TAU/3) * radius,
      center[1] + Math.sin(angle + 2*TAU/3) * radius
    ];
    
    // Add vertices
    const baseIndex = vertices.length / 2;
    vertices.push(
      ...p1, ...p2, ...p3
    );
    
    // Add indices
    indices.push(
      baseIndex, baseIndex + 1,
      baseIndex + 1, baseIndex + 2,
      baseIndex + 2, baseIndex
    );
    
    // Add texture coordinates
    textureCoords.push(
      0.5 + p1[0]/(2*scale), 0.5 + p1[1]/(2*scale),
      0.5 + p2[0]/(2*scale), 0.5 + p2[1]/(2*scale),
      0.5 + p3[0]/(2*scale), 0.5 + p3[1]/(2*scale)
    );
  }

  return {
    type: 'sriYantra',
    metrics: {
      harmonicResonance: 0.96,
      symmetry: 0.98,
      complexity: 1.6,
      ratios: [PHI, Math.sqrt(3), Math.sqrt(2)]
    },
    visualization: {
      vertices,
      indices,
      textureCoords
    },
    shaderConfig: {
      vertexShader: SRI_YANTRA_VERTEX_SHADER,
      fragmentShader: SRI_YANTRA_FRAGMENT_SHADER,
      uniforms: {
        uScale: scale,
        uRotation: 0,
        uTime: 0
      }
    }
  };
};

// Helper functions
const generateCircle = (centerX: number, centerY: number, radius: number, segments: number): number[] => {
  const vertices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * TAU;
    vertices.push(
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius
    );
  }
  return vertices;
};

const generateFlowerOfLifeCenters = (scale: number): number[][] => {
  const centers: number[][] = [[0, 0]];
  const hexRadius = 0.4 * scale;
  
  for (let ring = 1; ring <= 2; ring++) {
    for (let i = 0; i < 6 * ring; i++) {
      const angle = (i / (6 * ring)) * TAU;
      centers.push([
        Math.cos(angle) * hexRadius * ring,
        Math.sin(angle) * hexRadius * ring
      ]);
    }
  }
  
  return centers;
};

// Shader constants
const FLOWER_VERTEX_SHADER = `
  attribute vec4 aPosition;
  attribute vec2 aTexCoord;
  uniform float uScale;
  uniform float uRotation;
  varying vec2 vTexCoord;
  
  void main() {
    float c = cos(uRotation);
    float s = sin(uRotation);
    mat2 rotation = mat2(c, -s, s, c);
    vec2 rotated = rotation * aPosition.xy;
    gl_Position = vec4(rotated * uScale, 0.0, 1.0);
    vTexCoord = aTexCoord;
  }
`;

const FLOWER_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vTexCoord;
  uniform float uTime;
  
  void main() {
    vec2 center = vec2(0.5);
    float d = length(vTexCoord - center);
    float pulse = 0.5 + 0.5 * sin(uTime * 2.0);
    vec3 color = vec3(0.7, 0.3, 1.0) * (1.0 - d) * pulse;
    gl_FragColor = vec4(color, 1.0);
  }
`;