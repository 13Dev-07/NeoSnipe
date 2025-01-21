import React, { useEffect, useRef, useState } from 'react';
import { useFibonacciLevels } from '../hooks/useFibonacciLevels';
import { styled } from '@mui/material/styles';
import { Box, CircularProgress, Typography } from '@mui/material';

const PHI = 1.618033988749895;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = CANVAS_WIDTH / PHI;

const VisualizationContainer = styled(Box)(({ theme }) => ({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
}));

const Canvas = styled('canvas')({
    position: 'absolute',
    top: 0,
    left: 0,
});

interface VisualizationProps {
    data?: {
        high: number;
        low: number;
        current: number;
    };
    loading?: boolean;
}

export const Visualization: React.FC<VisualizationProps> = ({ data, loading = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { calculateFibLevels } = useFibonacciLevels();
    const [dimensions, setDimensions] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        // Calculate Fibonacci levels
        const levels = calculateFibLevels(data.high, data.low);

        // Draw levels
        levels.forEach(level => {
            const y = dimensions.height * (1 - (level.price - data.low) / (data.high - data.low));
            
            ctx.beginPath();
            ctx.strokeStyle = level.type === 'support' ? '#4CAF50' : '#F44336';
            ctx.setLineDash([5, 5]);
            ctx.moveTo(0, y);
            ctx.lineTo(dimensions.width, y);
            ctx.stroke();

            // Draw level label
            ctx.font = '12px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${level.ratio * 100}% - $${level.price.toFixed(2)}`, 10, y - 5);
        });

        // Draw current price line
        if (data.current) {
            const currentY = dimensions.height * (1 - (data.current - data.low) / (data.high - data.low));
            ctx.beginPath();
            ctx.strokeStyle = '#FFD700';
            ctx.setLineDash([]);
            ctx.lineWidth = 2;
            ctx.moveTo(0, currentY);
            ctx.lineTo(dimensions.width, currentY);
            ctx.stroke();
        }
    }, [data, dimensions, calculateFibLevels]);

    return (
        <VisualizationContainer>
            <Canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
            />
            {loading && (
                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    style={{ transform: 'translate(-50%, -50%)' }}
                >
                    <CircularProgress />
                </Box>
            )}
            {!data && !loading && (
                <Typography
                    variant="body1"
                    color="textSecondary"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    No data available
                </Typography>
            )}
        </VisualizationContainer>
    );
};
