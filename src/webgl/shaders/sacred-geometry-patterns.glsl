// Sacred Geometry Pattern Shaders

// Common utilities
#version 300 es
precision highp float;

// Common uniforms
uniform float time;
uniform vec2 resolution;
uniform vec3 baseColor;
uniform float intensity;

// Shared functions
float phi = 1.61803398874989484820459;  // Golden ratio
float pi = 3.14159265359;

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdLine(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

// Metatron's Cube Pattern
vec4 metatronsCube(vec2 uv) {
    vec4 color = vec4(0.0);
    float size = 0.5;
    
    // Create central hexagon
    for (int i = 0; i < 6; i++) {
        float angle = float(i) * pi / 3.0;
        vec2 pos = vec2(cos(angle), sin(angle)) * size;
        float d = sdLine(uv, pos, vec2(cos(angle + pi/3.0), sin(angle + pi/3.0)) * size);
        color += vec4(baseColor, 1.0) * (1.0 - smoothstep(0.0, 0.02, d));
    }
    
    // Add internal circles
    for (int i = 0; i < 7; i++) {
        float angle = float(i) * pi / 3.0;
        vec2 pos = vec2(cos(angle), sin(angle)) * size * 0.5;
        float d = sdCircle(uv - pos, size * 0.2);
        color += vec4(baseColor, 1.0) * (1.0 - smoothstep(0.0, 0.02, d));
    }
    
    return color;
}

// Vesica Piscis Pattern
vec4 vesicaPiscis(vec2 uv) {
    vec4 color = vec4(0.0);
    float size = 0.5;
    
    // Create two overlapping circles
    float d1 = sdCircle(uv - vec2(-size * 0.5, 0.0), size);
    float d2 = sdCircle(uv - vec2(size * 0.5, 0.0), size);
    
    color += vec4(baseColor, 1.0) * (1.0 - smoothstep(0.0, 0.02, d1));
    color += vec4(baseColor, 1.0) * (1.0 - smoothstep(0.0, 0.02, d2));
    
    // Add golden ratio proportions
    float vesicaWidth = size * (1.0 / phi);
    vec2 vesicaCenter = vec2(0.0);
    float vesicaHeight = size * sqrt(3.0);
    
    return color;
}

// Flower of Life Pattern
vec4 flowerOfLife(vec2 uv) {
    vec4 color = vec4(0.0);
    float size = 0.3;
    
    // Create central circle
    float d = sdCircle(uv, size);
    color += vec4(baseColor, 1.0) * (1.0 - smoothstep(0.0, 0.02, d));
    
    // Create surrounding circles
    for (int i = 0; i < 6; i++) {
        float angle = float(i) * pi / 3.0;
        vec2 pos = vec2(cos(angle), sin(angle)) * size;
        d = sdCircle(uv - pos, size);
        color += vec4(baseColor, 1.0) * (1.0 - smoothstep(0.0, 0.02, d));
    }
    
    return color;
}

// Main fragment shader
out vec4 fragColor;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
    
    vec4 color = vec4(0.0);
    
    // Blend different patterns based on time
    float t = time * 0.5;
    float blend = fract(t);
    int pattern = int(floor(t)) % 3;
    
    if (pattern == 0) {
        color = mix(metatronsCube(uv), vesicaPiscis(uv), blend);
    } else if (pattern == 1) {
        color = mix(vesicaPiscis(uv), flowerOfLife(uv), blend);
    } else {
        color = mix(flowerOfLife(uv), metatronsCube(uv), blend);
    }
    
    // Apply intensity and animation effects
    color *= intensity;
    color += vec4(baseColor * 0.2, 1.0) * (sin(time) * 0.5 + 0.5);
    
    fragColor = color;
}