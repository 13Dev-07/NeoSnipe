// GPU-accelerated Harmonic Pattern Detection

export const HARMONIC_PATTERN_COMPUTE_SHADER = `#version 310 es
layout(local_size_x = 256) in;

layout(std430, binding = 0) readonly buffer InputData {
    float prices[];
};

layout(std430, binding = 1) writeonly buffer OutputData {
    // [startIndex, endIndex, patternType, confidence, ratio1, ratio2, ratio3, ratio4]
    vec4 patterns[];
};

uniform float u_tolerance;

// Harmonic pattern ratio definitions
const float PHI = 1.618034;
const float PHI_SQUARED = 2.618034;
const float PHI_CUBED = 4.236068;

bool isWithinTolerance(float value, float target, float tolerance) {
    return abs(value - target) <= tolerance * target;
}

float calculateConfidence(float r1, float r2, float r3, float r4, vec4 expectedRatios) {
    float d1 = abs(r1 - expectedRatios.x) / expectedRatios.x;
    float d2 = abs(r2 - expectedRatios.y) / expectedRatios.y;
    float d3 = abs(r3 - expectedRatios.z) / expectedRatios.z;
    float d4 = abs(r4 - expectedRatios.w) / expectedRatios.w;
    
    return 1.0 - (d1 + d2 + d3 + d4) / 4.0;
}

vec4 detectButterfly(float r1, float r2, float r3, float r4) {
    vec4 expectedRatios = vec4(0.786, 0.382, 1.618, 1.27);
    if (isWithinTolerance(r1, expectedRatios.x, u_tolerance) &&
        isWithinTolerance(r2, expectedRatios.y, u_tolerance) &&
        isWithinTolerance(r3, expectedRatios.z, u_tolerance) &&
        isWithinTolerance(r4, expectedRatios.w, u_tolerance)) {
        return vec4(2.0, calculateConfidence(r1, r2, r3, r4, expectedRatios), r1, r2);
    }
    return vec4(0.0);
}

vec4 detectGartley(float r1, float r2, float r3, float r4) {
    vec4 expectedRatios = vec4(0.618, 0.382, 1.272, 0.786);
    if (isWithinTolerance(r1, expectedRatios.x, u_tolerance) &&
        isWithinTolerance(r2, expectedRatios.y, u_tolerance) &&
        isWithinTolerance(r3, expectedRatios.z, u_tolerance) &&
        isWithinTolerance(r4, expectedRatios.w, u_tolerance)) {
        return vec4(3.0, calculateConfidence(r1, r2, r3, r4, expectedRatios), r3, r4);
    }
    return vec4(0.0);
}

vec4 detectBat(float r1, float r2, float r3, float r4) {
    vec4 expectedRatios = vec4(0.382, 0.886, 2.618, 1.618);
    if (isWithinTolerance(r1, expectedRatios.x, u_tolerance) &&
        isWithinTolerance(r2, expectedRatios.y, u_tolerance) &&
        isWithinTolerance(r3, expectedRatios.z, u_tolerance) &&
        isWithinTolerance(r4, expectedRatios.w, u_tolerance)) {
        return vec4(4.0, calculateConfidence(r1, r2, r3, r4, expectedRatios), r1, r4);
    }
    return vec4(0.0);
}

vec4 detectCrab(float r1, float r2, float r3, float r4) {
    vec4 expectedRatios = vec4(0.382, 0.886, 3.618, 1.618);
    if (isWithinTolerance(r1, expectedRatios.x, u_tolerance) &&
        isWithinTolerance(r2, expectedRatios.y, u_tolerance) &&
        isWithinTolerance(r3, expectedRatios.z, u_tolerance) &&
        isWithinTolerance(r4, expectedRatios.w, u_tolerance)) {
        return vec4(5.0, calculateConfidence(r1, r2, r3, r4, expectedRatios), r2, r3);
    }
    return vec4(0.0);
}

void main() {
    uint gid = gl_GlobalInvocationID.x;
    if (gid >= prices.length() - 4) return;
    
    float p1 = prices[gid];
    float p2 = prices[gid + 1];
    float p3 = prices[gid + 2];
    float p4 = prices[gid + 3];
    float p5 = prices[gid + 4];
    
    float r1 = p2 / p1;
    float r2 = p3 / p2;
    float r3 = p4 / p3;
    float r4 = p5 / p4;
    
    // Check for each harmonic pattern
    vec4 butterfly = detectButterfly(r1, r2, r3, r4);
    vec4 gartley = detectGartley(r1, r2, r3, r4);
    vec4 bat = detectBat(r1, r2, r3, r4);
    vec4 crab = detectCrab(r1, r2, r3, r4);
    
    // Store the pattern with highest confidence
    vec4 bestPattern = vec4(0.0);
    float maxConfidence = 0.0;
    
    if (butterfly.y > maxConfidence) {
        maxConfidence = butterfly.y;
        bestPattern = butterfly;
    }
    if (gartley.y > maxConfidence) {
        maxConfidence = gartley.y;
        bestPattern = gartley;
    }
    if (bat.y > maxConfidence) {
        maxConfidence = bat.y;
        bestPattern = bat;
    }
    if (crab.y > maxConfidence) {
        maxConfidence = crab.y;
        bestPattern = crab;
    }
    
    if (maxConfidence > 0.0) {
        patterns[gid] = vec4(
            float(gid),           // startIndex
            float(gid + 4),       // endIndex
            bestPattern.x,        // patternType
            bestPattern.y         // confidence
        );
        patterns[gid + 1] = vec4(
            bestPattern.z,        // ratio1
            bestPattern.w,        // ratio2
            r3,                   // ratio3
            r4                    // ratio4
        );
    }
}
`;

