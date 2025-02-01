import { ResourceType, ResourceLimits, ResourceMetrics } from './ResourceTypes';
import { ResourcePool, PooledResource } from './ResourcePool';
import { ErrorHandler } from '../error/ErrorHandler';
import { ErrorType } from '../error/ErrorTypes';

export class ResourceManager {
  private pools: Map<ResourceType, ResourcePool<any>> = new Map();
  private limits: ResourceLimits;
  private errorHandler: ErrorHandler;
  private totalMemoryUsage: number = 0;

  constructor(limits: ResourceLimits, errorHandler: ErrorHandler) {
    this.limits = limits;
    this.errorHandler = errorHandler;
    this.initializePools();
  }

  private initializePools(): void {
    // Initialize pools for each resource type with appropriate creation/destruction functions
    this.initializePool(ResourceType.TEXTURE, 
      () => ({}), // Placeholder for actual texture creation
      (resource) => { /* Texture cleanup */ });
    
    this.initializePool(ResourceType.BUFFER,
      () => ({}), // Placeholder for buffer creation
      (resource) => { /* Buffer cleanup */ });
    
    this.initializePool(ResourceType.SHADER,
      () => ({}), // Placeholder for shader creation
      (resource) => { /* Shader cleanup */ });
  }

  private initializePool<T>(
    type: ResourceType,
    createFn: () => T,
    destroyFn: (resource: T) => void
  ): void {
    this.pools.set(type, new ResourcePool<T>(type, createFn, destroyFn));
  }

  async acquireResource<T>(type: ResourceType): Promise<PooledResource<T>> {
    const pool = this.pools.get(type) as ResourcePool<T>;
    if (!pool) {
      throw new Error(`No pool available for resource type: ${type}`);
    }

    try {
      this.validateResourceLimits(type);
      const resource = pool.acquire();
      await this.updateMemoryUsage();
      return resource;
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        type: ErrorType.RESOURCE_ERROR,
        context: { resourceType: type }
      });
      throw error;
    }
  }

  releaseResource(type: ResourceType, id: string): void {
    const pool = this.pools.get(type);
    if (pool) {
      pool.release(id);
    }
  }

  private validateResourceLimits(type: ResourceType): void {
    const maxResources = this.limits.maxResourcesPerType.get(type);
    const currentMetrics = this.getResourceMetrics(type);
    
    if (maxResources && currentMetrics.size >= maxResources) {
      throw new Error(`Resource limit exceeded for type: ${type}`);
    }

    if (this.totalMemoryUsage >= this.limits.maxTotalMemory) {
      this.performEmergencyCleanup();
      if (this.totalMemoryUsage >= this.limits.maxTotalMemory) {
        throw new Error('Total memory limit exceeded');
      }
    }
  }

  private async updateMemoryUsage(): Promise<void> {
    // Placeholder for actual memory usage calculation
    this.totalMemoryUsage = Array.from(this.pools.values())
      .reduce((total, pool) => {
        const metrics = pool.getMetrics();
        return total + Array.from(metrics.values())
          .reduce((sum, m) => sum + m.memoryUsage, 0);
      }, 0);
  }

  getResourceMetrics(type: ResourceType): Map<string, ResourceMetrics> {
    return this.pools.get(type)?.getMetrics() || new Map();
  }

  getTotalMemoryUsage(): number {
    return this.totalMemoryUsage;
  }

  private performEmergencyCleanup(): void {
    for (const pool of this.pools.values()) {
      pool.cleanup();
    }
  }

  startPeriodicCleanup(intervalMs: number = 60000): void {
    setInterval(() => {
      for (const pool of this.pools.values()) {
        pool.cleanup();
      }
      this.updateMemoryUsage();
    }, intervalMs);
  }
}