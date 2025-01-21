/**
 * Utility class for processing large datasets in batches with progress tracking
 * and memory management.
 */
export class BatchProcessor<T, R> {
  private readonly batchSize: number;
  private readonly processItem: (item: T) => Promise<R>;
  private readonly onBatchComplete?: (results: R[], progress: number) => void;
  private readonly maxConcurrentBatches: number;
  private readonly timeoutBetweenBatches: number;

  constructor(options: {
    batchSize: number;
    processItem: (item: T) => Promise<R>;
    onBatchComplete?: (results: R[], progress: number) => void;
    maxConcurrentBatches?: number;
    timeoutBetweenBatches?: number;
  }) {
    this.batchSize = options.batchSize;
    this.processItem = options.processItem;
    this.onBatchComplete = options.onBatchComplete;
    this.maxConcurrentBatches = options.maxConcurrentBatches || 4;
    this.timeoutBetweenBatches = options.timeoutBetweenBatches || 0;
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
    const results: R[] = [];
    const errors: Error[] = [];

    await Promise.all(
      batch.map(async (item) => {
        try {
          const result = await this.processWithRetry(item);
          results.push(result);
        } catch (error) {
          errors.push(error as Error);
        }
      })
    );

    if (errors.length > 0) {
      console.error(`Batch processing encountered ${errors.length} errors:`, errors);
    }

    return results;
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