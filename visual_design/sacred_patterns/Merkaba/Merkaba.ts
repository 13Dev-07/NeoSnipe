import { vec2, vec3, mat4 } from 'gl-matrix';
import { SacredGeometryConfig, GeometryData } from '../../../src/types/sacred-geometry';
import { WebGLResourceManager } from '../../../src/utils/webgl-resource-manager';

export interface MerkabaConfig extends SacredGeometryConfig {
    radius: number;
    rotationSpeed: number;
    detail: number;
    showInnerStructure: boolean;
    energyFieldIntensity: number;
    colorScheme: 'rainbow' | 'monochrome' | 'golden' | 'ethereal';
}

export class Merkaba {
    private geometry: GeometryData;
    private config: MerkabaConfig;
    private resourceManager: WebGLResourceManager;
    private rotation: number = 0;

    constructor(config: MerkabaConfig, resourceManager: WebGLResourceManager) {
        this.config = config;
        this.resourceManager = resourceManager;
        this.geometry = this.createGeometry();
    }

    private createGeometry(): GeometryData {
        const { radius, detail, showInnerStructure } = this.config;
        const vertices: number[] = [];
        const indices: number[] = [];
        const colors: number[] = [];
        const normals: number[] = [];

        // Create upward-pointing tetrahedron (masculine)
        this.addTetrahedron(
            vertices,
            indices,
            colors,
            normals,
            radius,
            detail,
            true,
            0
        );

        // Create downward-pointing tetrahedron (feminine)
        this.addTetrahedron(
            vertices,
            indices,
            colors,
            normals,
            radius,
            detail,
            false,
            1
        );

        // Add inner structure if enabled
        if (showInnerStructure) {
            this.addInnerStructure(
                vertices,
                indices,
                colors,
                normals,
                radius * 0.5,
                detail
            );
        }

        return {
            vertices: new Float32Array(vertices),
            indices: new Uint16Array(indices),
            colors: new Float32Array(colors),
            normals: new Float32Array(normals),
            type: 'merkaba'
        };
    }

    private addTetrahedron(
        vertices: number[],
        indices: number[],
        colors: number[],
        normals: number[],
        radius: number,
        detail: number,
        pointUp: boolean,
        colorIndex: number
    ): void {
        const startIndex = vertices.length / 3;
        const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
        const scale = pointUp ? 1 : -1;

        // Base vertices for a tetrahedron
        const baseVertices = [
            [0, 1 * scale, 0],                          // Top/Bottom point
            [-1, -0.5 * scale, Math.sqrt(3) / 2],      // Base point 1
            [1, -0.5 * scale, Math.sqrt(3) / 2],       // Base point 2
            [0, -0.5 * scale, -Math.sqrt(3) / 2]       // Base point 3
        ];

        // Scale vertices by radius
        const scaledVertices = baseVertices.map(v => [
            v[0] * radius,
            v[1] * radius,
            v[2] * radius
        ]);

        // Add vertices with subdivisions if detail > 1
        if (detail > 1) {
            for (let i = 0; i < 4; i++) {
                for (let j = i + 1; j < 4; j++) {
                    this.subdivideEdge(
                        vertices,
                        colors,
                        normals,
                        scaledVertices[i],
                        scaledVertices[j],
                        detail,
                        this.getColor(colorIndex)
                    );
                }
            }
        } else {
            // Add base vertices directly
            scaledVertices.forEach(vertex => {
                vertices.push(...vertex);
                colors.push(...this.getColor(colorIndex));
                const normal = vec3.normalize(vec3.create(), vertex as vec3);
                normals.push(...normal);
            });
        }

        // Add faces
        this.addTetrahedronFaces(indices, startIndex, detail);
    }

    private subdivideEdge(
        vertices: number[],
        colors: number[],
        normals: number[],
        start: number[],
        end: number[],
        subdivisions: number,
        color: [number, number, number, number]
    ): void {
        for (let i = 0; i <= subdivisions; i++) {
            const t = i / subdivisions;
            const point = [
                start[0] + (end[0] - start[0]) * t,
                start[1] + (end[1] - start[1]) * t,
                start[2] + (end[2] - start[2]) * t
            ];
            const normal = vec3.normalize(vec3.create(), point as vec3);
            
            vertices.push(...point);
            colors.push(...color);
            normals.push(...normal);
        }
    }

