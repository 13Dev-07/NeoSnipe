import React, { useState, useCallback, useMemo } from 'react';
import { Box, Container, TextField, Typography, CircularProgress } from '@mui/material';
import { useTokenScanner } from '../../hooks/useTokenScanner';
import { usePatternRecognition } from '../../hooks/usePatternRecognition';
import { TokenGrid } from './TokenGrid';
import { PatternDisplay } from './PatternDisplay';
import { DataFlow } from './DataFlow';
import { PricePoint } from '../../shared/constants';
import { GeometryErrorBoundary } from '../error-boundary/GeometryErrorBoundary';
import debounce from 'lodash/debounce';
import { useSacredGeometry } from '../../hooks/useSacredGeometry';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

interface Token {
  address: string;
  name: string;
  symbol: string;
  priceHistory: PricePoint[];
  liquidityScore: number;
}

export const DiscoveryInterface: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const { tokens, loading: scanningLoading, error: scanningError, scanTokens } = useTokenScanner();
  const { patterns, loading: patternLoading, error: patternError, analyzePatterns } = usePatternRecognition();
  const { metrics, startMonitoring, stopMonitoring } = usePerformanceMonitor();

  const debouncedScanTokens = useMemo(
    () => debounce((query: string) => {
      scanTokens(query);
    }, 300),
    [scanTokens]
  );

  const sacredGeometry = useSacredGeometry({
    type: 'flowerOfLife',
    scale: 1,
    animate: true,
    dimensions: '2d'
  });

  const handleTokenSelect = useCallback((token: Token) => {
    setSelectedToken(token);
    analyzePatterns(token.priceHistory);
    startMonitoring();
  }, [analyzePatterns, startMonitoring]);

  return (
    <GeometryErrorBoundary onReset={() => {
      setSelectedToken(null);
      stopMonitoring();
    }}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Token Discovery
          </Typography>
          
          <TextField
            fullWidth
            label="Search Tokens"
            variant="outlined"
            onChange={(e) => debouncedScanTokens(e.target.value)}
            sx={{ mb: 4 }}
          />

          <DataFlow performanceMetrics={metrics} />

          {(scanningLoading || patternLoading) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <GeometryErrorBoundary>
              <TokenGrid 
                tokens={tokens} 
                onTokenSelect={handleTokenSelect}
                selectedToken={selectedToken}
                isLoading={scanningLoading}
              />
            </GeometryErrorBoundary>
          </Box>

          {selectedToken && (
            <Box sx={{ mt: 4 }}>
              <GeometryErrorBoundary>
                <PatternDisplay 
                  patterns={patterns}
                  geometryState={sacredGeometry}
                  performanceMetrics={metrics}
                />
              </GeometryErrorBoundary>
            </Box>
          )}

          {(scanningError || patternError || sacredGeometry.error) && (
            <Box 
              sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: 'error.light',
                borderRadius: 1,
                color: 'error.contrastText'
              }}
            >
              <Typography variant="body1">
                {scanningError || patternError || sacredGeometry.error?.message}
              </Typography>
            </Box>
          )}

          {metrics && (
            <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Typography variant="body2">
                FPS: {Math.round(metrics.fps)}
              </Typography>
              <Typography variant="body2">
                Frame Time: {Math.round(metrics.frameTime)}ms
              </Typography>
              <Typography variant="body2">
                Memory Usage: {Math.round(metrics.memoryUsage / 1024 / 1024)}MB
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </GeometryErrorBoundary>
  );
};
