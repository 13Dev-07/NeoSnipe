import { GeometricRatio, PatternType } from './pattern-types';
import { calculateGoldenRatioAlignment } from './pattern-helper';

export class PatternDetection {
    private readonly MAX_WINDOW_SIZE = 256;
    private readonly MIN_PATTERN_SIZE = 3;
    
    async executeComputeShader(gl: WebGL2RenderingContext, program: WebGLProgram, data: Float32Array, numElements: number): Promise<Float32Array> {
        const workGroupSize = 256;
        const numWorkGroups = Math.ceil(numElements / workGroupSize);
        
        // Create storage buffer for input data
        const inputBuffer = gl.createBuffer();
        gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, inputBuffer);
        gl.bufferData(gl.SHADER_STORAGE_BUFFER, data, gl.STATIC_DRAW);
        gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, 0, inputBuffer);
        
        // Create storage buffer for output
        const outputBuffer = gl.createBuffer();
        gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, outputBuffer);
        gl.bufferData(gl.SHADER_STORAGE_BUFFER, numElements * 4, gl.STATIC_DRAW);
        gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, 1, outputBuffer);
        
        // Dispatch compute shader
        gl.useProgram(program);
        gl.dispatchCompute(numWorkGroups, 1, 1);
        gl.memoryBarrier(gl.SHADER_STORAGE_BARRIER_BIT);
        
        // Read results
        const results = new Float32Array(numElements);
        gl.getBufferSubData(gl.SHADER_STORAGE_BUFFER, 0, results);
        
        // Cleanup
        gl.deleteBuffer(inputBuffer);
        gl.deleteBuffer(outputBuffer);
        
        return results;
    }
    
    interpretResults(results: Float32Array, goldenRatio: number, tolerance: number): PatternType {
        const patterns = new Map<PatternType, number>();
        
        // Analyze consecutive ratios for pattern matches
        for (let i = 0; i < results.length - 2; i++) {
            const ratio1 = results[i];
            const ratio2 = results[i + 1];
            const ratio3 = results[i + 2];
            
            // Check for golden ratio patterns
            if (Math.abs(ratio1 - goldenRatio) <= tolerance) {
                if (Math.abs(ratio2 - goldenRatio) <= tolerance) {
                    patterns.set(PatternType.GOLDEN_SPIRAL, 
                        (patterns.get(PatternType.GOLDEN_SPIRAL) || 0) + 1);
                }
            }
            
            // Check for Fibonacci patterns
            if (Math.abs(ratio1 - 1.618) <= tolerance && 
                Math.abs(ratio2 - 2.618) <= tolerance) {
                patterns.set(PatternType.FIBONACCI_EXTENSION,
                    (patterns.get(PatternType.FIBONACCI_EXTENSION) || 0) + 1);
            }
        }
        
        // Return the most frequent pattern type
        let maxCount = 0;
        let dominantPattern = PatternType.UNKNOWN;
        
        patterns.forEach((count, pattern) => {
            if (count > maxCount) {
                maxCount = count;
                dominantPattern = pattern;
            }
        });
        
        return dominantPattern;
    }
}