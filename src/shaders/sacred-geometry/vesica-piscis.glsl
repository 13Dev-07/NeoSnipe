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

float circle(vec2 p, vec2 center, float radius) {
    return length(p - center) - radius;
}

float vesicaPiscis(vec2 p) {
    float radius = 0.3 * u_scale;
    float d = 1e10;
    
    // Two overlapping circles
    vec2 offset = vec2(radius * 0.5, 0.0);
    d = min(d, circle(p, -offset, radius));
    d = min(d, circle(p, offset, radius));
    
    return d;
}

vec2 rotate2D(vec2 p, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
    vec2 p = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.x, u_resolution.y);
    p = rotate2D(p, u_time * 0.1);
    p *= 1.0 + sin(u_time * 0.2) * 0.1;
    p += u_center;
    
    float d = vesicaPiscis(p);
    float pattern = smoothstep(0.01, 0.0, d);
    
    // Apply transition effect
    pattern *= u_transition;
    
    vec4 color = mix(vec4(0.0), u_color, pattern);
    color.a *= pattern;
    
    fragColor = color;
}