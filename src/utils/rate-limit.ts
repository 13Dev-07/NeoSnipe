import { NextApiResponse } from 'next';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

interface RateLimitConfig {
  interval: number;
  uniqueTokenPerInterval: number;
}

export const createRateLimiter = ({ interval, uniqueTokenPerInterval }: RateLimitConfig) => {
  const limiter = rateLimit({
    windowMs: interval,
    max: uniqueTokenPerInterval,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const speedLimiter = slowDown({
    windowMs: interval,
    delayAfter: Math.floor(uniqueTokenPerInterval * 0.5),
    delayMs: 500,
  });

  return {
    check: async (res: NextApiResponse, limit: number) => {
      try {
        await new Promise((resolve, reject) => {
          limiter(
            { headers: {}, method: 'POST' } as any,
            { 
              status: (status: number) => ({
                json: (message: any) => reject({ status, message }),
              }),
            } as any,
            resolve as any,
          );
        });

        await new Promise((resolve) => {
          speedLimiter(
            { headers: {} } as any,
            res as any,
            resolve as any,
          );
        });
      } catch (error) {
        throw error;
      }
    },
  };
};