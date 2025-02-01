import { ShaderConfig } from '../../types/sacred-geometry';

export class ShaderComplexityAnalyzer {
  private static readonly COMPLEXITY_WEIGHTS = {
    ARITHMETIC_OPS: 1,
    TEXTURE_READS: 2,
    CONTROL_FLOW: 3,
    FUNCTION_CALLS: 2
  };

  analyzeShaderComplexity(config: ShaderConfig): number {
    const vertexComplexity = this.analyzeShaderSource(config.vertexShader);
    const fragmentComplexity = this.analyzeShaderSource(config.fragmentShader);
    
    return vertexComplexity + fragmentComplexity;
  }

  private analyzeShaderSource(source: string): number {
    let complexity = 0;
    
    // Count arithmetic operations
    const arithmeticOps = (source.match(/[\+\-\*\/]/g) || []).length;
    complexity += arithmeticOps * this.COMPLEXITY_WEIGHTS.ARITHMETIC_OPS;
    
    // Count texture reads
    const textureReads = (source.match(/texture[2|3]D|textureCube/g) || []).length;
    complexity += textureReads * this.COMPLEXITY_WEIGHTS.TEXTURE_READS;
    
    // Count control flow statements
    const controlFlow = (source.match(/if|for|while/g) || []).length;
    complexity += controlFlow * this.COMPLEXITY_WEIGHTS.CONTROL_FLOW;
    
    // Count function calls
    const functionCalls = (source.match(/\w+\s*\(/g) || []).length;
    complexity += functionCalls * this.COMPLEXITY_WEIGHTS.FUNCTION_CALLS;
    
    return complexity;
  }
}

export default ShaderComplexityAnalyzer;