import React from 'react';
import { Typography } from '@mui/material';
import { Token } from '../../../types/token';

interface TokenCardProps {
  token: Token;
  isSelected: boolean;
  onSelect: () => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token, isSelected, onSelect }) => (
  <div
    role="button"
    tabIndex={0}
    aria-pressed={isSelected}
    onClick={onSelect}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onSelect();
        e.preventDefault();
      }
    }}
    className={`token-card ${isSelected ? 'selected' : ''}`}
    aria-label={`${token.name} (${token.symbol}) - Liquidity Score: ${token.liquidityScore}`}
  >
    <Typography variant="h6">{token.name}</Typography>
    <Typography variant="body2">{token.symbol}</Typography>
    <Typography variant="body2">Liquidity: {token.liquidityScore}</Typography>
  </div>
);