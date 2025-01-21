import React from 'react';
import { Grid, Card, Typography, Box } from '@mui/material';
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
}

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

export const TokenGrid: React.FC<TokenGridProps> = ({ tokens, onTokenSelect }) => {
  return (
    <Grid container spacing={3}>
      {tokens.map((token) => (
        <Grid item xs={12} sm={6} md={4} key={token.address}>
          <StyledCard onClick={() => onTokenSelect(token)}>
            <Typography variant="h6">{token.name}</Typography>
            <Typography color="textSecondary">{token.symbol}</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Liquidity Score: {(token.liquidityScore * 100).toFixed(2)}%
              </Typography>
            </Box>
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );
};
