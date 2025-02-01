import { GeometricRatio } from './pattern-types';

export const calculateTrendStrength = (ratios: number[]): number => {
    if (ratios.length < 2) return 0;
    
    let trendSum = 0;
    for (let i = 1; i < ratios.length; i++) {
        trendSum += Math.abs(ratios[i] - ratios[i - 1]);
    }
    
    return Math.min(1, trendSum / (ratios.length - 1));
};

export const calculatePatternComplexity = (ratios: number[]): number => {
    if (ratios.length < 3) return 0;
    
    let complexityScore = 0;
    for (let i = 2; i < ratios.length; i++) {
        const prevDiff = ratios[i - 1] - ratios[i - 2];
        const currDiff = ratios[i] - ratios[i - 1];
        complexityScore += Math.abs(currDiff - prevDiff);
    }
    
    return Math.min(1, complexityScore / (ratios.length - 2));
};

export const calculateRatioStability = (data: GeometricRatio[]): number => {
    if (data.length < 2) return 0;
    
    let stabilityScore = 0;
    for (let i = 1; i < data.length; i++) {
        const diff = Math.abs(data[i].ratio - data[i - 1].ratio);
        stabilityScore += Math.exp(-diff);
    }
    
    return stabilityScore / (data.length - 1);
};

export const calculateRatioSignificance = (current: number, previous: number, goldenRatio: number, tolerance: number): number => {
    const priceChange = Math.abs(current - previous) / previous;
    const normalizedChange = 1 / (1 + Math.exp(-10 * (priceChange - 0.05)));
    const ratioToGolden = Math.abs(current / previous - goldenRatio);
    const goldenProximity = Math.max(0, 1 - ratioToGolden / tolerance);
    return (normalizedChange * 0.7 + goldenProximity * 0.3);
};

export const calculateGoldenRatioAlignment = (data: GeometricRatio[], goldenRatio: number, tolerance: number): number => {
    let alignmentScore = 0;
    data.forEach(ratio => {
        const distance = Math.abs(ratio.ratio - goldenRatio);
        if (distance <= tolerance) {
            alignmentScore += 1 - (distance / tolerance);
        }
    });
    
    return Math.min(1, alignmentScore / data.length);
};