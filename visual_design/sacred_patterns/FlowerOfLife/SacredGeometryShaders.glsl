// Vertex Shader
#version 300 es

precision highp float;

in vec3 position;
in vec4 instanceOffset;
in vec2 texCoord;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
uniform float goldenRatio;

out vec2 vTexCoord;
out vec3 vPosition;
out float vTime;

in vec3 normal;
out vec3 vNormal;

vNormal = normal;


void main() {
    // Apply golden ratio-based transformation
    float phi = 1.618033988749895;
    float rotation = time * phi;
    mat2 rotMat = mat2(
        cos(rotation), -sin(rotation),
        sin(rotation), cos(rotation)
    );
    
    // Transform vertex position
    vec3 pos = position * instanceOffset.w + instanceOffset.xyz;
    pos.xy = rotMat * pos.xy;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vTexCoord = texCoord;
    vPosition = pos;
    vTime = time;
}
this.initPostProcessing();

// Fragment Shader
#version 300 es

precision highp float;

in vec2 vTexCoord;
in vec3 vPosition;
in float vTime;

uniform float goldenRatio;
uniform vec2 resolution;
uniform vec2 mousePosition;
uniform float interactionStrength;

out vec4 fragColor;

const float PI = 3.14159265359;
const float PHI = 1.618033988749895;
const float TAU = 6.28318530718;
uniform sampler2D noiseTexture;  // Missing uniform declaration

// Sacred geometry helper functions
float vesicaPiscis(vec2 st, float time) {
    vec2 p1 = vec2(0.5 + sin(time) * 0.1, 0.5);
    vec2 p2 = vec2(0.5 - sin(time) * 0.1, 0.5);
    float r = 0.2;
    float d1 = length(st - p1);
    float d2 = length(st - p2);
    return smoothstep(r - 0.01, r, d1) * smoothstep(r - 0.01, r, d2);
}

float flowerOfLife(vec2 st, float time) {
    float pattern = 0.0;
    float r = 0.1;
    
    for(int i = 0; i < 6; i++) {
        float angle = float(i) * PI * 2.0 / 6.0 + time;
        vec2 pos = st - 0.5;
        pos = vec2(
            pos.x * cos(angle) - pos.y * sin(angle),
            pos.x * sin(angle) + pos.y * cos(angle)
        );
        pos += 0.5;
        
        float d = length(pos - vec2(0.5));
        pattern += smoothstep(r - 0.01, r, d) - smoothstep(r, r + 0.01, d);
    }
    
    return pattern;
}

float metatronsCube(vec2 st, float time) {
    float pattern = 0.0;
    
    for(int i = 0; i < 13; i++) {
        float angle = float(i) * PHI * PI + time;
        vec2 pos = st - 0.5;
        pos = vec2(
            pos.x * cos(angle) - pos.y * sin(angle),
            pos.x * sin(angle) + pos.y * cos(angle)
        );
        pos += 0.5;
        pattern += vesicaPiscis(pos, time * 0.5);
    }
    
    return pattern;
}

float sriYantra(vec2 st, float time) {
    float pattern = 0.0;
    int triangles = 9;
    
    for(int i = 0; i < triangles; i++) {
        float scale = 1.0 - float(i) * 0.1;
        float angle = float(i) * PI * 2.0 / float(triangles) + time;
        
        vec2 pos = st - 0.5;
        pos = vec2(
            pos.x * cos(angle) - pos.y * sin(angle),
            pos.x * sin(angle) + pos.y * cos(angle)
        );
        pos = pos * scale + 0.5;
        
        float d = abs(pos.y - 0.5) - 0.1 * scale;
        pattern += smoothstep(0.01, 0.0, d);
    }
    
    return pattern;
}
float tetrahedron(vec3 p, float scale) {
    const float k = sqrt(2.0);
    p *= scale;
    float a = p.x + p.y + p.z - 1.0;
    float b = p.x - p.y - p.z + 1.0;
    float c = -p.x + p.y - p.z + 1.0;
    float d = -p.x - p.y + p.z + 1.0;
    return max(max(max(a,b),c),d);
}

float octahedron(vec3 p, float scale) {
    p *= scale;
    return (abs(p.x) + abs(p.y) + abs(p.z) - 1.0) * 0.57735027;
}

float dodecahedron(vec3 p, float scale) {
    const float phi = 1.618033988749895;
    p *= scale;
    float a = abs(p.x - p.y) - 1.0;
    float b = abs(p.y - p.z) - 1.0;
    float c = abs(p.z - p.x) - 1.0;
    float d = abs(p.x + p.y) - phi;
    float e = abs(p.y + p.z) - phi;
    float f = abs(p.z + p.x) - phi;
    return max(max(max(a,b),c),max(max(d,e),f));
}

