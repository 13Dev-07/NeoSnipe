import { vec2, vec3, mat4 } from 'gl-matrix';
import { SacredGeometryConfig, GeometryData } from '../../../src/types/sacred-geometry';
import { WebGLResourceManager } from '../../../src/utils/webgl-resource-manager';

export interface SeedOfLifeConfig extends SacredGeometryConfig {
    radius: number;
    segments: number;
    innerCircles: number;
    colorScheme: 'rainbow' | 'monochrome' | 'golden';
}

export class SeedOfLife {
    private geometry: GeometryData;
    private config: SeedOfLifeConfig;
    private resourceManager: WebGLResourceManager;

    constructor(config: SeedOfLifeConfig, resourceManager: WebGLResourceManager) {
        this.config = config;
        this.resourceManager = resourceManager;
        this.geometry = this.createGeometry();
    }

    private createGeometry(): GeometryData {
        const { radius, segments, innerCircles } = this.config;
        const vertices: number[] = [];
        const indices: number[] = [];
        const colors: number[] = [];

        // Center circle
        this.addCircle(vertices, indices, colors, 0, 0, radius, segments);

        // Surrounding circles
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            this.addCircle(vertices, indices, colors, x, y, radius, segments);
        }

        return {
            vertices: new Float32Array(vertices),
            indices: new Uint16Array(indices),
            colors: new Float32Array(colors),
            normals: new Float32Array(vertices.length),
            type: 'seedOfLife'
        };
    }

    private addCircle(
        vertices: number[],
        indices: number[],
        colors: number[],
        centerX: number,
        centerY: number,
        radius: number,
        segments: number
    ): void {
        const startIndex = vertices.length / 3;

        // Center point
        vertices.push(centerX, centerY, 0);
        colors.push(...this.getColor(0));

        // Circle points
        for (let i = 0; i <= segments; i++) {
            const angle = (i * Math.PI * 2) / segments;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            vertices.push(x, y, 0);
            colors.push(...this.getColor(i));

            if (i > 0) {
                indices.push(
                    startIndex,
                    startIndex + i,
                    startIndex + i + 1
                );
            }
        }
    }

    private getColor(index: number): [number, number, number, number] {
        switch (this.config.colorScheme) {
            case 'rainbow':
                const hue = (index * 360) / this.config.segments;
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
        // Implementation for animation updates
    }

    public render(gl: WebGLRenderingContext, projectionMatrix: mat4, viewMatrix: mat4): void {
        // Implementation for rendering
    }
}