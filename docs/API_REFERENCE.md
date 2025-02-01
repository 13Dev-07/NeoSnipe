# API Reference

## Components

### SacredGeometryProvider

Context provider for sacred geometry visualizations.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| initialPattern | string | 'flower-of-life' | Initial pattern to display |
| children | ReactNode | - | Child components |

### OptimizedWebGLBackground

Optimized WebGL background renderer.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| width | number | Canvas width |
| height | number | Canvas height |
| pattern | string | Pattern to render |

### TorusEnergyFlow

Torus energy flow visualization.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| radius | number | Outer radius |
| tubeRadius | number | Inner tube radius |
| segments | number | Number of segments |
| rotation | number | Rotation angle |
| color | [number, number, number, number] | RGBA color |

### MetatronsCube

Metatron's Cube visualization.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| size | number | Size of the cube |
| color | [number, number, number, number] | RGBA color |
| rotation | number | Rotation angle |

## Utilities

### WebGLSecurityManager

```typescript
class WebGLSecurityManager {
  static getInstance(): WebGLSecurityManager;
  validateContext(gl: WebGLRenderingContext): void;
  validateShaderSource(source: string): boolean;
  validateTextureSource(url: string): boolean;
  setMaxTextureSize(size: number): void;
  setMaxViewportDimensions(width: number, height: number): void;
  blockDomain(domain: string): void;
  unblockDomain(domain: string): void;
}
```

### WebGLPerformanceMonitor

```typescript
class WebGLPerformanceMonitor {
  static getInstance(): WebGLPerformanceMonitor;
  enable(): void;
  disable(): void;
  startFrame(): void;
  recordMetric(type: string, duration: number, details?: Record<string, any>): void;
  measureOperation<T>(type: string, operation: () => T, details?: Record<string, any>): T;
  measureAsyncOperation<T>(type: string, operation: Promise<T>, details?: Record<string, any>): Promise<T>;
  getMetrics(): PerformanceMetric[];
  getMetricsByType(type: string): PerformanceMetric[];
  getAverageMetric(type: string): number;
  getCurrentFPS(): number;
  clearMetrics(): void;
  getPerformanceReport(): Record<string, any>;
}
```

### ResourcePool

```typescript
interface ResourcePoolOptions {
  maxTextureSize: number;
  maxBufferSize: number;
  enableAutomaticCleanup: boolean;
  cleanupInterval: number;
}

class ResourcePool {
  constructor(gl: WebGLRenderingContext, options: ResourcePoolOptions);
  initializeShaders(pattern: string): void;
  initializeBuffers(): void;
  cleanup(): void;
  dispose(): void;
}
```