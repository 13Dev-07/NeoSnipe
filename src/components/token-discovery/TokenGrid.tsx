import React from 'react';
import { Grid, Typography } from '@mui/material';
import { TokenCard } from './components/TokenCard';
import { styled } from '@mui/material/styles';
import { PricePoint } from '../../shared/constants';

interface Token {
  address: string;
  name: string;
  symbol: string;
  priceHistory: PricePoint[];
  liquidityScore: number;
}

interface TokenGridProps {
  tokens: Token[];
  onTokenSelect: (token: Token) => void;
  selectedToken: Token | null;
  isLoading: boolean;
}

// Styles moved to token-grid.css for better accessibility support

export const TokenGrid: React.FC<TokenGridProps> = ({ tokens, onTokenSelect, selectedToken, isLoading }) => {
  return (
    <div role="grid" aria-label="Token selection grid">
      <Grid container spacing={3} role="presentation">
        {tokens.map((token) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            key={token.address}
            role="gridcell"
          >
            <TokenCard
              token={token}
              isSelected={selectedToken?.address === token.address}
              onSelect={() => onTokenSelect(token)}
            />
          </Grid>
        ))}
      </Grid>
      {tokens.length === 0 && !isLoading && (
        <Typography 
          role="status" 
          aria-live="polite"
          className="no-results"
        >
          No tokens found matching your search criteria
        </Typography>
      )}
    </div>
  );
};
