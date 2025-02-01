export interface BatchConfig {
  maxBatchSize?: number;
  sortingKey?: (item: any) => number;
}

export class WebGLBatchProcessor {
  private maxBatchSize: number;
  private sortingKey?: (item: any) => number;
  private currentBatch: any[];

  constructor(config: BatchConfig = {}) {
    this.maxBatchSize = config.maxBatchSize || 1000;
    this.sortingKey = config.sortingKey;
    this.currentBatch = [];
  }

  public add(item: any): void {
    this.currentBatch.push(item);
    
    if (this.currentBatch.length >= this.maxBatchSize) {
      this.processBatch();
    }
  }

  public processBatch(): void {
    if (this.currentBatch.length === 0) {
      return;
    }

    if (this.sortingKey) {
      this.currentBatch.sort((a, b) => this.sortingKey!(a) - this.sortingKey!(b));
    }

    // Process the batch
    this.currentBatch.forEach(item => {
      // Process each item in the batch
      this.processItem(item);
    });

    this.currentBatch = [];
  }

  private processItem(item: any): void {
    // Override this method in derived classes to implement specific processing logic
    console.warn('processItem method not implemented');
  }

  public flush(): void {
    this.processBatch();
  }

  public clear(): void {
    this.currentBatch = [];
  }

  public getBatchSize(): number {
    return this.currentBatch.length;
  }

  public isEmpty(): boolean {
    return this.currentBatch.length === 0;
  }
}