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

  useEffect(() => {
    // Update performance monitoring when pattern analysis is active
    if (selectedToken) {
      startMonitoring();
      return () => stopMonitoring();
    }
  }, [selectedToken, startMonitoring, stopMonitoring]);

  return (
    <GeometryErrorBoundary onReset={() => {
      setSelectedToken(null);
      stopMonitoring();
    }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                 bg-primary text-white px-4 py-2 z-50"
      >
        Skip to main content
      </a>
      <Container maxWidth="lg">
        <Box 
          sx={{ py: 4 }}
          id="main-content"
          role="main"
          tabIndex={-1}>
          <Typography variant="h4" gutterBottom role="heading" aria-level={1}>
            Token Discovery Interface
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }} role="contentinfo">
            Search and analyze tokens using sacred geometry patterns
          </Typography>
          
          <TextField
            fullWidth
            label="Search Tokens"
            variant="outlined"
            onChange={(e) => debouncedScanTokens(e.target.value)}
            sx={{ mb: 4 }}
            inputProps={{
              'aria-label': 'Search for tokens',
              'role': 'searchbox',
              'aria-describedby': 'token-search-desc'
            }}
          />
          <Typography id="token-search-desc" className="sr-only">
            Enter token name, symbol, or address to search available tokens
          </Typography>
          />

          <DataFlow performanceMetrics={metrics} />

          {(scanningLoading || patternLoading) && (
            <Box 
              sx={{ display: 'flex', justifyContent: 'center', my: 4 }}
              role="status"
              aria-live="polite"
            >
              <CircularProgress aria-label="Loading tokens..." />
              <span className="sr-only">Loading tokens, please wait...</span>
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
              role="alert"
              aria-live="assertive"
              tabIndex={0}
            >
              <Typography variant="body1">
                <span className="sr-only">Error: </span>
                {scanningError || patternError || sacredGeometry.error?.message}
              </Typography>
              <button
                onClick={() => {
                  setSelectedToken(null);
                  stopMonitoring();
                }}
                className="mt-2 px-4 py-2 bg-primary text-white rounded"
                aria-label="Reset application state"
              >
                Reset
              </button>
            </Box>
          )}

          {metrics && (
            <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom role="heading" aria-level={2}>
                Performance Metrics
              </Typography>
              <div role="region" aria-label="Performance statistics">
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
