// GPU Compute Shaders for Pattern Recognition
export const GEOMETRIC_RATIO_COMPUTE_SHADER = `#version 310 es
layout(local_size_x = 256) in;

layout(std430, binding = 0) readonly buffer InputData {
    float prices[];
};

layout(std430, binding = 1) writeonly buffer OutputData {
    float ratios[];
};

uniform float u_goldenRatio;
uniform float u_tolerance;

void main() {
    uint gid = gl_GlobalInvocationID.x;
    if (gid >= prices.length() - 1) return;
    
    float currentPrice = prices[gid];
    float nextPrice = prices[gid + 1];
    
    // Calculate geometric ratio
    float ratio = nextPrice / currentPrice;
    
    // Store computed ratio
    ratios[gid] = ratio;
}
`;

export const PATTERN_DETECTION_COMPUTE_SHADER = `#version 310 es
layout(local_size_x = 256) in;

layout(std430, binding = 0) readonly buffer InputRatios {
    float ratios[];
};

layout(std430, binding = 1) writeonly buffer OutputPatterns {
    // Each pattern is represented by 4 floats:
    // [startIndex, endIndex, patternType, confidence]
    vec4 patterns[];
};

uniform float u_goldenRatio;
uniform float u_tolerance;

bool isGoldenRatio(float ratio) {
    return abs(ratio - u_goldenRatio) <= u_tolerance;
}

void main() {
    uint gid = gl_GlobalInvocationID.x;
    if (gid >= ratios.length() - 3) return;
    
    float r1 = ratios[gid];
    float r2 = ratios[gid + 1];
    float r3 = ratios[gid + 2];
    
    // Check for golden spiral pattern
    if (isGoldenRatio(r1) && isGoldenRatio(r2) && isGoldenRatio(r3)) {
        float confidence = 1.0 - (
            abs(r1 - u_goldenRatio) +
            abs(r2 - u_goldenRatio) +
            abs(r3 - u_goldenRatio)
        ) / (3.0 * u_tolerance);
        
        patterns[gid] = vec4(
            float(gid),
            float(gid + 3),
            1.0,  // Pattern type: GOLDEN_SPIRAL
            confidence
        );
    }
}
`;

export class ComputeShaderManager {
    private gl: WebGL2RenderingContext;
    private geometricRatioProgram: WebGLProgram;
    private patternDetectionProgram: WebGLProgram;
    
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.geometricRatioProgram = this.createComputeProgram(GEOMETRIC_RATIO_COMPUTE_SHADER);
        this.patternDetectionProgram = this.createComputeProgram(PATTERN_DETECTION_COMPUTE_SHADER);
    }
    
    private createComputeProgram(shaderSource: string): WebGLProgram {
        const shader = this.gl.createShader(this.gl.COMPUTE_SHADER);
        if (!shader) throw new Error('Failed to create compute shader');
        
        this.gl.shaderSource(shader, shaderSource);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const info = this.gl.getShaderInfoLog(shader);
            throw new Error('Compute shader compilation failed: ' + info);
        }
        
        const program = this.gl.createProgram();
        if (!program) throw new Error('Failed to create compute program');
        
        this.gl.attachShader(program, shader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const info = this.gl.getProgramInfoLog(program);
            throw new Error('Compute program link failed: ' + info);
        }
        
        return program;
    }
    
    executeGeometricRatioComputation(data: Float32Array): Float32Array {
        // Set up storage buffers
        const inputBuffer = this.gl.createBuffer();
        const outputBuffer = this.gl.createBuffer();
        
        this.gl.bindBufferBase(this.gl.SHADER_STORAGE_BUFFER, 0, inputBuffer);
        this.gl.bufferData(this.gl.SHADER_STORAGE_BUFFER, data, this.gl.STATIC_DRAW);
        
        this.gl.bindBufferBase(this.gl.SHADER_STORAGE_BUFFER, 1, outputBuffer);
        this.gl.bufferData(
            this.gl.SHADER_STORAGE_BUFFER,
            new Float32Array(data.length - 1),
            this.gl.STATIC_DRAW
        );
        
        // Execute compute shader
        this.gl.useProgram(this.geometricRatioProgram);
        this.gl.dispatchCompute(Math.ceil(data.length / 256), 1, 1);
        this.gl.memoryBarrier(this.gl.SHADER_STORAGE_BARRIER_BIT);
        
        // Read results
        const results = new Float32Array(data.length - 1);
        this.gl.getBufferSubData(this.gl.SHADER_STORAGE_BUFFER, 0, results);
        
        // Cleanup
        this.gl.deleteBuffer(inputBuffer);
        this.gl.deleteBuffer(outputBuffer);
        
        return results;
    }
    
    executePatternDetection(ratios: Float32Array): Float32Array {
        // Set up storage buffers
        const inputBuffer = this.gl.createBuffer();
        const outputBuffer = this.gl.createBuffer();
        
        this.gl.bindBufferBase(this.gl.SHADER_STORAGE_BUFFER, 0, inputBuffer);
        this.gl.bufferData(this.gl.SHADER_STORAGE_BUFFER, ratios, this.gl.STATIC_DRAW);
        
        const maxPatterns = Math.ceil(ratios.length / 4);
        this.gl.bindBufferBase(this.gl.SHADER_STORAGE_BUFFER, 1, outputBuffer);
        this.gl.bufferData(
            this.gl.SHADER_STORAGE_BUFFER,
            new Float32Array(maxPatterns * 4),
            this.gl.STATIC_DRAW
        );
        
        // Execute compute shader
        this.gl.useProgram(this.patternDetectionProgram);
        this.gl.dispatchCompute(Math.ceil(ratios.length / 256), 1, 1);
        this.gl.memoryBarrier(this.gl.SHADER_STORAGE_BARRIER_BIT);
        
        // Read results
        const results = new Float32Array(maxPatterns * 4);
        this.gl.getBufferSubData(this.gl.SHADER_STORAGE_BUFFER, 0, results);
        
        // Cleanup
        this.gl.deleteBuffer(inputBuffer);
        this.gl.deleteBuffer(outputBuffer);
        
        return results;
    }
}