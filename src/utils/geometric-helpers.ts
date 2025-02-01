import { SACRED_RATIOS, GEOMETRY_CONFIG } from '../shared/constants';

export const createSacredGeometryPath = (type: string, size: number): string => {
  switch (type) {
    case 'hexagon':
      return createPolygonPath(6, size);
    case 'pentagon':
      return createPolygonPath(5, size);
    case 'octagon':
      return createPolygonPath(8, size);
    case 'triangle':
      return createPolygonPath(3, size);
    case 'vesica':
      return createVesicaPiscis(size);
    case 'flower':
      return createFlowerOfLife(size);
    default:
      return createPolygonPath(6, size);
  }
};

export const createPolygonPath = (sides: number, radius: number): string => {
  const angleStep = (Math.PI * 2) / sides;
  const points: [number, number][] = [];

  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep - Math.PI / 2; // Start at top
    points.push([
      radius * Math.cos(angle),
      radius * Math.sin(angle)
    ]);
  }

  return `M ${points[0][0]},${points[0][1]} ` +
    points.slice(1).map(p => `L ${p[0]},${p[1]} `).join('') +
    'Z';
};

export const createVesicaPiscis = (size: number): string => {
  const r = size / 2;
  const h = r * Math.sqrt(3);
  
  return `
    M ${-r},0
    A ${r},${r} 0 0,1 ${r},0
    A ${r},${r} 0 0,1 ${-r},0
    Z
    M 0,${-h/2}
    A ${r},${r} 0 0,1 0,${h/2}
    A ${r},${r} 0 0,1 0,${-h/2}
    Z
  `;
};

export const createFlowerOfLife = (size: number): string => {
  const r = size / 4;
  let path = '';

  // Center circle
  path += `M ${r},0 A ${r},${r} 0 1,0 ${-r},0 A ${r},${r} 0 1,0 ${r},0 `;

  // Surrounding circles
  for (let i = 0; i < GEOMETRY_CONFIG.FLOWER_OF_LIFE.CIRCLES; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    path += `M ${x + r},${y} A ${r},${r} 0 1,0 ${x - r},${y} A ${r},${r} 0 1,0 ${x + r},${y} `;
  }

  return path;
};

export const calculateGoldenSpiral = (turns: number, scale: number = 1): [number, number][] => {
  const points: [number, number][] = [];
  const goldenAngle = SACRED_RATIOS.GOLDEN_ANGLE;
  
  for (let i = 0; i < turns * 360; i++) {
    const angle = i * (goldenAngle / 180 * Math.PI);
    const radius = scale * Math.pow(SACRED_RATIOS.PHI, angle / (2 * Math.PI));
    points.push([
      radius * Math.cos(angle),
      radius * Math.sin(angle)
    ]);
  }
  
  return points;
};

export const calculateHarmonicResonance = (
  frequency: number,
  amplitude: number,
  time: number
): number => {
  const phi = SACRED_RATIOS.PHI;
  return amplitude * Math.sin(2 * Math.PI * frequency * time * phi);
};

export const createSacredGrid = (
  width: number,
  height: number,
  cellSize: number = 50
): [number, number][] => {
  const points: [number, number][] = [];
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const phi = SACRED_RATIOS.PHI;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = (i + 0.5) * cellSize * phi;
      const y = (j + 0.5) * cellSize * phi;
      points.push([x - width/2, y - height/2]);
    }
  }

  return points;
};

export const normalizeGeometricValue = (
  value: number,
  min: number,
  max: number
): number => {
  const phi = SACRED_RATIOS.PHI;
  const normalized = (value - min) / (max - min);
  return Math.pow(normalized, 1/phi);
};

export const calculateEnergyField = (
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  intensity: number
): number => {
  const distance = Math.sqrt(
    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
  );
  const phi = SACRED_RATIOS.PHI;
  return intensity * Math.exp(-distance / (100 * phi));
};