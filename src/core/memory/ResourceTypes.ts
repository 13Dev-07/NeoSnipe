export enum ResourceType {
  TEXTURE = 'TEXTURE',
  BUFFER = 'BUFFER',
  SHADER = 'SHADER',
  GEOMETRY = 'GEOMETRY',
  MATERIAL = 'MATERIAL'
}

export interface ResourceMetrics {
  memoryUsage: number;
  lastAccessed: number;
  createdAt: number;
  accessCount: number;
}

export interface ResourceLimits {
  maxTextureSize: number;
  maxBufferSize: number;
  maxShaderPrograms: number;
  maxTotalMemory: number;
  maxResourcesPerType: Map<ResourceType, number>;
}