float improvedEnergyFlow(vec2 st, float time) {
    float flow = 0.0;
    for(int i = 0; i < 7; i++) {  // Use 7 for its spiritual significance
        float t = time * (1.0 + float(i) * 0.1) * PHI;
        vec2 pos = st - 0.5;
        float angle = t + float(i) * TAU / 7.0;
        pos = vec2(
            pos.x * cos(angle) - pos.y * sin(angle),
            pos.x * sin(angle) + pos.y * cos(angle)
        );
        float spiral = length(pos) - 0.1 * t;
        flow += smoothstep(0.01, 0.0, abs(sin(spiral * 20.0) * 0.1 - spiral));
    }
    return flow;
}

float sacredFrequency(vec2 st, float freq, float time) {
    vec2 pos = st - 0.5;
    float angle = atan(pos.y, pos.x);
    float radius = length(pos);
    float wave = sin(freq * (radius - time * 0.2) * TAU) * 0.5 + 0.5;
    return smoothstep(0.1, 0.0, abs(wave - radius) * 5.0);
}

float calculateLOD() {
    vec3 dFdxPos = dFdx(vPosition);
    vec3 dFdyPos = dFdy(vPosition);
    float maxLength = max(length(dFdxPos), length(dFdyPos));
    return log2(maxLength) * 0.5;
}

vec3 goldenRatioColor(float value, float time) {
    return vec3(
        sin(value * PHI + time) * 0.5 + 0.5,
        sin(value * PHI + time + TAU/3.0) * 0.5 + 0.5,
        sin(value * PHI + time + 2.0*TAU/3.0) * 0.5 + 0.5
    );
}

vec3 calculateNormal(vec3 p, float scale) {
    vec2 e = vec2(1.0, -1.0) * 0.5773 * 0.0005;
    return normalize(
        e.xyy * tetrahedron(p + e.xyy, scale) +
        e.yyx * tetrahedron(p + e.yyx, scale) +
        e.yxy * tetrahedron(p + e.yxy, scale) +
        e.xxx * tetrahedron(p + e.xxx, scale)
    );
}

vec3 calculateLighting(vec3 normal, vec3 color) {
    vec3 lightDir = normalize(vec3(1.0, 1.0, -1.0));
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 ambient = color * 0.3;
    vec3 diffuse = color * diff * 0.7;
    return ambient + diffuse;
}

void main() {
    vec2 st = gl_FragCoord.xy / resolution;
    float time = vTime * 0.5;
    
    float lod = calculateLOD();
    
    // Calculate base patterns
    float flower = lod < 2.0 ? flowerOfLife(st, time) : 0.0;
    float metatron = lod < 3.0 ? metatronsCube(st, time * 0.7) : 0.0;
    float yantra = lod < 2.5 ? sriYantra(st, time * 0.3) : 0.0;
    float energy = improvedEnergyFlow(st, time);
    float soundVis = sacredFrequency(st, 432.0, time);  // 432 Hz, a sacred frequency
    
    // 3D sacred geometry
    vec3 pos = vPosition * 2.0 - 1.0;
    float tetra = tetrahedron(pos, 1.0 + sin(time) * 0.1);
    float octa = octahedron(pos, 1.0 + cos(time * PHI) * 0.1);
    float dodeca = dodecahedron(pos, 1.0 + sin(time * sqrt(PHI)) * 0.1);
    
    // Interactive pattern mixing
    float mouseDist = length(st - mousePosition);
    float interaction = exp(-mouseDist * 4.0) * interactionStrength;
    
    // Combine patterns with golden ratio
    float finalPattern = mix(
        flower,
        mix(metatron, yantra, sin(time * PHI) * 0.5 + 0.5),
        interaction
    ) + energy * 0.2 + soundVis * 0.3;
    
    finalPattern = mix(finalPattern, tetra * octa * dodeca, 0.3);
    
    // Apply colors
    vec3 color = goldenRatioColor(finalPattern, time);
    
    // Add subtle noise
    vec2 noiseCoord = st * PHI + time * 0.1;
    float noise = texture(noiseTexture, noiseCoord).r * 0.1;

    vec3 normal = calculateNormal(pos, 1.0);
    color = calculateLighting(normal, color);
   
    // Final color
    fragColor = vec4(color + noise, 1.0);
}
