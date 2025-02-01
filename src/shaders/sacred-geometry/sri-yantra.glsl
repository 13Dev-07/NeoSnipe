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
const float SQRT3 = 1.7320508075688772;

float triangle(vec2 p, vec2 a, vec2 b, vec2 c) {
    vec2 ab = b - a;
    vec2 bc = c - b;
    vec2 ca = a - c;
    
    vec2 ap = p - a;
    vec2 bp = p - b;
    vec2 cp = p - c;
    
    float d = min(min(
        dot(ap, normalize(vec2(ab.y, -ab.x))),
        dot(bp, normalize(vec2(bc.y, -bc.x))),
        dot(cp, normalize(vec2(ca.y, -ca.x)))
    ));
    
    return d;
}

float sriYantra(vec2 p) {
    float d = 1e10;
    float scale = u_scale * 0.5;
    
    // Central bindu (point)
    d = min(d, length(p) - 0.02 * scale);
    
    // Nine interlocking triangles
    for (int i = 0; i < 9; i++) {
        float angle = float(i) * PI / 4.5;
        float size = scale * (1.0 - float(i) * 0.1);
        
        vec2 a = rotate2D(vec2(0.0, size), angle);
        vec2 b = rotate2D(vec2(size * SQRT3 * 0.5, -size * 0.5), angle);
        vec2 c = rotate2D(vec2(-size * SQRT3 * 0.5, -size * 0.5), angle);
        
        d = min(d, triangle(p, a, b, c));
    }
    
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
    
    float d = sriYantra(p);
    float pattern = smoothstep(0.01, 0.0, d);
    
    // Apply transition effect
    pattern *= u_transition;
    
    vec4 color = mix(vec4(0.0), u_color, pattern);
    color.a *= pattern;
    
    fragColor = color;
}