import { GeometryOptimizer } from '../../src/utils/optimizations/geometry-optimizer';
import { ShaderComplexityAnalyzer } from '../../src/utils/optimizations/shader-complexity-analyzer';

describe('Performance Optimizations', () => {
  describe('GeometryOptimizer', () => {
    const optimizer = new GeometryOptimizer();
    
    test('should deduplicate vertices', () => {
      const geometry = {
        positions: [
          0, 0, 0,  // Vertex 0
          1, 0, 0,  // Vertex 1
          0, 0, 0,  // Duplicate of Vertex 0
        ],
        indices: [0, 1, 2]
      };

      const optimized = optimizer.optimizeGeometry(geometry);
      
      expect(optimized.positions.length).toBe(6); // Should have 2 unique vertices (6 components)
      expect(optimized.indices).toEqual([0, 1, 0]); // Third index should point to first vertex
    });

    test('should maintain attributes during optimization', () => {
      const geometry = {
        positions: [0, 0, 0, 1, 0, 0],
        normals: [0, 1, 0, 0, 1, 0],
        uvs: [0, 0, 1, 0]
      };

      const optimized = optimizer.optimizeGeometry(geometry);
      
      expect(optimized.normals).toBeDefined();
      expect(optimized.uvs).toBeDefined();
      expect(optimized.positions.length).toBe(geometry.positions.length);
    });
  });

  describe('ShaderComplexityAnalyzer', () => {
    const analyzer = new ShaderComplexityAnalyzer();
    
    test('should calculate shader complexity', () => {
      const shaderConfig = {
        vertexShader: `
          void main() {
            vec4 pos = position;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * pos;
          }
        `,
        fragmentShader: `
          void main() {
            if (lighting) {
              vec4 texColor = texture2D(colorMap, vUv);
              gl_FragColor = texColor * lightIntensity;
            }
          }
        `,
        uniforms: {
          projectionMatrix: { value: null },
          viewMatrix: { value: null }
        }
      };

      const complexity = analyzer.analyzeShaderComplexity(shaderConfig);
      expect(complexity).toBeGreaterThan(0);
    });
  });
});