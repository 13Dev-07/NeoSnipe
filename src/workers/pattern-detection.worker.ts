import { GEOMETRIC_RATIO_COMPUTE, PATTERN_DETECTION_COMPUTE } from '../utils/webgl/compute-shaders';
import { SACRED_RATIOS } from '../shared/constants';

interface PatternDetectionMessage {
  type: 'ANALYZE_PATTERN';
  data: {
    prices: number[];
    timestamp: number;
    windowSize?: number;
  };
}

interface PatternResult {
  type: 'PATTERN_RESULT';
  data: {
    pattern: string;
    confidence: number;
    geometricRatios: { ratio: number; significance: number }[];
    computeTime: number;
    timestamp: number;
  };
}

class GPUPatternDetector {
  private canvas: OffscreenCanvas;
  private gl: WebGL2RenderingContext;
  private geometricRatioProgram: WebGLProgram | null = null;
  private patternDetectionProgram: WebGLProgram | null = null;
  private priceBuffer: WebGLBuffer | null = null;
  private ratioBuffer: WebGLBuffer | null = null;
  private patternBuffer: WebGLBuffer | null = null;

  constructor() {
    this.canvas = new OffscreenCanvas(1, 1);
    this.gl = this.canvas.getContext('webgl2', {
      preserveDrawingBuffer: false,
      antialias: false,
      depth: false,
      stencil: false
    }) as WebGL2RenderingContext;

    if (!this.gl) {
      throw new Error('WebGL 2 not supported in worker');
    }

    this.initializeGPUResources();
  }

  private initializeGPUResources(): void {
    // Initialize compute shader programs
    this.geometricRatioProgram = this.createComputeProgram(GEOMETRIC_RATIO_COMPUTE);
    this.patternDetectionProgram = this.createComputeProgram(PATTERN_DETECTION_COMPUTE);

    // Create buffers
    this.priceBuffer = this.gl.createBuffer();
    this.ratioBuffer = this.gl.createBuffer();
    this.patternBuffer = this.gl.createBuffer();

    if (!this.priceBuffer || !this.ratioBuffer || !this.patternBuffer) {
      throw new Error('Failed to create GPU buffers');
    }
  }

  public async analyzePattern(prices: number[], windowSize: number = 10): Promise<PatternResult['data']> {
    const startTime = performance.now();

    // Upload price data to GPU
    const priceData = new Float32Array(prices);
    this.gl.bindBuffer(this.gl.SHADER_STORAGE_BUFFER, this.priceBuffer);
    this.gl.bufferData(this.gl.SHADER_STORAGE_BUFFER, priceData, this.gl.STATIC_DRAW);

    // Create output buffers
    const ratioData = new Float32Array(prices.length - 1);
    const significanceData = new Float32Array(prices.length - 1);
    this.gl.bindBuffer(this.gl.SHADER_STORAGE_BUFFER, this.ratioBuffer);
    this.gl.bufferData(
      this.gl.SHADER_STORAGE_BUFFER,
      (ratioData.byteLength + significanceData.byteLength),
      this.gl.DYNAMIC_COPY
    );

    // Calculate geometric ratios using GPU
    if (this.geometricRatioProgram) {
      this.gl.useProgram(this.geometricRatioProgram);
      this.gl.bindBufferBase(this.gl.SHADER_STORAGE_BUFFER, 0, this.priceBuffer);
      this.gl.bindBufferBase(this.gl.SHADER_STORAGE_BUFFER, 1, this.ratioBuffer);
      
      const goldenRatioLocation = this.gl.getUniformLocation(this.geometricRatioProgram, 'goldenRatio');
      this.gl.uniform1f(goldenRatioLocation, SACRED_RATIOS.PHI);

      const workGroups = Math.ceil(prices.length / 256);
      (this.gl as any).dispatchCompute(workGroups, 1, 1);
      (this.gl as any).memoryBarrier((this.gl as any).SHADER_STORAGE_BARRIER_BIT);
    }

    // Read back results
    const resultBuffer = new Float32Array(ratioData.length * 2); // For both ratios and significance
    this.gl.bindBuffer(this.gl.SHADER_STORAGE_BUFFER, this.ratioBuffer);
    this.gl.getBufferSubData(this.gl.SHADER_STORAGE_BUFFER, 0, resultBuffer);

    // Process results
    const geometricRatios = Array.from({ length: ratioData.length }, (_, i) => ({
      ratio: resultBuffer[i],
      significance: resultBuffer[i + ratioData.length]
    }));

    // Analyze pattern using GPU
    const pattern = await this.detectPattern(geometricRatios, windowSize);

    const computeTime = performance.now() - startTime;

    return {
      pattern: pattern.type,
      confidence: pattern.confidence,
      geometricRatios,
      computeTime,
      timestamp: Date.now()
    };
  }

