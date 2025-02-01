import { Pattern, PatternType } from './pattern-types';
import { PricePoint } from '../../../types/market-types';
import { PatternValidator } from './pattern-validator';

export class PatternDetectionProcessor {
    static async processBasicPatterns(
        basicPatternResults: Float32Array,
        ratios: Float32Array,
        priceData: PricePoint[],
        validator: PatternValidator,
        mapPatternType: (type: number) => PatternType
    ): Promise<Pattern[]> {
        const patterns: Pattern[] = [];
        
        for (let i = 0; i < basicPatternResults.length; i += 4) {
            const [startIndex, endIndex, patternType, confidence] = basicPatternResults.slice(i, i + 4);
            if (confidence > 0) {
                patterns.push({
                    type: mapPatternType(patternType),
                    startIndex: Math.floor(startIndex),
                    endIndex: Math.floor(endIndex),
                    confidence,
                    points: Array.from(
                        { length: Math.floor(endIndex - startIndex + 1) },
                        (_, i) => Math.floor(startIndex) + i
                    ),
                    metadata: {
                        ratios: Array.from(ratios.slice(
                            Math.floor(startIndex),
                            Math.floor(endIndex) + 1
                        )),
                        priceRange: [
                            Math.min(...priceData
                                .slice(Math.floor(startIndex), Math.floor(endIndex) + 1)
                                .map(p => p.price)),
                            Math.max(...priceData
                                .slice(Math.floor(startIndex), Math.floor(endIndex) + 1)
                                .map(p => p.price))
                        ],
                        timeRange: [
                            priceData[Math.floor(startIndex)].timestamp,
                            priceData[Math.floor(endIndex)].timestamp
                        ],
                        validation: await validator.validatePattern({
                            type: mapPatternType(patternType),
                            startIndex: Math.floor(startIndex),
                            endIndex: Math.floor(endIndex),
                            confidence,
                            points: Array.from(
                                { length: Math.floor(endIndex - startIndex + 1) },
                                (_, i) => Math.floor(startIndex) + i
                            )
                        }, priceData)
                    }
                });
            }
        }
        
        return patterns;
    }
    
    static async processHarmonicPatterns(
        harmonicPatternResults: Float32Array,
        priceData: PricePoint[],
        validator: PatternValidator,
        mapPatternType: (type: number) => PatternType
    ): Promise<Pattern[]> {
        const patterns: Pattern[] = [];
        
        for (let i = 0; i < harmonicPatternResults.length; i += 8) {
            const [startIndex, endIndex, patternType, confidence] = harmonicPatternResults.slice(i, i + 4);
            const patternRatios = harmonicPatternResults.slice(i + 4, i + 8);
            
            if (confidence > 0) {
                const start = Math.floor(startIndex);
                const end = Math.floor(endIndex);
                
                patterns.push({
                    type: mapPatternType(patternType),
                    startIndex: start,
                    endIndex: end,
                    confidence,
                    points: Array.from({ length: 5 }, (_, i) => start + i),
                    metadata: {
                        ratios: Array.from(patternRatios),
                        priceRange: [
                            Math.min(...priceData.slice(start, end + 1).map(p => p.price)),
                            Math.max(...priceData.slice(start, end + 1).map(p => p.price))
                        ],
                        timeRange: [
                            priceData[start].timestamp,
                            priceData[end].timestamp
                        ],
                        validation: await validator.validatePattern({
                            type: mapPatternType(patternType),
                            startIndex: start,
                            endIndex: end,
                            confidence,
                            points: Array.from({ length: 5 }, (_, i) => start + i)
                        }, priceData)
                    }
                });
            }
        }
        
        return patterns;
    }
}