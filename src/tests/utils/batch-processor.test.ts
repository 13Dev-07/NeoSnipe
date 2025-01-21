import { BatchProcessor } from '../../utils/batch-processor';

describe('BatchProcessor', () => {
  const mockProcessItem = jest.fn();
  const mockOnBatchComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('processes items in correct batch sizes', async () => {
    const items = [1, 2, 3, 4, 5];
    mockProcessItem.mockImplementation(x => Promise.resolve(x * 2));

    const processor = new BatchProcessor({
      batchSize: 2,
      processItem: mockProcessItem,
      onBatchComplete: mockOnBatchComplete
    });

    const results = await processor.processBatches(items);

    expect(results).toEqual([2, 4, 6, 8, 10]);
    expect(mockProcessItem).toHaveBeenCalledTimes(5);
    expect(mockOnBatchComplete).toHaveBeenCalledTimes(3);
  });

  it('handles errors and retries correctly', async () => {
    const items = [1, 2];
    let attempts = 0;
    mockProcessItem.mockImplementation(() => {
      attempts++;
      if (attempts < 3) throw new Error('Test error');
      return Promise.resolve(42);
    });

    const processor = new BatchProcessor({
      batchSize: 1,
      processItem: mockProcessItem
    });

    const results = await processor.processBatches(items);

    expect(results).toEqual([42, 42]);
    expect(mockProcessItem).toHaveBeenCalledTimes(4); // 3 attempts for first item + 1 for second
  });

  it('respects concurrency limits', async () => {
    const items = [1, 2, 3, 4, 5];
    let concurrentCalls = 0;
    let maxConcurrentCalls = 0;

    mockProcessItem.mockImplementation(async () => {
      concurrentCalls++;
      maxConcurrentCalls = Math.max(maxConcurrentCalls, concurrentCalls);
      await new Promise(resolve => setTimeout(resolve, 10));
      concurrentCalls--;
      return 42;
    });

    const processor = new BatchProcessor({
      batchSize: 1,
      processItem: mockProcessItem,
      maxConcurrentBatches: 2
    });

    await processor.processBatches(items);

    expect(maxConcurrentCalls).toBeLessThanOrEqual(2);
  });

  it('reports progress correctly', async () => {
    const items = [1, 2, 3, 4];
    mockProcessItem.mockImplementation(x => Promise.resolve(x));

    const progressUpdates: number[] = [];
    const processor = new BatchProcessor({
      batchSize: 2,
      processItem: mockProcessItem,
      onBatchComplete: (_, progress) => {
        progressUpdates.push(progress);
      }
    });

    await processor.processBatches(items);

    expect(progressUpdates).toEqual([0.5, 1]);
  });
});