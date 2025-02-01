import { vec2, vec3 } from 'gl-matrix';
import { SacredPatternType } from './pattern-types';

export interface GeometryData {
    type?: SacredPatternType;
    metadata?: {
        vertexCount: number;
        triangleCount: number;
        optimizationLevel: number;
        creationTime: number;
        lastModified: number;
    };
    vertices: Float32Array;
    normals: Float32Array;
    indices?: Uint16Array;
    uvs?: Float32Array;
    tangents?: Float32Array;
    colors?: Float32Array;
    bounds?: {
        min: vec3;
        max: vec3;
    };
}