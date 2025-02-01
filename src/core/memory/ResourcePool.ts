import { ResourceType, ResourceMetrics } from './ResourceTypes';

export interface PooledResource<T> {
  resource: T;
  metrics: ResourceMetrics;
  type: ResourceType;
  id: string;
}

export class ResourcePool<T> {
  private resources: Map<string, PooledResource<T>> = new Map();
  private readonly type: ResourceType;
  private readonly createResource: () => T;
  private readonly destroyResource: (resource: T) => void;

  constructor(
    type: ResourceType,
    createFn: () => T,
    destroyFn: (resource: T) => void
  ) {
    this.type = type;
    this.createResource = createFn;
    this.destroyResource = destroyFn;
  }

  acquire(): PooledResource<T> {
    // Try to find an unused resource first
    const availableResource = Array.from(this.resources.values())
      .find(r => r.metrics.accessCount === 0);

    if (availableResource) {
      this.updateMetrics(availableResource);
      return availableResource;
    }

    // Create new resource if none available
    const newResource = this.createResource();
    const pooledResource: PooledResource<T> = {
      resource: newResource,
      type: this.type,
      id: Math.random().toString(36).substr(2, 9),
      metrics: {
        memoryUsage: 0, // Will be updated by ResourceManager
        lastAccessed: Date.now(),
        createdAt: Date.now(),
        accessCount: 1
      }
    };

    this.resources.set(pooledResource.id, pooledResource);
    return pooledResource;
  }

  release(id: string): void {
    const resource = this.resources.get(id);
    if (resource) {
      resource.metrics.accessCount--;
      if (resource.metrics.accessCount < 0) {
        resource.metrics.accessCount = 0;
      }
    }
  }

  private updateMetrics(resource: PooledResource<T>): void {
    resource.metrics.lastAccessed = Date.now();
    resource.metrics.accessCount++;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [id, resource] of this.resources) {
      // Clean up resources that haven't been accessed in 5 minutes and aren't being used
      if (resource.metrics.accessCount === 0 && 
          now - resource.metrics.lastAccessed > 5 * 60 * 1000) {
        this.destroyResource(resource.resource);
        this.resources.delete(id);
      }
    }
  }

  getMetrics(): Map<string, ResourceMetrics> {
    const metrics = new Map<string, ResourceMetrics>();
    for (const [id, resource] of this.resources) {
      metrics.set(id, { ...resource.metrics });
    }
    return metrics;
  }
}