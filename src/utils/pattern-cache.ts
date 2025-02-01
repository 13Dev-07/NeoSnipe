import { Pattern } from '../types/pattern-recognition';

interface CacheEntry {
    patterns: Pattern[];
    timestamp: number;
}

export class PatternCache {
    private cache: Map<string, CacheEntry> = new Map();
    private readonly CACHE_DURATION = 5000; // 5 seconds

    public set(key: string, patterns: Pattern[]): void {
        this.cache.set(key, {
            patterns,
            timestamp: Date.now()
        });
    }

    public get(key: string): Pattern[] | null {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }
        return entry.patterns;
    }

    public cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.CACHE_DURATION) {
                this.cache.delete(key);
            }
        }
    }

    public getCacheStats(): { hits: number; misses: number; size: number } {
        return {
            hits: this.hits,
            misses: this.misses,
            size: this.cache.size
        };
    }

    private hits: number = 0;
    private misses: number = 0;
}