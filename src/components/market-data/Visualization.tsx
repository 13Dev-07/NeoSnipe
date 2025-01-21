import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFibonacciLevels } from '../../hooks/useFibonacciLevels';
import { PricePoint, SACRED_RATIOS } from '../../shared/constants';

interface VisualizationProps {
  data?: PricePoint[];
  loading?: boolean;
  showPatterns?: boolean;
}

const VisualizationContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  position: 'relative',
  backgroundColor: 'rgba(26, 27, 77, 0.8)',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  padding: theme.spacing(3),
}));

const Canvas = styled('canvas')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
});

export const Visualization: React.FC<VisualizationProps> = ({
  data = [],
  loading = false,
  showPatterns = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { calculateFibLevels } = useFibonacciLevels();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width,
          height: width / SACRED_RATIOS.PHI,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Calculate min/max values
    const minPrice = Math.min(...data.map(d => d.low));
    const maxPrice = Math.max(...data.map(d => d.high));
    const priceRange = maxPrice - minPrice;

    // Calculate Fibonacci levels
    const levels = calculateFibLevels(maxPrice, minPrice);

    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Vertical grid lines based on PHI
    const verticalSpacing = dimensions.width / SACRED_RATIOS.PHI;
    for (let x = 0; x < dimensions.width; x += verticalSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, dimensions.height);
      ctx.stroke();
    }

    // Draw price data
    if (data.length > 1) {
      const timeStep = dimensions.width / (data.length - 1);

      // Draw price line
      ctx.beginPath();
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 2;

      data.forEach((point, i) => {
        const x = i * timeStep;
        const y = dimensions.height - ((point.price - minPrice) / priceRange) * dimensions.height;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw volume bars
      const maxVolume = Math.max(...data.map(d => d.volume));
      const volumeScale = dimensions.height * 0.2 / maxVolume;

      ctx.fillStyle = 'rgba(0, 255, 204, 0.2)';
      data.forEach((point, i) => {
        const x = i * timeStep;
        const height = point.volume * volumeScale;
        ctx.fillRect(
          x - timeStep/2,
          dimensions.height - height,
          timeStep,
          height
        );
      });
    }

    // Draw Fibonacci levels
    levels.forEach(level => {
      const y = dimensions.height * (1 - level.ratio);
      
      ctx.beginPath();
      ctx.strokeStyle = level.type === 'support' ? '#4CAF50' : '#F44336';
      ctx.setLineDash([5, 5]);
      ctx.moveTo(0, y);
      ctx.lineTo(dimensions.width, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw level labels
      ctx.font = '12px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(
        `${(level.ratio * 100).toFixed(1)}% - $${level.price.toFixed(2)}`,
        10,
        y - 5
      );
    });

  }, [data, dimensions, calculateFibLevels]);

  return (
    <VisualizationContainer ref={containerRef}>
      <Canvas ref={canvasRef} />
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <CircularProgress size={24} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading market data...
          </Typography>
        </Box>
      )}
      {!loading && !data.length && (
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          No market data available
        </Typography>
      )}
    </VisualizationContainer>
  );
};
