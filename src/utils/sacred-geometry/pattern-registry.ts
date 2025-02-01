import { WebGLProgram } from 'three';
import { ShaderManager } from '../webgl/shader-manager';

export interface PatternConfig {
  name: string;
  fragmentShader: string;
  vertexShader?: string;
  uniforms: Record<string, any>;
}

export class PatternRegistry {
  private static instance: PatternRegistry;
  private patterns: Map<string, PatternConfig>;
  private shaderManager: ShaderManager;
  
  private constructor(gl: WebGL2RenderingContext) {
    this.patterns = new Map();
    this.shaderManager = new ShaderManager(gl);
    this.registerDefaultPatterns();
  }
  
  public static getInstance(gl: WebGL2RenderingContext): PatternRegistry {
    if (!PatternRegistry.instance) {
      PatternRegistry.instance = new PatternRegistry(gl);
    }
    return PatternRegistry.instance;
  }
  
  public registerPattern(pattern: PatternConfig): void {
    this.patterns.set(pattern.name, pattern);
  }
  
  public getPattern(name: string): WebGLProgram | null {
    const pattern = this.patterns.get(name);
    if (!pattern) {
      return null;
    }
    
    return this.shaderManager.createProgram({
      vertexShader: pattern.vertexShader || this.getDefaultVertexShader(),
      fragmentShader: pattern.fragmentShader,
      uniforms: pattern.uniforms
    });
  }
  
  private registerDefaultPatterns(): void {
    // Register Gartley Pattern
    this.registerPattern({
      name: 'Gartley',
      vertexShader: this.getDefaultVertexShader(),
      fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        varying vec2 v_position;

        void main() {
          vec2 st = v_position * 0.5 + 0.5;
          float ratio = 0.618; // Golden ratio reciprocal
          float pattern = step(ratio, fract(st.x + u_time * 0.1));
          gl_FragColor = vec4(vec3(pattern), 1.0);
        }
      `,
      uniforms: {
        ...this.getDefaultUniforms(),
        u_ratio: { type: '1f', value: 0.618 }
      }
    });

    // Register Butterfly Pattern
    this.registerPattern({
      name: 'Butterfly',
      vertexShader: this.getDefaultVertexShader(),
      fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        varying vec2 v_position;

        void main() {
          vec2 st = v_position * 0.5 + 0.5;
          float ratio = 0.786;
          float pattern = step(ratio, fract(st.x + u_time * 0.1));
          gl_FragColor = vec4(vec3(pattern), 1.0);
        }
      `,
      uniforms: {
        ...this.getDefaultUniforms(),
        u_ratio: { type: '1f', value: 0.786 }
      }
    });

    // Register Wave Pattern
    this.registerPattern({
      name: 'Wave',
      vertexShader: this.getDefaultVertexShader(),
      fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        varying vec2 v_position;

        void main() {
          vec2 st = v_position * 0.5 + 0.5;
          float wave = sin(st.x * 6.28318 + u_time) * 0.5 + 0.5;
          float pattern = step(wave, st.y);
          gl_FragColor = vec4(vec3(pattern), 1.0);
        }
      `,
      uniforms: this.getDefaultUniforms()
    });

    // Register Golden Spiral
    this.registerPattern({
      name: 'Golden Spiral',
      vertexShader: this.getDefaultVertexShader(),
      fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        varying vec2 v_position;

        float goldenRatio = 1.61803398875;

        void main() {
          vec2 st = v_position * 0.5 + 0.5;
          float angle = atan(st.y, st.x);
          float radius = length(st);
          float spiral = fract(log(radius) / log(goldenRatio) + angle / 6.28318);
          float pattern = step(0.5, spiral);
          gl_FragColor = vec4(vec3(pattern), 1.0);
        }
      `,
      uniforms: this.getDefaultUniforms()
    });

    // Register Fibonacci Retracement
    this.registerPattern({
      name: 'Fibonacci Retracement',
      vertexShader: this.getDefaultVertexShader(),
      fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        varying vec2 v_position;

        void main() {
          vec2 st = v_position * 0.5 + 0.5;
          float[] levels = float[](0.236, 0.382, 0.5, 0.618, 0.786);
          float pattern = 0.0;
          
          for(int i = 0; i < 5; i++) {
            pattern += step(abs(st.y - levels[i]), 0.002);
          }
          
          gl_FragColor = vec4(vec3(pattern), 1.0);
        }
      `,
      uniforms: this.getDefaultUniforms()
    });
    this.registerPattern({
      name: 'flowerOfLife',
      fragmentShader: require('../shaders/sacred-geometry/flower-of-life.glsl'),
      uniforms: this.getDefaultUniforms()
    });
    
    this.registerPattern({
      name: 'sriYantra',
      fragmentShader: require('../shaders/sacred-geometry/sri-yantra.glsl'),
      uniforms: this.getDefaultUniforms()
    });
    
    this.registerPattern({
      name: 'vesicaPiscis',
      fragmentShader: require('../shaders/sacred-geometry/vesica-piscis.glsl'),
      uniforms: this.getDefaultUniforms()
    });
    
    this.registerPattern({
      name: 'metatronsCube',
      fragmentShader: require('../shaders/sacred-geometry/metatrons-cube.glsl'),
      uniforms: this.getDefaultUniforms()
    });
  }
  
  private getDefaultVertexShader(): string {
    return `
      attribute vec2 a_position;
      varying vec2 v_position;

      void main() {
        v_position = a_position;
        gl_Position = vec4(a_position, 0, 1);
      }
    `;
    return `#version 300 es
    precision highp float;
    
    in vec2 a_position;
    out vec2 v_position;
    
    uniform mat4 u_modelViewProjection;
    
    void main() {
        v_position = a_position;
        gl_Position = u_modelViewProjection * vec4(a_position, 0.0, 1.0);
    }
    in vec4 a_position;
    void main() {
      gl_Position = a_position;
    }`;
  }
  
  private getDefaultUniforms(): Record<string, any> {
    return {
      u_time: { type: '1f', value: 0 },
      u_resolution: { type: '2f', value: [1.0, 1.0] },
      u_scale: { type: '1f', value: 1.0 },
      u_opacity: { type: '1f', value: 1.0 }
    };
    return {
      u_resolution: [0, 0],
      u_time: 0,
      u_scale: 1,
      u_center: [0, 0],
      u_color: [1, 1, 1, 1],
      u_transition: 1
    };
  }
  
  public cleanup(): void {
    this.shaderManager.cleanup();
    this.patterns.clear();
  }
}