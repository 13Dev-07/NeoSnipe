import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface Pattern {
  type: string;
  confidence: number;
  description: string;
}

interface PatternDisplayProps {
  patterns: Pattern[];
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(26, 27, 77, 0.8)',
}));

const ConfidenceIndicator = styled(Box)<{ confidence: number }>(({ theme, confidence }) => ({
  width: '100%',
  height: 4,
  backgroundColor: theme.palette.grey[700],
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${confidence * 100}%`,
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
  },
}));

export const PatternDisplay: React.FC<PatternDisplayProps> = ({ patterns }) => {
  return (
    <StyledPaper>
      <Typography variant="h6" gutterBottom>
        Detected Patterns
      </Typography>
      <List>
        {patterns.map((pattern, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={pattern.type}
              secondary={
                <>
                  <Typography variant="body2" color="textSecondary">
                    {pattern.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <ConfidenceIndicator confidence={pattern.confidence} />
                    <Typography variant="caption" color="textSecondary">
                      Confidence: {(pattern.confidence * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </StyledPaper>
  );
};
