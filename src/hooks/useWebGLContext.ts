import { useEffect, useRef, useState } from 'react';
import { WebGLContextLostError } from '../types/errors';

interface WebGLContextHook {
    gl: WebGL2RenderingContext | null;
    canvas: HTMLCanvasElement | null;
    contextLost: boolean;
    error: Error | null;
}

export const useWebGLContext = (canvasRef: React.RefObject<HTMLCanvasElement>): WebGLContextHook => {
    const [gl, setGL] = useState<WebGL2RenderingContext | null>(null);
    const [contextLost, setContextLost] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    const contextAttributes: WebGLContextAttributes = {
        alpha: false,
        antialias: true,
        depth: true,
        failIfMajorPerformanceCaveat: true,
        powerPreference: 'high-performance',
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        stencil: false
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            const context = canvas.getContext('webgl2', contextAttributes);
            if (!context) {
                throw new Error('WebGL 2.0 not supported');
            }
            setGL(context);
            setContextLost(false);
            setError(null);
        } catch (err) {
            setGL(null);
            setError(err instanceof Error ? err : new Error('Failed to create WebGL context'));
        }

        const handleContextLost = (event: WebGLContextEvent) => {
            event.preventDefault();
            setContextLost(true);
            setError(new WebGLContextLostError());
        };

        const handleContextRestored = () => {
            setContextLost(false);
            setError(null);
            try {
                const context = canvas.getContext('webgl2', contextAttributes);
                if (!context) {
                    throw new Error('Failed to restore WebGL 2.0 context');
                }
                setGL(context);
            } catch (err) {
                setGL(null);
                setError(err instanceof Error ? err : new Error('Failed to restore WebGL context'));
            }
        };

        canvas.addEventListener('webglcontextlost', handleContextLost);
        canvas.addEventListener('webglcontextrestored', handleContextRestored);

        return () => {
            canvas.removeEventListener('webglcontextlost', handleContextLost);
            canvas.removeEventListener('webglcontextrestored', handleContextRestored);
        };
    }, [canvasRef]);

    return { 
        gl, 
        canvas: canvasRef.current, 
        contextLost, 
        error 
    };
};