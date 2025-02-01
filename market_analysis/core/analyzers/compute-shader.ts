export const GEOMETRIC_RATIO_COMPUTE = `#version 310 es

layout(local_size_x = 256) in;

layout(std430, binding = 0) readonly buffer InputBuffer {
    float data[];
} input_data;

layout(std430, binding = 1) buffer OutputBuffer {
    float ratios[];
} output_data;

layout(std140, binding = 2) uniform Parameters {
    float goldenRatio;
    float tolerance;
} params;

void main() {
    uint index = gl_GlobalInvocationID.x;
    if (index >= input_data.data.length - 1) return;
    
    float current = input_data.data[index + 1];
    float previous = input_data.data[index];
    
    output_data.ratios[index] = current / previous;
}`;

export const PATTERN_DETECTION_COMPUTE = `#version 310 es

layout(local_size_x = 256) in;

layout(std430, binding = 0) readonly buffer InputBuffer {
    float ratios[];
} input_ratios;

layout(std430, binding = 1) buffer OutputBuffer {
    float patterns[];
} output_patterns;

layout(std140, binding = 2) uniform Parameters {
    float goldenRatio;
    float significanceThreshold;
    int windowSize;
} params;

bool isGoldenRatio(float ratio) {
    return abs(ratio - params.goldenRatio) <= 0.03;
}

void main() {
    uint index = gl_GlobalInvocationID.x;
    if (index >= input_ratios.ratios.length - params.windowSize) return;
    
    float patternConfidence = 0.0;
    int goldenCount = 0;
    
    for (int i = 0; i < params.windowSize; i++) {
        if (isGoldenRatio(input_ratios.ratios[index + i])) {
            goldenCount++;
        }
    }
    
    patternConfidence = float(goldenCount) / float(params.windowSize);
    output_patterns.patterns[index] = patternConfidence > params.significanceThreshold ? 1.0 : 0.0;
}`;