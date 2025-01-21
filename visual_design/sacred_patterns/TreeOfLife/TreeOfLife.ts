import { vec2, vec3, mat4 } from 'gl-matrix';
import { SacredGeometryConfig, GeometryData } from '../../../src/types/sacred-geometry';
import { WebGLResourceManager } from '../../../src/utils/webgl-resource-manager';

export interface TreeOfLifeConfig extends SacredGeometryConfig {
    sphereRadius: number;
    pathWidth: number;
    sphereSegments: number;
    showPaths: boolean;
    showLabels: boolean;
    colorScheme: 'rainbow' | 'monochrome' | 'golden' | 'traditional';
}

interface Sephirah {
    position: vec2;
    name: string;
    color: [number, number, number, number];
}

export class TreeOfLife {
    private geometry: GeometryData;
    private config: TreeOfLifeConfig;
    private resourceManager: WebGLResourceManager;
    private sephirot: Sephirah[];
    private paths: [number, number][]; // Pairs of indices into sephirot array

    constructor(config: TreeOfLifeConfig, resourceManager: WebGLResourceManager) {
        this.config = config;
        this.resourceManager = resourceManager;
        this.initializeSephirot();
        this.initializePaths();
        this.geometry = this.createGeometry();
    }

    private initializeSephirot(): void {
        // Define the 10 Sephirot with traditional positions and colors
        this.sephirot = [
            { position: [0, 1], name: 'Kether', color: [1, 1, 1, 1] },        // Crown
            { position: [-0.5, 0.8], name: 'Chokmah', color: [0.5, 0.5, 1, 1] }, // Wisdom
            { position: [0.5, 0.8], name: 'Binah', color: [0.8, 0.3, 0.3, 1] },  // Understanding
            { position: [-0.8, 0.4], name: 'Chesed', color: [0.3, 0.3, 0.8, 1] }, // Mercy
            { position: [0.8, 0.4], name: 'Geburah', color: [0.8, 0, 0, 1] },    // Severity
            { position: [0, 0.3], name: 'Tiphareth', color: [1, 0.8, 0, 1] },    // Beauty
            { position: [-0.5, -0.2], name: 'Netzach', color: [0, 0.8, 0.3, 1] }, // Victory
            { position: [0.5, -0.2], name: 'Hod', color: [0.8, 0.5, 0, 1] },     // Splendor
            { position: [0, -0.6], name: 'Yesod', color: [0.5, 0.3, 0.8, 1] },   // Foundation
            { position: [0, -1], name: 'Malkuth', color: [0.4, 0.4, 0.4, 1] }    // Kingdom
        ];
    }

    private initializePaths(): void {
        // Define the 22 paths connecting the Sephirot
        this.paths = [
            [0, 1], [0, 2], [1, 2], [1, 3], [2, 4],
            [2, 5], [3, 4], [3, 5], [3, 6], [4, 5],
            [4, 7], [5, 6], [5, 7], [5, 8], [6, 7],
            [6, 8], [7, 8], [6, 9], [7, 9], [8, 9],
            [1, 4], [2, 3]
        ];
    }

    private createGeometry(): GeometryData {
        const { sphereRadius, sphereSegments, pathWidth } = this.config;
        const vertices: number[] = [];
        const indices: number[] = [];
        const colors: number[] = [];
        const normals: number[] = [];

        // Add spheres for each Sephirah
        this.sephirot.forEach((sephirah, index) => {
            this.addSphere(
                vertices,
                indices,
                colors,
                normals,
                sephirah.position[0],
                sephirah.position[1],
                sphereRadius,
                sphereSegments,
                this.getSephirahColor(index)
            );
        });

        // Add paths if enabled
        if (this.config.showPaths) {
            this.paths.forEach(([from, to]) => {
                this.addPath(
                    vertices,
                    indices,
                    colors,
                    normals,
                    this.sephirot[from].position,
                    this.sephirot[to].position,
                    pathWidth
                );
            });
        }

        return {
            vertices: new Float32Array(vertices),
            indices: new Uint16Array(indices),
            colors: new Float32Array(colors),
            normals: new Float32Array(normals),
            type: 'treeOfLife'
        };
    }

    private addSphere(
        vertices: number[],
        indices: number[],
        colors: number[],
        normals: number[],
        centerX: number,
        centerY: number,
        radius: number,
        segments: number,
        color: [number, number, number, number]
    ): void {
        const startIndex = vertices.length / 3;

        // Generate sphere vertices
        for (let lat = 0; lat <= segments; lat++) {
            const theta = (lat * Math.PI) / segments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= segments; lon++) {
                const phi = (lon * 2 * Math.PI) / segments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = centerX + radius * cosPhi * sinTheta;
                const y = centerY + radius * sinPhi * sinTheta;
                const z = radius * cosTheta;

                vertices.push(x, y, z);
                colors.push(...color);

                // Calculate normal
                const nx = cosPhi * sinTheta;
                const ny = sinPhi * sinTheta;
                const nz = cosTheta;
                normals.push(nx, ny, nz);

                // Add indices for triangles
                if (lat < segments && lon < segments) {
                    const current = lat * (segments + 1) + lon;
                    const next = current + (segments + 1);

                    indices.push(
                        startIndex + current,
                        startIndex + next,
                        startIndex + current + 1,
                        startIndex + current + 1,
                        startIndex + next,
                        startIndex + next + 1
                    );
                }
            }
        }
    }

    private addPath(
        vertices: number[],
        indices: number[],
        colors: number[],
        normals: number[],
        from: vec2,
        to: vec2,
        width: number
    ): void {
        const startIndex = vertices.length / 3;
        const direction: vec2 = [to[0] - from[0], to[1] - from[1]];
        const length = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1]);
        const normalized: vec2 = [direction[0] / length, direction[1] / length];
        const perpendicular: vec2 = [-normalized[1], normalized[0]];

        // Create four corners of the path rectangle
        const corners = [
            [from[0] - perpendicular[0] * width, from[1] - perpendicular[1] * width, 0],
            [from[0] + perpendicular[0] * width, from[1] + perpendicular[1] * width, 0],
            [to[0] - perpendicular[0] * width, to[1] - perpendicular[1] * width, 0],
            [to[0] + perpendicular[0] * width, to[1] + perpendicular[1] * width, 0]
        ];

        // Add vertices
        corners.forEach(corner => {
            vertices.push(...corner);
            colors.push(0.8, 0.8, 0.8, 0.6); // Semi-transparent white
            normals.push(0, 0, 1);
        });

        // Add indices for two triangles
        indices.push(
            startIndex, startIndex + 1, startIndex + 2,
            startIndex + 1, startIndex + 3, startIndex + 2
        );
    }

    private getSephirahColor(index: number): [number, number, number, number] {
        if (this.config.colorScheme === 'traditional') {
            return this.sephirot[index].color;
        }

        switch (this.config.colorScheme) {
            case 'rainbow':
                const hue = (index * 360) / this.sephirot.length;
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
        // Implementation for rendering the Tree of Life
    }
}