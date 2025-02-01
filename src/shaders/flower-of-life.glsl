import { ShaderConfig } from '../types/sacred-geometry';

const shaderConfig: ShaderConfig = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec2 resolution;
    uniform float intensity;
    uniform vec3 baseColor;
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      vec3 color = baseColor;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  defines: {
    USE_SACRED_GEOMETRY: '1',
    FLOWER_OF_LIFE: '1'
  },
  vertexShader: `
    attribute vec3 position;
    attribute vec2 uv;
    attribute vec4 color;
    
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform float time;
    
    varying vec2 vUv;
    varying vec4 vColor;
    
    void main() {
      vUv = uv;
      vColor = color;
      
      // Animate position using golden ratio
      float phi = 1.618033988749895;
      vec3 pos = position;
      pos.z += sin(time * phi + length(pos.xy)) * 0.1;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    
    uniform float time;
    uniform vec3 baseColor;
    uniform float intensity;
    
    varying vec2 vUv;
    varying vec4 vColor;
    
    #define PHI 1.618033988749895
    #define PI 3.141592653589793
    
    float flowerOfLife(vec2 p, float radius) {
      float pattern = 0.0;
      
      // Center circle
      float d = length(p);
      pattern += smoothstep(radius + 0.01, radius - 0.01, d);
      
      // Surrounding circles
      for (float i = 0.0; i < 6.0; i++) {
        float angle = i * PI / 3.0;
        vec2 offset = radius * vec2(cos(angle), sin(angle));
        float d = length(p - offset);
        pattern += smoothstep(radius + 0.01, radius - 0.01, d);
      }
      
      return pattern;
    }
    
    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      
      float pattern = flowerOfLife(p, 0.5);
      pattern *= sin(time * PHI) * 0.5 + 0.5;
      
      vec3 color = mix(baseColor, vColor.rgb, pattern) * intensity;
      float alpha = pattern * vColor.a;
      
      gl_FragColor = vec4(color, alpha);
    }
  `
};

export default shaderConfig;