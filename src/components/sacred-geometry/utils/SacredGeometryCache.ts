import * as THREE from 'three';
import { SACRED_RATIOS } from '../../../shared/constants';

const PHI = SACRED_RATIOS.PHI;

/**
 * Sacred Geometry Pattern Cache
 * Implements efficient caching and reuse of sacred geometry patterns using
 * golden ratio based memory management and GPU optimization techniques.
 */
export class SacredGeometryCache {
  // LRU cache with Fibonacci-based sizing
  private static geometryCache: Map<string, THREE.BufferGeometry> = new Map();
  private static materialCache: Map<string, THREE.Material> = new Map();
  private static textureCache: Map<string, THREE.Texture> = new Map();
  
  // Cache configuration using sacred numbers
  private static readonly CACHE_SIZE = 89; // Fibonacci number
  private static readonly CACHE_CLEANUP_RATIO = 1 / PHI; // Golden ratio based cleanup
  
  // Access tracking for LRU implementation
  private static accessLog: Map<string, number> = new Map();
  private static accessCount = 0;

  /**
   * Gets or creates a cached geometry
   * @param key Cache key
   * @param createFn Function to create geometry if not cached
   * @returns Cached or new geometry
   */
  static getGeometry(key: string, createFn: () => THREE.BufferGeometry): THREE.BufferGeometry {
    this.trackAccess(key);
    
    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key)!;
    }

    const geometry = createFn();
    this.geometryCache.set(key, geometry);
    this.cleanup();
    return geometry;
  }

  /**
   * Gets or creates a cached material
   * @param key Cache key
   * @param createFn Function to create material if not cached
   * @returns Cached or new material
   */
  static getMaterial(key: string, createFn: () => THREE.Material): THREE.Material {
    this.trackAccess(key);
    
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)!;
    }

    const material = createFn();
    this.materialCache.set(key, material);
    this.cleanup();
    return material;
  }

  /**
   * Gets or creates a cached texture
   * @param key Cache key
   * @param createFn Function to create texture if not cached
   * @returns Cached or new texture
   */
  static getTexture(key: string, createFn: () => THREE.Texture): THREE.Texture {
    this.trackAccess(key);
    
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key)!;
    }

    const texture = createFn();
    this.textureCache.set(key, texture);
    this.cleanup();
    return texture;
  }

  /**
   * Track resource access for LRU cache implementation
   * @param key Cache key to track
   */
  private static trackAccess(key: string): void {
    this.accessLog.set(key, ++this.accessCount);
  }

  /**
   * Cleanup least recently used cache entries using sacred proportions
   */
  private static cleanup(): void {
    const cleanupSize = Math.floor(this.CACHE_SIZE * this.CACHE_CLEANUP_RATIO);
    
    if (this.geometryCache.size > this.CACHE_SIZE) {
      this.cleanupCache(this.geometryCache, cleanupSize, (geometry) => {
        geometry.dispose();
      });
    }

    if (this.materialCache.size > this.CACHE_SIZE) {
      this.cleanupCache(this.materialCache, cleanupSize, (material) => {
        material.dispose();
      });
    }

    if (this.textureCache.size > this.CACHE_SIZE) {
      this.cleanupCache(this.textureCache, cleanupSize, (texture) => {
        texture.dispose();
      });
    }
  }

  /**
   * Clean up a specific cache using LRU policy
   * @param cache Cache to clean
   * @param cleanupSize Number of items to remove
   * @param disposeFn Function to dispose resources
   */
  private static cleanupCache<T>(
    cache: Map<string, T>,
    cleanupSize: number,
    disposeFn: (item: T) => void
  ): void {
    const entries = Array.from(cache.entries());
    
    // Sort by access time using golden ratio comparisons
    entries.sort(([keyA], [keyB]) => {
      const accessA = this.accessLog.get(keyA) || 0;
      const accessB = this.accessLog.get(keyB) || 0;
      return accessA - accessB;
    });

    // Remove least recently used entries
    for (let i = 0; i < cleanupSize; i++) {
      const [key, item] = entries[i];
      disposeFn(item);
      cache.delete(key);
      this.accessLog.delete(key);
    }
  }

  /**
   * Clear all caches and dispose resources
   */
  static clear(): void {
    this.geometryCache.forEach(geometry => geometry.dispose());
    this.materialCache.forEach(material => material.dispose());
    this.textureCache.forEach(texture => texture.dispose());
    
    this.geometryCache.clear();
    this.materialCache.clear();
    this.textureCache.clear();
    this.accessLog.clear();
    this.accessCount = 0;
  }
}