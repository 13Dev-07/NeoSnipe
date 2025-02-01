/**
 * Utility class for processing large datasets in batches with progress tracking
 * and memory management.
 */
export class BatchProcessor<T, R> {
  private readonly initialBatchSize: number;
  private batchSize: number;
  private readonly processItem: (item: T) => Promise<R>;
  private readonly onBatchComplete?: (results: R[], progress: number) => void;
  private readonly maxConcurrentBatches: number;
  private readonly timeoutBetweenBatches: number;
  private readonly resultCache: Map<string, R> = new Map();
  private readonly priorityQueue: PriorityQueue<T> = new PriorityQueue();
  private lastProcessingTime: number = 0;
  private readonly MIN_BATCH_SIZE = 5;
  private readonly MAX_BATCH_SIZE = 100;
  private readonly PROCESSING_TIME_THRESHOLD = 1000; // 1 second

  constructor(options: {
    batchSize: number;
    processItem: (item: T) => Promise<R>;
    onBatchComplete?: (results: R[], progress: number) => void;
    maxConcurrentBatches?: number;
    timeoutBetweenBatches?: number;
    cacheResults?: boolean;
  }) {
    this.initialBatchSize = options.batchSize;
    this.batchSize = options.batchSize;
    this.processItem = options.processItem;
    this.onBatchComplete = options.onBatchComplete;
    this.maxConcurrentBatches = options.maxConcurrentBatches || 4;
    this.timeoutBetweenBatches = options.timeoutBetweenBatches || 0;
  }

  private adjustBatchSize(processingTime: number): void {
    if (processingTime > this.PROCESSING_TIME_THRESHOLD && this.batchSize > this.MIN_BATCH_SIZE) {
      this.batchSize = Math.max(this.MIN_BATCH_SIZE, Math.floor(this.batchSize * 0.8));
    } else if (processingTime < this.PROCESSING_TIME_THRESHOLD / 2 && this.batchSize < this.MAX_BATCH_SIZE) {
      this.batchSize = Math.min(this.MAX_BATCH_SIZE, Math.floor(this.batchSize * 1.2));
    }
  }

  public enqueuePriorityItems(items: T[], priority: number = 1): void {
    items.forEach(item => this.priorityQueue.enqueue(item, priority));
  }

  /**
   * Process an array of items in batches with concurrency control and progress tracking.
   */
  public async processBatches(items: T[]): Promise<R[]> {
    const results: R[] = [];
    const batches: T[][] = this.createBatches(items);
    const totalBatches = batches.length;
    let processedBatches = 0;

    // Process batches with controlled concurrency
    for (let i = 0; i < batches.length; i += this.maxConcurrentBatches) {
      const currentBatches = batches.slice(i, i + this.maxConcurrentBatches);
      const batchPromises = currentBatches.map(async (batch) => {
        const batchResults = await this.processBatch(batch);
        processedBatches++;
        
        if (this.onBatchComplete) {
          const progress = processedBatches / totalBatches;
          this.onBatchComplete(batchResults, progress);
        }

        return batchResults;
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.flat());

      if (this.timeoutBetweenBatches > 0 && i + this.maxConcurrentBatches < batches.length) {
        await new Promise(resolve => setTimeout(resolve, this.timeoutBetweenBatches));
      }
    }

    return results;
  }

  /**
   * Process a single batch of items with error handling and retries.
   */
  private async processBatch(batch: T[]): Promise<R[]> {
    const startTime = performance.now();
    const results: R[] = [];
    const errors: Error[] = [];

    await Promise.all(
      batch.map(async (item) => {
        try {
          // Check cache first
          const cacheKey = this.generateCacheKey(item);
          const cachedResult = this.resultCache.get(cacheKey);
          
          if (cachedResult) {
            results.push(cachedResult);
            return;
          }

          const result = await this.processWithRetry(item);
          
          // Cache the result
          this.resultCache.set(cacheKey, result);
          results.push(result);
        } catch (error) {
          errors.push(error as Error);
        }
      })
    );

    if (errors.length > 0) {
      console.error(`Batch processing encountered ${errors.length} errors:`, errors);
    }

    const processingTime = performance.now() - startTime;
    this.lastProcessingTime = processingTime;
    this.adjustBatchSize(processingTime);

    return results;
  }

  private generateCacheKey(item: T): string {
    // Generate a cache key based on the item's properties
    return JSON.stringify(item);
  }

  public clearCache(): void {
    this.resultCache.clear();
  }

  public getCacheSize(): number {
    return this.resultCache.size;
  }

  /**
   * Process a single item with automatic retries on failure.
   */
  private async processWithRetry(
    item: T,
    retries: number = 3,
    delay: number = 1000
  ): Promise<R> {
    try {
      return await this.processItem(item);
    } catch (error) {
      if (retries === 0) throw error;

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.processWithRetry(item, retries - 1, delay * 2);
    }
  }

  /**
   * Split array into batches of specified size.
   */
  private createBatches(items: T[]): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += this.batchSize) {
      batches.push(items.slice(i, i + this.batchSize));
    }
    return batches;
  }
}