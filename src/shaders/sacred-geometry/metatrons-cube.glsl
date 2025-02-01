#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scale;
uniform vec2 u_center;
uniform vec4 u_color;
uniform float u_transition;

out vec4 fragColor;

const float PI = 3.14159265359;
const float PHI = 1.61803398875;

vec2 rotate2D(vec2 p, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

float line(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

float circle(vec2 p, vec2 center, float radius) {
    return length(p - center) - radius;
}

vec2[13] calculateVertices(float scale) {
    vec2[13] vertices;
    float r = 0.1 * scale; // Base radius
    
    // Center point
    vertices[0] = vec2(0.0);
    
    // Inner circle vertices
    for(int i = 0; i < 6; i++) {
        float angle = float(i) * PI / 3.0;
        vertices[i + 1] = rotate2D(vec2(0.0, r * 2.0), angle);
    }
    
    // Outer circle vertices
    for(int i = 0; i < 6; i++) {
        float angle = float(i) * PI / 3.0 + PI / 6.0;
        vertices[i + 7] = rotate2D(vec2(0.0, r * 4.0), angle);
    }
    
    return vertices;
}

float metatronsCube(vec2 p) {
    float d = 1e10;
    float scale = u_scale;
    vec2[13] vertices = calculateVertices(scale);
    
    // Draw circles at each vertex
    for(int i = 0; i < 13; i++) {
        d = min(d, circle(p, vertices[i], 0.01 * scale));
    }
    
    // Draw connecting lines
    for(int i = 1; i < 7; i++) {
        // Connect to center
        d = min(d, line(p, vertices[0], vertices[i]));
        
        // Connect to adjacent inner vertices
        d = min(d, line(p, vertices[i], vertices[i < 6 ? i + 1 : 1]));
        
        // Connect to outer vertices
        d = min(d, line(p, vertices[i], vertices[i + 6]));
        d = min(d, line(p, vertices[i], vertices[i < 6 ? i + 7 : 7]));
    }
    
    // Connect outer vertices
    for(int i = 7; i < 13; i++) {
        d = min(d, line(p, vertices[i], vertices[i < 12 ? i + 1 : 7]));
    }
    
    return d;
}

void main() {
    vec2 p = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.x, u_resolution.y);
    p = rotate2D(p, u_time * 0.1);
    p *= 1.0 + sin(u_time * 0.2) * 0.1;
    p += u_center;
    
    float d = metatronsCube(p);
    float pattern = smoothstep(0.004, 0.0, d);
    
    // Apply transition effect
    pattern *= u_transition;
    
    // Apply golden ratio-based color modulation
    vec4 baseColor = u_color;
    baseColor *= 0.8 + 0.2 * sin(u_time * PHI);
    
    vec4 color = mix(vec4(0.0), baseColor, pattern);
    color.a *= pattern;
    
    fragColor = color;
}