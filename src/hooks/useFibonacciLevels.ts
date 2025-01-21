import { useMemo } from 'react';

interface FibonacciLevel {
    ratio: number;
    price: number;
    type: 'support' | 'resistance';
}

interface FibonacciHook {
    levels: FibonacciLevel[];
    calculateFibLevels: (high: number, low: number) => FibonacciLevel[];
}

const FIBONACCI_RATIOS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
const PHI = 1.618033988749895; // Golden Ratio

export const useFibonacciLevels = (): FibonacciHook => {
    const calculateFibLevels = (high: number, low: number): FibonacciLevel[] => {
        return FIBONACCI_RATIOS.map(ratio => {
            const price = low + (high - low) * ratio;
            return {
                ratio,
                price,
                type: ratio <= 0.5 ? 'support' : 'resistance'
            };
        });
    };

    const levels = useMemo(() => {
        // Initialize with some default levels based on PHI
        const basePrice = 1000;
        return calculateFibLevels(basePrice * PHI, basePrice / PHI);
    }, []);

    return {
        levels,
        calculateFibLevels
    };
};
