export class WebGLContextLostError extends Error {
    constructor(message: string = 'WebGL context was lost') {
        super(message);
        this.name = 'WebGLContextLostError';
    }
}

export class PatternRecognitionError extends Error {
    constructor(message: string, public readonly details?: any) {
        super(message);
        this.name = 'PatternRecognitionError';
    }
}

export class ResourceInitializationError extends Error {
    constructor(message: string, public readonly resource: string) {
        super(`Failed to initialize ${resource}: ${message}`);
        this.name = 'ResourceInitializationError';
    }
}