export class HarmonicPatternDetector {
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram;
    private readonly tolerance: number;
    
    constructor(gl: WebGL2RenderingContext, tolerance: number = 0.05) {
        this.gl = gl;
        this.tolerance = tolerance;
        this.program = this.createComputeProgram();
    }
    
    private createComputeProgram(): WebGLProgram {
        const shader = this.gl.createShader(this.gl.COMPUTE_SHADER);
        if (!shader) throw new Error('Failed to create compute shader');
        
        this.gl.shaderSource(shader, HARMONIC_PATTERN_COMPUTE_SHADER);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const info = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error('Compute shader compilation failed: ' + info);
        }
        
        const program = this.gl.createProgram();
        if (!program) throw new Error('Failed to create compute program');
        
        this.gl.attachShader(program, shader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const info = this.gl.getProgramInfoLog(program);
            this.gl.deleteProgram(program);
            throw new Error('Compute program link failed: ' + info);
        }
        
        // Clean up shader after linking
        this.gl.deleteShader(shader);
        
        return program;
    }
    
    public async detectPatterns(prices: Float32Array): Promise<Float32Array> {
        try {
            // Set up storage buffers
            const inputBuffer = this.gl.createBuffer();
            const outputBuffer = this.gl.createBuffer();
            
            if (!inputBuffer || !outputBuffer) {
                throw new Error('Failed to create buffers');
            }
            
            // Input buffer setup
            this.gl.bindBufferBase(this.gl.SHADER_STORAGE_BUFFER, 0, inputBuffer);
            this.gl.bufferData(this.gl.SHADER_STORAGE_BUFFER, prices, this.gl.STATIC_DRAW);
            
            // Output buffer setup - 2 vec4s per potential pattern
            const maxPatterns = Math.ceil(prices.length / 5);
            const outputSize = maxPatterns * 8; // 8 floats per pattern (2 vec4s)
            this.gl.bindBufferBase(this.gl.SHADER_STORAGE_BUFFER, 1, outputBuffer);
            this.gl.bufferData(
                this.gl.SHADER_STORAGE_BUFFER,
                new Float32Array(outputSize),
                this.gl.STATIC_DRAW
            );
            
            // Set uniforms
            this.gl.useProgram(this.program);
            const toleranceLoc = this.gl.getUniformLocation(this.program, 'u_tolerance');
            this.gl.uniform1f(toleranceLoc, this.tolerance);
            
            // Execute compute shader
            this.gl.dispatchCompute(Math.ceil(prices.length / 256), 1, 1);
            this.gl.memoryBarrier(this.gl.SHADER_STORAGE_BARRIER_BIT);
            
            // Read results
            const results = new Float32Array(outputSize);
            this.gl.getBufferSubData(this.gl.SHADER_STORAGE_BUFFER, 0, results);
            
            // Cleanup
            this.gl.deleteBuffer(inputBuffer);
            this.gl.deleteBuffer(outputBuffer);
            
            return results;
            
        } catch (error) {
            console.error('Harmonic pattern detection failed:', error);
            throw error;
        }
    }
    
    public dispose(): void {
        if (this.program) {
            this.gl.deleteProgram(this.program);
        }
    }
}