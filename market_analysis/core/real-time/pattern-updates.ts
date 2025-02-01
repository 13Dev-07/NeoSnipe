import { WebSocket } from 'ws';
import { PatternIdentificationResult } from '../analyzers/pattern-types';
import { PatternValidator } from '../analyzers/pattern-validation';
import { PatternRecognizer } from '../analyzers/pattern_recognition';

export interface RealTimeUpdate {
    timestamp: number;
    price: number;
    volume: number;
}

export interface PatternUpdateEvent {
    type: 'new-pattern' | 'pattern-invalidated' | 'pattern-strength-change';
    pattern: PatternIdentificationResult;
    confidence: number;
    timestamp: number;
}

export class RealTimePatternDetector {
    private ws: WebSocket | null = null;
    private readonly validator: PatternValidator;
    private readonly recognizer: PatternRecognizer;
    private readonly priceBuffer: number[] = [];
    private readonly BUFFER_SIZE = 1000;
    private readonly UPDATE_THRESHOLD = 0.1; // 10% change threshold
    private lastPattern: PatternIdentificationResult | null = null;

    constructor(
        private readonly wsUrl: string,
        private readonly onPatternUpdate: (event: PatternUpdateEvent) => void
    ) {
        this.validator = new PatternValidator();
        this.recognizer = new PatternRecognizer();
        this.initializeWebSocket();
    }

    private initializeWebSocket(): void {
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.onmessage = async (event) => {
            const update = JSON.parse(event.data) as RealTimeUpdate;
            await this.handleUpdate(update);
        };

        this.ws.onclose = () => {
            setTimeout(() => this.initializeWebSocket(), 5000); // Reconnect after 5 seconds
        };
    }

    private async handleUpdate(update: RealTimeUpdate): Promise<void> {
        // Add new price to buffer
        this.priceBuffer.push(update.price);
        if (this.priceBuffer.length > this.BUFFER_SIZE) {
            this.priceBuffer.shift();
        }

        // Analyze pattern
        const result = await this.recognizer.analyzePattern(this.priceBuffer);
        const validation = await this.validator.validatePattern(result.pattern, this.priceBuffer);

        // Check if pattern has changed significantly
        if (this.shouldNotifyUpdate(result.pattern, validation)) {
            const event: PatternUpdateEvent = {
                type: this.determineUpdateType(result.pattern),
                pattern: result.pattern,
                confidence: validation.confidence,
                timestamp: update.timestamp
            };

            this.onPatternUpdate(event);
            this.lastPattern = result.pattern;
        }
    }

    private shouldNotifyUpdate(
        currentPattern: PatternIdentificationResult,
        validation: { confidence: number }
    ): boolean {
        if (!this.lastPattern) return true;

        const confidenceChange = Math.abs(
            (currentPattern.confidence || 0) - (this.lastPattern.confidence || 0)
        );

        return (
            currentPattern.type !== this.lastPattern.type ||
            confidenceChange > this.UPDATE_THRESHOLD
        );
    }

    private determineUpdateType(
        currentPattern: PatternIdentificationResult
    ): PatternUpdateEvent['type'] {
        if (!this.lastPattern) return 'new-pattern';

        if (currentPattern.type !== this.lastPattern.type) {
            return 'new-pattern';
        }

        if ((currentPattern.confidence || 0) < (this.lastPattern.confidence || 0)) {
            return 'pattern-invalidated';
        }

        return 'pattern-strength-change';
    }

    public disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}