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
const float TWO_PI = 6.28318530718;
const int CIRCLE_COUNT = 19;
const float GOLDEN_RATIO = 1.61803398875;

// Optimized rotate2D using precomputed sin/cos
vec2 rotate2D(vec2 p, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

// Optimized circle SDF
float circle(vec2 p, vec2 center, float radius) {
    vec2 d = p - center;
    return dot(d, d) - radius * radius; // Squared distance comparison
}

float flowerOfLife(vec2 p) {
    vec2 center = vec2(0.0);
    float radius = 0.1 * u_scale;
    float radius2 = radius * radius; // Pre-compute squared radius
    float d = circle(p, center, radius);
    
    // First ring - unrolled loop for 6 circles
    vec2 baseOffset = vec2(radius * 2.0, 0.0);
    const float angleStep = PI / 3.0;
    
    // Pre-compute sin/cos for the base angles
    float angles[6];
    vec2 offsets[6];
    
    for (int i = 0; i < 6; i++) {
        float angle = float(i) * angleStep;
        offsets[i] = rotate2D(baseOffset, angle);
        d = min(d, circle(p, center + offsets[i], radius));
    }
    
    // Second ring - optimized 12 circles
    baseOffset = vec2(radius * 4.0, 0.0);
    for (int i = 0; i < 6; i++) {
        vec2 offset = rotate2D(baseOffset, float(i) * angleStep);
        d = min(d, circle(p, center + offset, radius));
        offset = rotate2D(baseOffset, float(i) * angleStep + PI/6.0);
        d = min(d, circle(p, center + offset, radius));
    }
    
    return sqrt(d); // Convert back to actual distance
}

void main() {
    vec2 p = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.x, u_resolution.y);
    
    // Combine rotations to reduce trig calculations
    float combinedAngle = u_time * 0.1;
    p = rotate2D(p, combinedAngle);
    
    // Optimize scale animation
    float scale = 1.0 + sin(u_time * 0.2) * 0.1;
    p *= scale;
    p += u_center;
    
    float d = flowerOfLife(p);
    float pattern = smoothstep(0.01, 0.0, d);
    
    // Combine alpha calculations
    pattern *= u_transition;
    
    fragColor = u_color * pattern;
    fragColor.a *= pattern;
}