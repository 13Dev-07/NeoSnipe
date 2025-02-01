import { vec2, vec3, mat4 } from 'gl-matrix';
import type { SacredGeometryConfig, GeometryData } from '../../../src/types/sacred-geometry';
import { WebGLResourceManager } from '../../../src/utils/webgl-resource-manager';

export interface VesicaPiscisConfig extends SacredGeometryConfig {
    radius: number;
    segments: number;
    overlap: number; // Controls how much the circles overlap (0-1)
    iterations: number; // Number of vesica piscis to chain together
    colorScheme: 'rainbow' | 'monochrome' | 'golden';
}

export class VesicaPiscis {
    private geometry: GeometryData;
    private config: VesicaPiscisConfig;
    private resourceManager: WebGLResourceManager;

    constructor(config: VesicaPiscisConfig, resourceManager: WebGLResourceManager) {
        this.config = config;
        this.resourceManager = resourceManager;
        this.geometry = this.createGeometry();
    }

    private createGeometry(): GeometryData {
        const { radius, segments, overlap, iterations } = this.config;
        const vertices: number[] = [];
        const indices: number[] = [];
        const colors: number[] = [];
        const normals: number[] = [];

        // Calculate the distance between circle centers based on overlap
        const distance = radius * 2 * (1 - overlap);

        for (let i = 0; i < iterations; i++) {
            // Left circle of the pair
            const leftCenterX = i * distance;
            this.addCircle(
                vertices,
                indices,
                colors,
                normals,
                leftCenterX,
                0,
                radius,
                segments,
                i * 2
            );

            // Right circle of the pair
            const rightCenterX = leftCenterX + distance;
            this.addCircle(
                vertices,
                indices,
                colors,
                normals,
                rightCenterX,
                0,
                radius,
                segments,
                i * 2 + 1
            );

            // Add the lens shape (intersection)
            this.addLensShape(
                vertices,
                indices,
                colors,
                normals,
                leftCenterX,
                rightCenterX,
                radius,
                segments,
                i
            );
        }

        return {
            vertices: new Float32Array(vertices),
            indices: new Uint16Array(indices),
            colors: new Float32Array(colors),
            normals: new Float32Array(normals),
            type: 'vesicaPiscis' as const
        };
    }

    private addCircle(
        vertices: number[],
        indices: number[],
        colors: number[],
        normals: number[],
        centerX: number,
        centerY: number,
        radius: number,
        segments: number,
        index: number
    ): void {
        const startIndex = vertices.length / 3;

        // Center point
        vertices.push(centerX, centerY, 0);
        colors.push(...this.getColor(index));
        normals.push(0, 0, 1);

        // Circle points
        for (let i = 0; i <= segments; i++) {
            const angle = (i * Math.PI * 2) / segments;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            vertices.push(x, y, 0);
            colors.push(...this.getColor(index));
            normals.push(0, 0, 1);

            if (i > 0) {
                indices.push(
                    startIndex,
                    startIndex + i,
                    startIndex + i + 1
                );
            }
        }
    }

    private addLensShape(
        vertices: number[],
        indices: number[],
        colors: number[],
        normals: number[],
        x1: number,
        x2: number,
        radius: number,
        segments: number,
        index: number
    ): void {
        const startIndex = vertices.length / 3;
        const centerX = (x1 + x2) / 2;
        const intersectionHeight = Math.sqrt(Math.pow(radius, 2) - Math.pow((x2 - x1) / 2, 2));

        // Add points for the lens shape
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const angle = Math.PI / 2 - Math.acos(1 - 2 * t);
            const x = centerX + radius * Math.cos(angle);
            const y = intersectionHeight * Math.sin(angle);

            vertices.push(x, y, 0);
            colors.push(...this.getColor(index));
            normals.push(0, 0, 1);

            if (i > 0) {
                indices.push(
                    startIndex + i - 1,
                    startIndex + i,
                    startIndex + segments + i
                );
            }

            // Mirror point
            vertices.push(x, -y, 0);
            colors.push(...this.getColor(index));
            normals.push(0, 0, 1);
        }
    }

    private getColor(index: number): [number, number, number, number] {
        switch (this.config.colorScheme) {
            case 'rainbow':
                const hue = (index * 360) / (this.config.iterations * 2);
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
        // Implementation for rendering
    }
}