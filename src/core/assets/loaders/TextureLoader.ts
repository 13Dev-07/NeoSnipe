import {
  AssetLoader,
  AssetType,
  AssetRequest,
  LoadedAsset,
  AssetMetadata
} from '../AssetTypes';

export class TextureLoader implements AssetLoader {
  readonly supportedTypes = [AssetType.TEXTURE];
  readonly supportedFormats = ['.png', '.jpg', '.jpeg', '.webp', '.basis'];

  async load(request: AssetRequest): Promise<LoadedAsset<HTMLImageElement>> {
    const img = new Image();
    const metadata = await this.getMetadata(request);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        resolve({
          data: img,
          metadata: {
            ...metadata,
            width: img.width,
            height: img.height
          },
          loaded: true
        });
      };

      img.onerror = () => {
        reject(new Error(`Failed to load texture: ${request.url}`));
      };

      img.src = request.url;
    });
  }

  async unload(asset: LoadedAsset<HTMLImageElement>): Promise<void> {
    // Browser handles cleanup of Image objects
  }

  createPlaceholder(): HTMLImageElement {
    // Create a 1x1 pink pixel as placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FF00FF';
    ctx.fillRect(0, 0, 1, 1);
    
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }

  private async getMetadata(request: AssetRequest): Promise<AssetMetadata> {
    const response = await fetch(request.url, { method: 'HEAD' });
    const size = Number(response.headers.get('content-length')) || 0;
    const lastModified = Date.parse(response.headers.get('last-modified') || '');
    
    return {
      id: request.url,
      type: AssetType.TEXTURE,
      size,
      format: this.getFormat(request.url),
      lastModified: isNaN(lastModified) ? Date.now() : lastModified,
      hash: response.headers.get('etag') || request.url,
      compressed: request.url.endsWith('.basis')
    };
  }

  private getFormat(url: string): string {
    return url.slice(url.lastIndexOf('.')).toLowerCase();
  }
}