    private addTetrahedronFaces(
        indices: number[],
        startIndex: number,
        detail: number
    ): void {
        // Calculate number of vertices per edge after subdivision
        const vpe = detail + 1; // vertices per edge

        // Add the four triangular faces
        const faces = [
            [0, 1, 2], // Front face
            [0, 2, 3], // Right face
            [0, 3, 1], // Left face
            [1, 3, 2]  // Bottom face
        ];

        faces.forEach(face => {
            for (let i = 0; i < detail; i++) {
                for (let j = 0; j < detail - i; j++) {
                    const v1 = startIndex + face[0] * vpe + i * vpe + j;
                    const v2 = v1 + 1;
                    const v3 = v1 + vpe;
                    const v4 = v2 + vpe;

                    indices.push(v1, v2, v3);
                    if (j < detail - i - 1) {
                        indices.push(v2, v4, v3);
                    }
                }
            }
        });
    }

    private addInnerStructure(
        vertices: number[],
        indices: number[],
        colors: number[],
        normals: number[],
        radius: number,
        detail: number
    ): void {
        // Add connecting lines between centers of tetrahedra
        const startIndex = vertices.length / 3;
        const lineWidth = radius * 0.02;

        // Create central axis
        this.addCentralAxis(vertices, indices, colors, normals, radius, lineWidth);

        // Add energy field visualization
        this.addEnergyField(vertices, indices, colors, normals, radius);
    }

    private addCentralAxis(
        vertices: number[],
        indices: number[],
        colors: number[],
        normals: number[],
        height: number,
        width: number
    ): void {
        const startIndex = vertices.length / 3;
        const segments = 12;
        
        // Create cylinder vertices
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const cos = Math.cos(angle) * width;
            const sin = Math.sin(angle) * width;

            // Top vertex
            vertices.push(cos, height, sin);
            colors.push(1, 1, 1, 0.5);
            normals.push(cos, 0, sin);

            // Bottom vertex
            vertices.push(cos, -height, sin);
            colors.push(1, 1, 1, 0.5);
            normals.push(cos, 0, sin);

            if (i < segments) {
                const base = startIndex + i * 2;
                indices.push(
                    base, base + 1, base + 2,
                    base + 1, base + 3, base + 2
                );
            }
        }
    }

    private addEnergyField(
        vertices: number[],
        indices: number[],
        colors: number[],
        normals: number[],
        radius: number
    ): void {
        const startIndex = vertices.length / 3;
        const segments = 36;
        const rings = 3;
        const intensity = this.config.energyFieldIntensity;

        for (let ring = 0; ring < rings; ring++) {
            const ringRadius = radius * (1 + ring * 0.2);
            const alpha = (1 - ring / rings) * 0.3 * intensity;

            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const cos = Math.cos(angle) * ringRadius;
                const sin = Math.sin(angle) * ringRadius;

                for (let j = 0; j <= segments; j++) {
                    const elevation = (j / segments) * Math.PI * 2;
                    const y = Math.sin(elevation) * ringRadius;
                    const scale = Math.cos(elevation);
                    
                    vertices.push(cos * scale, y, sin * scale);
                    colors.push(1, 1, 1, alpha);
                    normals.push(cos * scale, y, sin * scale);

                    if (i < segments && j < segments) {
                        const base = startIndex + (i * (segments + 1) + j);
                        indices.push(
                            base, base + 1, base + segments + 1,
                            base + 1, base + segments + 2, base + segments + 1
                        );
                    }
                }
            }
        }
    }

    private getColor(index: number): [number, number, number, number] {
        switch (this.config.colorScheme) {
            case 'rainbow':
                const hue = index * 180; // 180 degrees apart for complementary colors
                return this.hslToRgb(hue / 360, 0.7, 0.5, 1.0);
            case 'monochrome':
                return [0.7, 0.7, 0.7, 1.0];
            case 'golden':
                return [0.83, 0.68, 0.21, 1.0];
            case 'ethereal':
                return index === 0 
                    ? [0.4, 0.6, 1.0, 0.8]  // Blue for masculine
                    : [1.0, 0.4, 0.6, 0.8]; // Pink for feminine
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
        // Update rotation for animation
        this.rotation += deltaTime * this.config.rotationSpeed;
        if (this.rotation > Math.PI * 2) {
            this.rotation -= Math.PI * 2;
        }
    }

    public render(gl: WebGLRenderingContext, projectionMatrix: mat4, viewMatrix: mat4): void {
        // Implementation for rendering the Merkaba
        // This will be handled by the WebGLResourceManager
    }
}