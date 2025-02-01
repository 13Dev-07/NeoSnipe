export class PriorityQueue<T> {
    private items: { item: T; priority: number }[] = [];

    public enqueue(item: T, priority: number = 0): void {
        const queueItem = { item, priority };
        let added = false;

        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority < priority) {
                this.items.splice(i, 0, queueItem);
                added = true;
                break;
            }
        }

        if (!added) {
            this.items.push(queueItem);
        }
    }

    public dequeue(): T | undefined {
        if (this.isEmpty()) return undefined;
        return this.items.shift()?.item;
    }

    public dequeueMany(count: number): T[] {
        const result: T[] = [];
        for (let i = 0; i < count && !this.isEmpty(); i++) {
            const item = this.dequeue();
            if (item) result.push(item);
        }
        return result;
    }

    public isEmpty(): boolean {
        return this.items.length === 0;
    }

    public size(): number {
        return this.items.length;
    }

    public clear(): void {
        this.items = [];
    }

    public peek(): T | undefined {
        return this.items[0]?.item;
    }
}