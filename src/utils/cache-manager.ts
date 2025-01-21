import { PerformanceOptimizer } from './performance-optimizer';

interface CacheItem<T> {
    data: T;
    timestamp: number;
    accessCount: number;
    memorySize: number;
}

export class CacheManager<T> {
    private cache: Map<string, CacheItem<T>>;
    private memoryLimit: number;
    private currentMemoryUsage: number;
    private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

    constructor(memoryLimitMB: number = 100) {
        this.cache = new Map();
        this.memoryLimit = memoryLimitMB * 1024 * 1024; // Convert to bytes
        this.currentMemoryUsage = 0;
    }

    public set(key: string, value: T, size: number): void {
        this.ensureMemoryAvailable(size);

        const item: CacheItem<T> = {
            data: value,
            timestamp: Date.now(),
            accessCount: 0,
            memorySize: size
        };

        this.cache.set(key, item);
        this.currentMemoryUsage += size;
    }

    public get(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;

        item.accessCount++;
        item.timestamp = Date.now();
        return item.data;
    }

    public clear(): void {
        this.cache.clear();
        this.currentMemoryUsage = 0;
    }

    private ensureMemoryAvailable(requiredSize: number): void {
        if (requiredSize > this.memoryLimit) {
            throw new Error(`Cache item size (${requiredSize} bytes) exceeds memory limit (${this.memoryLimit} bytes)`);
        }

        while (this.currentMemoryUsage + requiredSize > this.memoryLimit) {
            this.evictLeastValuableItem();
        }
    }

    private evictLeastValuableItem(): void {
        let leastValuableKey: string | null = null;
        let lowestValue = Infinity;

        for (const [key, item] of this.cache.entries()) {
            const age = Date.now() - item.timestamp;
            const value = this.calculateItemValue(item.accessCount, age, item.memorySize);

            if (value < lowestValue) {
                lowestValue = value;
                leastValuableKey = key;
            }
        }

        if (leastValuableKey) {
            const item = this.cache.get(leastValuableKey)!;
            this.currentMemoryUsage -= item.memorySize;
            this.cache.delete(leastValuableKey);
        }
    }

    private calculateItemValue(accessCount: number, age: number, size: number): number {
        // Higher value = more valuable to keep
        // Consider:
        // 1. Access frequency (higher is better)
        // 2. Age (newer is better)
        // 3. Size (smaller is better)
        const accessWeight = accessCount / (age / 1000); // accesses per second
        const ageWeight = Math.exp(-age / this.DEFAULT_TTL);
        const sizeWeight = 1 / Math.log(size + Math.E);

        return accessWeight * ageWeight * sizeWeight;
    }

    public getStats(): {
        itemCount: number;
        memoryUsage: number;
        memoryLimit: number;
        utilizationPercent: number;
    } {
        return {
            itemCount: this.cache.size,
            memoryUsage: this.currentMemoryUsage,
            memoryLimit: this.memoryLimit,
            utilizationPercent: (this.currentMemoryUsage / this.memoryLimit) * 100
        };
    }
}