  private async detectPattern(
    geometricRatios: { ratio: number; significance: number }[],
    windowSize: number
  ): Promise<{ type: string; confidence: number }> {
    if (!this.patternDetectionProgram) {
      throw new Error('Pattern detection program not initialized');
    }

    // Prepare input data
    const ratioData = new Float32Array(geometricRatios.length * 2);
    geometricRatios.forEach((data, i) => {
      ratioData[i] = data.ratio;
      ratioData[i + geometricRatios.length] = data.significance;
    });

    // Upload data to GPU
    this.gl.bindBuffer(this.gl.SHADER_STORAGE_BUFFER, this.ratioBuffer);
    this.gl.bufferData(this.gl.SHADER_STORAGE_BUFFER, ratioData, this.gl.STATIC_DRAW);

    // Prepare output buffer
    const patternData = new Int32Array(geometricRatios.length);
    const confidenceData = new Float32Array(geometricRatios.length);
    this.gl.bindBuffer(this.gl.SHADER_STORAGE_BUFFER, this.patternBuffer);
    this.gl.bufferData(
      this.gl.SHADER_STORAGE_BUFFER,
      patternData.byteLength + confidenceData.byteLength,
      this.gl.DYNAMIC_COPY
    );

    // Run pattern detection compute shader
    this.gl.useProgram(this.patternDetectionProgram);
    this.gl.bindBufferBase(this.gl.SHADER_STORAGE_BUFFER, 0, this.ratioBuffer);
    this.gl.bindBufferBase(this.gl.SHADER_STORAGE_BUFFER, 1, this.patternBuffer);

    const uniforms = {
      goldenRatio: SACRED_RATIOS.PHI,
      significanceThreshold: 0.5,
      windowSize
    };

    for (const [name, value] of Object.entries(uniforms)) {
      const location = this.gl.getUniformLocation(this.patternDetectionProgram, name);
      if (typeof value === 'number') {
        this.gl.uniform1f(location, value);
      }
    }

    const workGroups = Math.ceil(geometricRatios.length / 256);
    (this.gl as any).dispatchCompute(workGroups, 1, 1);
    (this.gl as any).memoryBarrier((this.gl as any).SHADER_STORAGE_BARRIER_BIT);

    // Read results
    const resultBuffer = new Int32Array(patternData.length + confidenceData.length);
    this.gl.bindBuffer(this.gl.SHADER_STORAGE_BUFFER, this.patternBuffer);
    this.gl.getBufferSubData(this.gl.SHADER_STORAGE_BUFFER, 0, resultBuffer);

    // Find most common pattern and average confidence
    const patternCounts = new Map<number, number>();
    const patternConfidences = new Map<number, number>();
    
    for (let i = 0; i < patternData.length; i++) {
      const pattern = resultBuffer[i];
      const confidence = resultBuffer[i + patternData.length];
      
      patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
      patternConfidences.set(
        pattern,
        (patternConfidences.get(pattern) || 0) + confidence
      );
    }

    let dominantPattern = 0;
    let maxCount = 0;
    
    for (const [pattern, count] of patternCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        dominantPattern = pattern;
      }
    }

    const averageConfidence = patternConfidences.get(dominantPattern)! / maxCount;

    return {
      type: this.getPatternType(dominantPattern),
      confidence: averageConfidence
    };
  }

  private createComputeProgram(source: string): WebGLProgram | null {
    const program = this.gl.createProgram();
    if (!program) return null;

    const shader = this.gl.createShader((this.gl as any).COMPUTE_SHADER);
    if (!shader) {
      this.gl.deleteProgram(program);
      return null;
    }

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      this.gl.deleteProgram(program);
      return null;
    }

    this.gl.attachShader(program, shader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program linking error:', this.gl.getProgramInfoLog(program));
      this.gl.deleteShader(shader);
      this.gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  private getPatternType(patternId: number): string {
    const patterns = [
      'No Significant Pattern',
      'Golden Spiral Formation',
      'Strong Uptrend',
      'Strong Downtrend',
      'Moderate Uptrend',
      'Moderate Downtrend',
      'Complex Consolidation',
      'Weak Consolidation'
    ];
    return patterns[patternId] || 'Unknown Pattern';
  }

  public cleanup(): void {
    if (this.priceBuffer) this.gl.deleteBuffer(this.priceBuffer);
    if (this.ratioBuffer) this.gl.deleteBuffer(this.ratioBuffer);
    if (this.patternBuffer) this.gl.deleteBuffer(this.patternBuffer);
    if (this.geometricRatioProgram) this.gl.deleteProgram(this.geometricRatioProgram);
    if (this.patternDetectionProgram) this.gl.deleteProgram(this.patternDetectionProgram);
  }
}

const patternDetector = new GPUPatternDetector();

self.onmessage = async (e: MessageEvent<PatternDetectionMessage>) => {
  try {
    if (e.data.type === 'ANALYZE_PATTERN') {
      const result = await patternDetector.analyzePattern(
        e.data.data.prices,
        e.data.data.windowSize
      );

      self.postMessage({
        type: 'PATTERN_RESULT',
        data: {
          ...result,
          timestamp: e.data.data.timestamp
        }
      });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: (error as Error).message,
      timestamp: e.data.data.timestamp
    });
  }
};

// Cleanup when worker is terminated
self.addEventListener('unload', () => {
  patternDetector.cleanup();
});