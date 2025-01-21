export const PHI = 1.618033988749895;

export const FIBONACCI_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

export const SACRED_RATIOS = {
  PHI,
  SQRT_PHI: Math.sqrt(PHI),
  PHI_SQUARED: PHI * PHI
};

export const CHART_DIMENSIONS = {
  WIDTH: 800,
  HEIGHT: 800 / PHI,
  MARGIN: {
    TOP: 21,
    RIGHT: 34,
    BOTTOM: 21,
    LEFT: 34
  }
};

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}
