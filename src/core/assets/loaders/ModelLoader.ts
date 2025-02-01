import {
  AssetLoader,
  AssetType,
  AssetRequest,
  LoadedAsset,
  AssetMetadata
} from '../AssetTypes';

interface Model {
  vertices: Float32Array;
  indices: Uint16Array;
  normals?: Float32Array;
  uvs?: Float32Array;
}

export class ModelLoader implements AssetLoader {
  readonly supportedTypes = [AssetType.MODEL];
  readonly supportedFormats = ['.gltf', '.glb', '.obj'];

  async load(request: AssetRequest): Promise<LoadedAsset<Model>> {
    const response = await fetch(request.url);
    const metadata = await this.getMetadata(request, response);

    let data: Model;
    if (request.url.endsWith('.obj')) {
      const text = await response.text();
      data = this.parseOBJ(text);
    } else {
      // TODO: Implement GLTF/GLB parsing
      throw new Error('GLTF/GLB parsing not yet implemented');
    }

    return {
      data,
      metadata,
      loaded: true
    };
  }

  async unload(asset: LoadedAsset<Model>): Promise<void> {
    // Clear typed arrays
    asset.data.vertices = new Float32Array(0);
    asset.data.indices = new Uint16Array(0);
    if (asset.data.normals) asset.data.normals = new Float32Array(0);
    if (asset.data.uvs) asset.data.uvs = new Float32Array(0);
  }

  createPlaceholder(): Model {
    // Create a simple triangle as placeholder
    return {
      vertices: new Float32Array([
        -1, -1, 0,
         1, -1, 0,
         0,  1, 0
      ]),
      indices: new Uint16Array([0, 1, 2]),
      normals: new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
      ])
    };
  }

  private async getMetadata(
    request: AssetRequest,
    response: Response
  ): Promise<AssetMetadata> {
    const size = Number(response.headers.get('content-length')) || 0;
    const lastModified = Date.parse(response.headers.get('last-modified') || '');

    return {
      id: request.url,
      type: AssetType.MODEL,
      size,
      format: this.getFormat(request.url),
      lastModified: isNaN(lastModified) ? Date.now() : lastModified,
      hash: response.headers.get('etag') || request.url
    };
  }

  private getFormat(url: string): string {
    return url.slice(url.lastIndexOf('.')).toLowerCase();
  }

  private parseOBJ(text: string): Model {
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    
    const lines = text.split('\n');
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      
      switch (parts[0]) {
        case 'v': // Vertex
          vertices.push(
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3])
          );
          break;
          
        case 'vn': // Normal
          normals.push(
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3])
          );
          break;
          
        case 'vt': // UV
          uvs.push(
            parseFloat(parts[1]),
            parseFloat(parts[2])
          );
          break;
          
        case 'f': // Face
          // Simple triangulation (assuming triangles)
          for (let i = 1; i <= 3; i++) {
            const vertexData = parts[i].split('/');
            indices.push(parseInt(vertexData[0]) - 1);
          }
          break;
      }
    }

    return {
      vertices: new Float32Array(vertices),
      indices: new Uint16Array(indices),
      normals: normals.length > 0 ? new Float32Array(normals) : undefined,
      uvs: uvs.length > 0 ? new Float32Array(uvs) : undefined
    };
  }
}