import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const FlowContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100px',
  overflow: 'hidden',
}));

const DataPoint = styled(motion.div)(({ theme }) => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  position: 'absolute',
}));

export const DataFlow: React.FC = () => {
  return (
    <FlowContainer>
      {[...Array(10)].map((_, i) => (
        <DataPoint
          key={i}
          initial={{ x: -10, y: Math.random() * 100 }}
          animate={{
            x: ['0%', '100%'],
            y: [
              Math.random() * 100,
              Math.random() * 100,
              Math.random() * 100,
            ],
          }}
          transition={{
            duration: 3,
            delay: i * 0.2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </FlowContainer>
  );
};
