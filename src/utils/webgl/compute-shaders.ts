export const GEOMETRIC_RATIO_COMPUTE = `#version 310 es
layout(local_size_x = 256) in;

layout(std430, binding = 0) buffer PriceData {
    float prices[];
};

layout(std430, binding = 1) buffer ResultData {
    float ratios[];
    float significance[];
};

uniform float goldenRatio;

void main() {
    uint index = gl_GlobalInvocationID.x;
    if (index >= prices.length - 1) return;
    
    float current = prices[index + 1];
    float previous = prices[index];
    
    // Calculate ratio
    float ratio = current / previous;
    ratios[index] = ratio;
    
    // Calculate significance
    float volatility = abs((current - previous) / previous);
    float goldenRatioAlignment = abs(ratio - goldenRatio);
    significance[index] = (1.0 / (1.0 + goldenRatioAlignment)) * volatility;
}`;

export const PATTERN_DETECTION_COMPUTE = `#version 310 es
layout(local_size_x = 256) in;

layout(std430, binding = 0) buffer RatioData {
    float ratios[];
    float significance[];
};

layout(std430, binding = 1) buffer PatternData {
    // Pattern type indicators:
    // 0 = No pattern
    // 1 = Golden Spiral
    // 2 = Strong Uptrend
    // 3 = Strong Downtrend
    // 4 = Moderate Uptrend
    // 5 = Moderate Downtrend
    // 6 = Complex Consolidation
    // 7 = Weak Consolidation
    int patterns[];
    float confidence[];
};

uniform float goldenRatio;
uniform float significanceThreshold;
uniform int windowSize;

shared float localRatios[gl_WorkGroupSize.x];
shared float localSignificance[gl_WorkGroupSize.x];

void main() {
    uint gid = gl_GlobalInvocationID.x;
    uint lid = gl_LocalInvocationID.x;
    
    if (gid >= ratios.length - windowSize + 1) return;
    
    // Load data into shared memory
    localRatios[lid] = ratios[gid];
    localSignificance[lid] = significance[gid];
    barrier();
    
    // Skip if below significance threshold
    if (localSignificance[lid] < significanceThreshold) {
        patterns[gid] = 0;
        confidence[gid] = 0.0;
        return;
    }
    
    // Check for golden spiral pattern
    float goldenSpiralCount = 0.0;
    float trendStrength = 0.0;
    int directionChanges = 0;
    bool isUptrend = true;
    
    for (int i = 0; i < windowSize && (gid + i) < ratios.length; i++) {
        float ratio = ratios[gid + i];
        
        // Check golden ratio alignment
        if (abs(ratio - goldenRatio) < 0.03) {
            goldenSpiralCount += 1.0;
        }
        
        // Calculate trend
        if (i > 0) {
            if ((ratio > 1.0 && ratios[gid + i - 1] < 1.0) ||
                (ratio < 1.0 && ratios[gid + i - 1] > 1.0)) {
                directionChanges++;
            }
        }
        
        trendStrength += abs(ratio - 1.0);
    }
    
    trendStrength /= float(windowSize);
    float patternComplexity = float(directionChanges) / float(windowSize);
    
    // Determine pattern type
    if (goldenSpiralCount >= 3.0) {
        patterns[gid] = 1; // Golden Spiral
        confidence[gid] = goldenSpiralCount / float(windowSize);
    }
    else if (trendStrength > 0.08) { // Strong trend
        patterns[gid] = localRatios[lid] > 1.0 ? 2 : 3;
        confidence[gid] = trendStrength;
    }
    else if (trendStrength > 0.05) { // Moderate trend
        patterns[gid] = localRatios[lid] > 1.0 ? 4 : 5;
        confidence[gid] = trendStrength;
    }
    else if (patternComplexity > 0.7) {
        patterns[gid] = 6; // Complex Consolidation
        confidence[gid] = patternComplexity;
    }
    else {
        patterns[gid] = 7; // Weak Consolidation
        confidence[gid] = 1.0 - patternComplexity;
    }
}`;

export const GEOMETRY_OPTIMIZATION_COMPUTE = `#version 310 es
layout(local_size_x = 256) in;

layout(std430, binding = 0) buffer VertexData {
    vec4 vertices[];
};

layout(std430, binding = 1) buffer OptimizedData {
    vec4 optimizedVertices[];
    int vertexCount;
};

uniform float epsilon;

shared vec4 localVertices[gl_WorkGroupSize.x];
shared bool isDuplicate[gl_WorkGroupSize.x];

void main() {
    uint gid = gl_GlobalInvocationID.x;
    uint lid = gl_LocalInvocationID.x;
    
    if (gid >= vertices.length) return;
    
    localVertices[lid] = vertices[gid];
    isDuplicate[lid] = false;
    barrier();
    
    // Check for duplicates
    for (uint i = 0; i < lid; i++) {
        vec4 diff = localVertices[lid] - localVertices[i];
        if (length(diff) < epsilon) {
            isDuplicate[lid] = true;
            break;
        }
    }
    barrier();
    
    if (!isDuplicate[lid]) {
        int index = atomicAdd(vertexCount, 1);
        optimizedVertices[index] = localVertices[lid];
    }
}`;