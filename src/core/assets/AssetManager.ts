import {
  AssetMetadata,
  AssetType,
  AssetLoadOptions,
  AssetRequest,
  LoadedAsset,
  AssetLoader,
  AssetCache,
  AssetManagerConfig,
  AssetBatch
} from './AssetTypes';
import { ResourceManager } from '../memory/ResourceManager';
import { ResourceType } from '../memory/ResourceTypes';
import { ErrorHandler } from '../error/ErrorHandler';
import { ErrorType } from '../error/ErrorTypes';
import { ValidationUtils } from '../types/ValidationUtils';

export class AssetManager {
  private config: Required<AssetManagerConfig>;
  private loaders: Map<AssetType, AssetLoader[]> = new Map();
  private cache: Map<string, LoadedAsset> = new Map();
  private loadQueue: Map<string, AssetRequest> = new Map();
  private batchQueue: Map<string, AssetBatch> = new Map();
  private resourceManager: ResourceManager;
  private errorHandler: ErrorHandler;

  constructor(
    config: AssetManagerConfig,
    resourceManager: ResourceManager,
    errorHandler: ErrorHandler
  ) {
    this.config = {
      baseUrl: '',
      cache: {
        maxSize: 512 * 1024 * 1024, // 512MB
        maxEntries: 1000,
        ttl: 5 * 60 * 1000, // 5 minutes
        strategy: 'lru'
      },
      defaultLoadOptions: {
        priority: 1,
        timeout: 30000,
        retries: 3,
        preferCompressed: true,
        generateMips: true
      },
      resourceMapping: new Map([
        [AssetType.TEXTURE, ResourceType.TEXTURE],
        [AssetType.SHADER, ResourceType.SHADER],
        [AssetType.MODEL, ResourceType.GEOMETRY]
      ]),
      ...config
    };

    this.resourceManager = resourceManager;
    this.errorHandler = errorHandler;
  }

  registerLoader(loader: AssetLoader): void {
    loader.supportedTypes.forEach(type => {
      if (!this.loaders.has(type)) {
        this.loaders.set(type, []);
      }
      this.loaders.get(type)!.push(loader);
    });
  }

  async loadAsset<T>(request: AssetRequest): Promise<LoadedAsset<T>> {
    try {
      // Check cache first
      const cached = this.cache.get(this.getCacheKey(request));
      if (cached) {
        return cached as LoadedAsset<T>;
      }

      // Find appropriate loader
      const loader = this.findLoader(request);
      if (!loader) {
        throw new Error(
          `No loader found for asset type ${request.type} and URL ${request.url}`
        );
      }

      // Merge options
      const options = {
        ...this.config.defaultLoadOptions,
        ...request.options
      };

      // Add to load queue
      this.loadQueue.set(request.url, request);

      // Load the asset
      const asset = await loader.load({
        ...request,
        options,
        url: this.resolveUrl(request.url)
      });

      // Cache the asset
      this.cacheAsset(request, asset);

      // Map to resource manager if needed
      await this.mapToResource(asset);

      return asset as LoadedAsset<T>;
    } catch (error) {
      await this.errorHandler.handleError(error as Error, {
        type: ErrorType.RESOURCE_ERROR,
        context: { request }
      });
      throw error;
    } finally {
      this.loadQueue.delete(request.url);
    }
  }

  async loadBatch(batch: AssetBatch): Promise<Map<string, LoadedAsset>> {
    this.batchQueue.set(batch.id, batch);
    const results = new Map<string, LoadedAsset>();
    const progress = new Map<string, number>();

    try {
      await Promise.all(
        batch.assets.map(async request => {
          const asset = await this.loadAsset(request);
          results.set(request.url, asset);
          
          // Update progress
          progress.set(request.url, 1);
          const overall = Array.from(progress.values())
            .reduce((sum, p) => sum + p, 0) / batch.assets.length;
          
          batch.onProgress?.(overall, progress);
        })
      );

      batch.onComplete?.(results);
      return results;
    } finally {
      this.batchQueue.delete(batch.id);
    }
  }

  async unloadAsset(url: string): Promise<void> {
    const asset = this.cache.get(this.getCacheKey({ url, type: AssetType.DATA }));
    if (!asset) return;

    const loader = this.findLoader({ url, type: asset.metadata.type });
    if (loader?.unload) {
      await loader.unload(asset);
    }

    this.cache.delete(this.getCacheKey({ url, type: asset.metadata.type }));
  }

  private findLoader(request: AssetRequest): AssetLoader | undefined {
    const loaders = this.loaders.get(request.type) || [];
    return loaders.find(loader => 
      loader.supportedFormats.some(format => 
        request.url.toLowerCase().endsWith(format.toLowerCase())
      )
    );
  }

  private async mapToResource(asset: LoadedAsset): Promise<void> {
    const resourceType = this.config.resourceMapping.get(asset.metadata.type);
    if (resourceType) {
      await this.resourceManager.acquireResource(resourceType);
    }
  }

  private cacheAsset(request: AssetRequest, asset: LoadedAsset): void {
    const key = this.getCacheKey(request);
    
    // Check cache limits
    while (this.shouldEvictCache()) {
      this.evictFromCache();
    }

    this.cache.set(key, asset);
  }

  private shouldEvictCache(): boolean {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, asset) => sum + asset.metadata.size, 0);

    return (
      totalSize > this.config.cache.maxSize ||
      this.cache.size > this.config.cache.maxEntries
    );
  }

  private evictFromCache(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string | undefined;

    switch (this.config.cache.strategy) {
      case 'fifo':
        keyToEvict = this.cache.keys().next().value;
        break;
      
      case 'lru':
        // Find least recently used
        let oldest = Date.now();
        this.cache.forEach((asset, key) => {
          if (asset.metadata.lastModified < oldest) {
            oldest = asset.metadata.lastModified;
            keyToEvict = key;
          }
        });
        break;
      
      case 'lfu':
        // Would need to track frequency - defaulting to LRU
        keyToEvict = this.cache.keys().next().value;
        break;
    }

    if (keyToEvict) {
      const asset = this.cache.get(keyToEvict);
      if (asset) {
        const loader = this.findLoader({ 
          url: keyToEvict, 
          type: asset.metadata.type 
        });
        if (loader?.unload) {
          loader.unload(asset).catch(console.error);
        }
      }
      this.cache.delete(keyToEvict);
    }
  }

  private getCacheKey(request: Pick<AssetRequest, 'url' | 'type'>): string {
    return `${request.type}:${request.url}`;
  }

  private resolveUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.config.baseUrl}${url}`;
  }

  getLoadingProgress(url: string): number {
    // Would need to be implemented by specific loaders
    return this.loadQueue.has(url) ? 0 : 1;
  }

  getBatchProgress(batchId: string): number {
    const batch = this.batchQueue.get(batchId);
    if (!batch) return 1;

    return batch.assets.reduce(
      (sum, asset) => sum + this.getLoadingProgress(asset.url),
      0
    ) / batch.assets.length;
  }

  getCacheInfo(): {
    size: number;
    entries: number;
    totalSize: number;
  } {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, asset) => sum + asset.metadata.size, 0);

    return {
      size: this.cache.size,
      entries: this.cache.size,
      totalSize
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}