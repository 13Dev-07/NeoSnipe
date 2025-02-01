import { SacredPattern, EnergyFlowConfig, Point2D } from '../types/sacred-geometry';
import { SACRED_RATIOS } from '../shared/constants';

const { PHI, PI } = SACRED_RATIOS;

export class EnergyFlowVisualizer {
  private static instance: EnergyFlowVisualizer;
  private flowPatterns: Map<string, Float32Array>;
  private currentTime: number;

  private constructor() {
    this.flowPatterns = new Map();
    this.currentTime = 0;
  }

  static getInstance(): EnergyFlowVisualizer {
    if (!EnergyFlowVisualizer.instance) {
      EnergyFlowVisualizer.instance = new EnergyFlowVisualizer();
    }
    return EnergyFlowVisualizer.instance;
  }

  calculateEnergyFlow(pattern: SacredPattern, config: EnergyFlowConfig): Float32Array {
    const cacheKey = this.generateCacheKey(pattern, config);
    
    if (this.flowPatterns.has(cacheKey)) {
      return this.flowPatterns.get(cacheKey)!;
    }

    const flowData = this.generateEnergyFlowPattern(pattern, config);
    this.flowPatterns.set(cacheKey, flowData);
    
    return flowData;
  }

  private generateCacheKey(pattern: SacredPattern, config: EnergyFlowConfig): string {
    return `${pattern}-${config.type}-${config.intensity}-${config.frequency}`;
  }

  private generateEnergyFlowPattern(pattern: SacredPattern, config: EnergyFlowConfig): Float32Array {
    const pointCount = Math.floor(PHI * 100); // Number of flow points
    const flowData = new Float32Array(pointCount * 4); // x, y, intensity, rotation

    switch (pattern) {
      case 'metatrons-cube':
        this.generateMetatronsCubeFlow(flowData, config);
        break;
      case 'vesica-piscis':
        this.generateVesicaPiscisFlow(flowData, config);
        break;
      case 'flower-of-life':
        this.generateFlowerOfLifeFlow(flowData, config);
        break;
      default:
        this.generateDefaultFlow(flowData, config);
    }

    return flowData;
  }

  private generateMetatronsCubeFlow(flowData: Float32Array, config: EnergyFlowConfig): void {
    const centerPoints = this.getMetatronsCubeCenters();
    const pointsPerCenter = flowData.length / (4 * centerPoints.length);

    centerPoints.forEach((center, centerIndex) => {
      for (let i = 0; i < pointsPerCenter; i++) {
        const angle = (i / pointsPerCenter) * PI * 2;
        const radius = Math.sin(i / pointsPerCenter * PHI) * config.intensity;
        const idx = (centerIndex * pointsPerCenter + i) * 4;

        flowData[idx] = center[0] + Math.cos(angle) * radius;
        flowData[idx + 1] = center[1] + Math.sin(angle) * radius;
        flowData[idx + 2] = config.intensity * (1 + Math.sin(angle * PHI) * 0.5);
        flowData[idx + 3] = angle + (centerIndex * PI / 3);
      }
    });
  }

  private generateVesicaPiscisFlow(flowData: Float32Array, config: EnergyFlowConfig): void {
    const vesicaPoints = this.getVesicaPiscisCenters();
    
    for (let i = 0; i < flowData.length / 4; i++) {
      const t = i / (flowData.length / 4);
      const lemniscateX = Math.sin(t * PI * 2) / (1 + Math.pow(Math.cos(t * PI * 2), 2));
      const lemniscateY = Math.sin(t * PI * 2) * Math.cos(t * PI * 2) / (1 + Math.pow(Math.cos(t * PI * 2), 2));

      flowData[i * 4] = lemniscateX * config.intensity;
      flowData[i * 4 + 1] = lemniscateY * config.intensity;
      flowData[i * 4 + 2] = config.intensity * (1 + Math.sin(t * PHI) * 0.5);
      flowData[i * 4 + 3] = Math.atan2(lemniscateY, lemniscateX);
    }
  }

  private generateFlowerOfLifeFlow(flowData: Float32Array, config: EnergyFlowConfig): void {
    const centers = this.getFlowerOfLifeCenters();
    
    for (let i = 0; i < flowData.length / 4; i++) {
      const t = i / (flowData.length / 4);
      const spiralR = Math.pow(PHI, t * 2) * config.intensity;
      const spiralTheta = t * PI * 2 * PHI;

      flowData[i * 4] = spiralR * Math.cos(spiralTheta);
      flowData[i * 4 + 1] = spiralR * Math.sin(spiralTheta);
      flowData[i * 4 + 2] = config.intensity * (1 + Math.cos(spiralTheta) * 0.5);
      flowData[i * 4 + 3] = spiralTheta;
    }
  }

  private generateDefaultFlow(flowData: Float32Array, config: EnergyFlowConfig): void {
    for (let i = 0; i < flowData.length / 4; i++) {
      const t = i / (flowData.length / 4);
      flowData[i * 4] = Math.cos(t * PI * 2) * config.intensity;
      flowData[i * 4 + 1] = Math.sin(t * PI * 2) * config.intensity;
      flowData[i * 4 + 2] = config.intensity;
      flowData[i * 4 + 3] = t * PI * 2;
    }
  }

  private getMetatronsCubeCenters(): Point2D[] {
    const centers: Point2D[] = [[0, 0]];
    const radius = 1;

    for (let i = 0; i < 6; i++) {
      const angle = i * PI / 3;
      centers.push([
        radius * Math.cos(angle),
        radius * Math.sin(angle)
      ]);
    }

    return centers;
  }

  private getVesicaPiscisCenters(): Point2D[] {
    return [
      [-0.5, 0],
      [0.5, 0]
    ];
  }

  private getFlowerOfLifeCenters(): Point2D[] {
    const centers: Point2D[] = [[0, 0]];
    const radius = 1;

    for (let i = 0; i < 6; i++) {
      const angle = i * PI / 3;
      centers.push([
        radius * Math.cos(angle),
        radius * Math.sin(angle)
      ]);
    }

    return centers;
  }

  update(deltaTime: number): void {
    this.currentTime += deltaTime;
    // Update flow animations based on time
  }

  clearCache(): void {
    this.flowPatterns.clear();
  }
}

export default EnergyFlowVisualizer.getInstance();