import { vec2, vec3, mat4 } from 'gl-matrix';
import { SacredGeometryConfig, GeometryData } from '../../../src/types/sacred-geometry';
import { WebGLResourceManager } from '../../../src/utils/webgl-resource-manager';

export interface TorusKnotConfig extends SacredGeometryConfig {
    radius: number;
    tubeRadius: number;
    p: number; // number of twists around the axis
    q: number; // number of times the knot wraps around itself
    segments: number;
    tubeSegments: number;
    colorScheme: 'rainbow' | 'monochrome' | 'golden';
}

export class TorusKnot {
    private geometry: GeometryData;
    private config: TorusKnotConfig;
    private resourceManager: WebGLResourceManager;

    constructor(config: TorusKnotConfig, resourceManager: WebGLResourceManager) {
        this.config = config;
        this.resourceManager = resourceManager;
        this.geometry = this.createGeometry();
    }

    private createGeometry(): GeometryData {
        const { radius, tubeRadius, p, q, segments, tubeSegments } = this.config;
        const vertices: number[] = [];
        const indices: number[] = [];
        const normals: number[] = [];
        const colors: number[] = [];

        // Generate the knot curve
        for (let i = 0; i <= segments; i++) {
            const u = (i / segments) * 2 * Math.PI;
            const [centerPoint, normal, binormal] = this.evaluateTorusKnot(u, p, q, radius);
            
            // Generate tube around the curve
            for (let j = 0; j <= tubeSegments; j++) {
                const v = (j / tubeSegments) * 2 * Math.PI;
                const cos = Math.cos(v);
                const sin = Math.sin(v);

                // Calculate position on tube surface
                const x = centerPoint[0] + tubeRadius * (cos * normal[0] + sin * binormal[0]);
                const y = centerPoint[1] + tubeRadius * (cos * normal[1] + sin * binormal[1]);
                const z = centerPoint[2] + tubeRadius * (cos * normal[2] + sin * binormal[2]);

                vertices.push(x, y, z);
                colors.push(...this.getColor(i * tubeSegments + j));

                // Calculate normal
                const nx = cos * normal[0] + sin * binormal[0];
                const ny = cos * normal[1] + sin * binormal[1];
                const nz = cos * normal[2] + sin * binormal[2];
                normals.push(nx, ny, nz);

                // Generate indices for triangles
                if (i < segments && j < tubeSegments) {
                    const a = i * (tubeSegments + 1) + j;
                    const b = a + 1;
                    const c = (i + 1) * (tubeSegments + 1) + j;
                    const d = c + 1;

                    indices.push(a, b, c);
                    indices.push(b, d, c);
                }
            }
        }

        return {
            vertices: new Float32Array(vertices),
            indices: new Uint16Array(indices),
            normals: new Float32Array(normals),
            colors: new Float32Array(colors),
            type: 'torusKnot'
        };
    }

    private evaluateTorusKnot(u: number, p: number, q: number, radius: number): [vec3, vec3, vec3] {
        // Calculate point on the curve
        const cu = Math.cos(u);
        const su = Math.sin(u);
        const quOverP = q * u / p;
        const cs = Math.cos(quOverP);

        const point: vec3 = [
            radius * (2 + cs) * 0.5 * cu,
            radius * (2 + cs) * 0.5 * su,
            radius * Math.sin(quOverP) * 0.5
        ];

        // Calculate tangent
        const tangent: vec3 = [
            -radius * (2 + cs) * 0.5 * su,
            radius * (2 + cs) * 0.5 * cu,
            radius * 0.5 * q / p * Math.cos(quOverP)
        ];
        vec3.normalize(tangent, tangent);

        // Calculate normal and binormal
        const normal: vec3 = [0, 0, 0];
        const binormal: vec3 = [0, 0, 0];
        
        vec3.cross(normal, [0, 0, 1], tangent);
        vec3.normalize(normal, normal);
        vec3.cross(binormal, tangent, normal);
        vec3.normalize(binormal, binormal);

        return [point, normal, binormal];
    }

    private getColor(index: number): [number, number, number, number] {
        switch (this.config.colorScheme) {
            case 'rainbow':
                const hue = (index * 360) / (this.config.segments * this.config.tubeSegments);
                return this.hslToRgb(hue / 360, 0.7, 0.5, 1.0);
            case 'monochrome':
                return [0.7, 0.7, 0.7, 1.0];
            case 'golden':
                return [0.83, 0.68, 0.21, 1.0];
            default:
                return [1.0, 1.0, 1.0, 1.0];
        }
    }

    private hslToRgb(h: number, s: number, l: number, a: number): [number, number, number, number] {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [r, g, b, a];
    }

    public update(deltaTime: number): void {
        // Implementation for animation updates if needed
    }

    public render(gl: WebGLRenderingContext, projectionMatrix: mat4, viewMatrix: mat4): void {
        // Implementation for rendering the torus knot
    }
}