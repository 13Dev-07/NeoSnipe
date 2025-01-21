import { ShaderConfig } from '../types/sacred-geometry';

export const sriYantraShader: ShaderConfig = {
  defines: {
    USE_SACRED_GEOMETRY: '1',
    SRI_YANTRA: '1'
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
      pos.z += sin(time * phi + length(pos.xy)) * 0.05;
      
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
    
    float triangle(vec2 p, float size) {
      vec2 q = abs(p);
      return max(q.x * 0.866025 + p.y * 0.5, -p.y * 0.5) - size * 0.5;
    }
    
    float sriYantra(vec2 p, float size) {
      float pattern = 0.0;
      
      // Center bindu (dot)
      float d = length(p);
      pattern += smoothstep(0.05, 0.0, d);
      
      // Nine interlocking triangles
      for (float i = 0.0; i < 9.0; i++) {
        float angle = i * PI / 4.5;
        float scale = 0.2 + i * 0.1;
        vec2 offset = vec2(cos(angle), sin(angle)) * scale;
        
        // Upward triangle
        float t1 = triangle(p - offset, size * scale);
        pattern += smoothstep(0.01, 0.0, t1);
        
        // Downward triangle
        float t2 = triangle(p + offset, size * scale);
        pattern += smoothstep(0.01, 0.0, t2);
      }
      
      // Outer circles
      for (float i = 0.0; i < 3.0; i++) {
        float radius = 0.7 + i * 0.15;
        pattern += smoothstep(0.01, 0.0, abs(d - radius));
      }
      
      return pattern;
    }
    
    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      
      float pattern = sriYantra(p, 0.5);
      pattern *= sin(time * PHI) * 0.5 + 0.5;
      
      vec3 color = mix(baseColor, vColor.rgb, pattern) * intensity;
      float alpha = pattern * vColor.a;
      
      gl_FragColor = vec4(color, alpha);
    }
  `
};