# WebGL System API Documentation

## Core Components

### ErrorHandler
The central error handling system that manages error logging, recovery strategies, and metrics collection.

```typescript
class ErrorHandler {
  constructor(config?: Partial<ErrorHandlingConfig>)
  
  // Handle and attempt recovery from errors
  async handleError(error: Error, metadata?: Partial<ErrorMetadata>): Promise<void>
  
  // Get error metrics and statistics
  getErrorMetrics(): ErrorMetrics
  getRecoveryMetrics(): ErrorRecoveryMetrics
  resetMetrics(): void
}
```

### PerformanceMetrics
Performance monitoring system with threshold management and violation detection.

```typescript
class PerformanceMetrics {
  constructor(
    thresholds?: Partial<PerformanceThresholds>,
    windowSize?: number,
    maxSamples?: number,
    errorHandler?: ErrorHandler
  )

  // Record and monitor metrics
  record(type: MetricType, value: number, metadata?: Record<string, unknown>): void
  
  // Threshold management
  onThresholdViolation(callback: ThresholdCallback): void
  offThresholdViolation(callback: ThresholdCallback): void
  
  // Metrics retrieval
  getSummary(type: MetricType): MetricSummary
  getMetrics(type: MetricType): Metric[]
  
  // Configuration
  updateThresholds(thresholds: Partial<PerformanceThresholds>): void
  getThresholds(): PerformanceThresholds
  clearMetrics(type?: MetricType): void
}
```

### ShaderManager
Manages WebGL shader programs with validation, security checks, and resource management.

```typescript
class ShaderManager {
  constructor(
    gl: WebGL2RenderingContext,
    errorHandler: ErrorHandler,
    options?: { validateShaders?: boolean }
  )

  // Program management
  async createProgram(
    key: string,
    vertexSource: string,
    fragmentSource: string
  ): Promise<WebGLProgram | null>
  
  useProgram(key: string): void
  deleteProgram(key: string): void
  cleanup(): void
  
  // Accessors
  getProgram(key: string): WebGLProgram | null
  getProgramCount(): number
  getComputeProgram(key: string): WebGLProgram | null
}
```

### ResourceManager
Manages WebGL resources including buffers, textures, and vertex arrays.

```typescript
class ResourceManager {
  constructor(gl: WebGL2RenderingContext, errorHandler: ErrorHandler)

  // Buffer management
  createBuffer(
    key: string,
    data: BufferSource,
    type: number,
    usage: number
  ): WebGLBuffer | null
  
  deleteBuffer(key: string): void
  
  // VAO management
  createVAO(key: string, setupFunction: () => void): WebGLVertexArrayObject | null
  deleteVAO(key: string): void
  
  // Resource tracking
  getMetrics(): ResourceMetrics
  cleanup(): void
}
```

### StateManager
Optimizes WebGL state changes and manages state caching.

```typescript
class StateManager {
  constructor(gl: WebGL2RenderingContext, errorHandler: ErrorHandler)

  // State management
  saveState(key: string): void
  restoreState(key: string): void
  setState(state: Partial<GLState>): void
  resetToDefault(): void
  
  // Binding operations
  bindBuffer(target: number, buffer: WebGLBuffer | null): void
  bindTexture(target: number, texture: WebGLTexture | null): void
  bindFramebuffer(target: number, framebuffer: WebGLFramebuffer | null): void
  useProgram(program: WebGLProgram | null): void
  
  // Metrics
  getStateChangeCount(): number
  resetStateChangeCount(): void
}
```

### WebGLContextLossHandler
Handles WebGL context loss events and resource restoration.

```typescript
class WebGLContextLossHandler {
  constructor(
    gl: WebGL2RenderingContext,
    errorHandler: ErrorHandler,
    shaderManager: ShaderManager,
    resourceManager: ResourceManager,
    stateManager: StateManager,
    config?: Partial<ContextLossConfig>
  )

  // Public methods
  cleanup(): void
  isContextCurrentlyLost(): boolean
  getRestoreAttempts(): number
}
```

## Error Types and Interfaces

### ErrorType
```typescript
enum ErrorType {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  WEBGL_ERROR = 'WEBGL_ERROR',
  SHADER_ERROR = 'SHADER_ERROR',
  RESOURCE_ERROR = 'RESOURCE_ERROR',
  CONTEXT_LOSS = 'CONTEXT_LOSS',
  MEMORY_ERROR = 'MEMORY_ERROR',
  PERFORMANCE_ERROR = 'PERFORMANCE_ERROR'
}
```

### Performance Metrics
```typescript
interface Metric {
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface MetricSummary {
  average: number;
  min: number;
  max: number;
  current: number;
  samples: number;
}

interface PerformanceThresholds {
  fpsMin: number;
  frameTimeMax: number;
  memoryMax: number;
  loadTimeMax: number;
  warningThresholdPercent: number;
  criticalThresholdPercent: number;
}
```

### Resource Metrics
```typescript
interface ResourceMetrics {
  totalMemoryUsage: number;
  textureMemory: number;
  bufferMemory: number;
  activeTextures: number;
  activeBuffers: number;
  activePrograms: number;
  vertexCount: number;
  indexCount: number;
}
```

### Error Metrics
```typescript
interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Map<string, number>;
  recoveryRate: number;
  averageRecoveryTime: number;
  lastError?: {
    timestamp: number;
    type: string;
    message: string;
  };
}

interface ErrorRecoveryMetrics {
  attempts: number;
  successes: number;
  failures: number;
  averageAttempts: number;
  totalRecoveryTime: number;
}
```

## Usage Examples

### Error Handling
```typescript
const errorHandler = new ErrorHandler({
  logging: {
    enabled: true,
    logToConsole: true,
    logToFile: false
  }
});

try {
  // Some WebGL operation
} catch (error) {
  await errorHandler.handleError(error, {
    type: ErrorType.WEBGL_ERROR,
    context: { /* additional context */ }
  });
}
```

### Performance Monitoring
```typescript
const perfMetrics = new PerformanceMetrics(
  {
    fpsMin: 30,
    frameTimeMax: 33.33,
    memoryMax: 1024 * 1024 * 1024
  },
  5000, // window size
  1000, // max samples
  errorHandler
);

perfMetrics.onThresholdViolation((violation) => {
  console.warn(`Performance violation: ${violation.type}`);
});

// Record metrics
perfMetrics.record('FPS', currentFPS);
perfMetrics.record('MEMORY_USAGE', memoryUsed);
```

### Resource Management
```typescript
const resourceManager = new ResourceManager(gl, errorHandler);

// Create and manage buffers
const buffer = resourceManager.createBuffer(
  'vertices',
  new Float32Array([/* vertex data */]),
  gl.ARRAY_BUFFER,
  gl.STATIC_DRAW
);

// Monitor resource usage
const metrics = resourceManager.getMetrics();
console.log(`Total memory usage: ${metrics.totalMemoryUsage}`);

// Cleanup
resourceManager.cleanup();
```

### State Management
```typescript
const stateManager = new StateManager(gl, errorHandler);

// Save current state
stateManager.saveState('defaultState');

// Modify state
stateManager.setState({
  blend: true,
  depthTest: true,
  viewport: [0, 0, 800, 600]
});

// Restore state
stateManager.restoreState('defaultState');
```