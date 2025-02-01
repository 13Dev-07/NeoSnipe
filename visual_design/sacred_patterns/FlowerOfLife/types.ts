import { SacredGeometryConfig } from '@/types/sacred-geometry';

export interface FlowerOfLifeConfig extends SacredGeometryConfig {
    type: 'flowerOfLife';
    rings: number;
    overlap: boolean;
    seedVisible: boolean;
    animationSpeed: number;
    colorScheme: 'chakra' | 'golden' | 'rainbow';
}

export const chakraColors = [
    [0.89, 0.1, 0.1, 1.0],    // Red (Root)
    [1.0, 0.5, 0.0, 1.0],     // Orange (Sacral)
    [1.0, 1.0, 0.0, 1.0],     // Yellow (Solar Plexus)
    [0.0, 0.8, 0.0, 1.0],     // Green (Heart)
    [0.0, 0.6, 1.0, 1.0],     // Blue (Throat)
    [0.3, 0.0, 0.5, 1.0],     // Indigo (Third Eye)
    [0.6, 0.0, 1.0, 1.0]      // Violet (Crown)
];