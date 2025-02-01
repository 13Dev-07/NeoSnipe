# NeoSnipe API Reference

## Pattern Recognition API

### PatternRecognizer Class
Main class for analyzing market patterns using sacred geometry principles.

#### Methods

##### analyzePattern(priceData: number[]): Promise<PatternAnalysisResult>
Analyzes price data for geometric patterns.

Parameters:
- `priceData`: Array of price points to analyze

Returns:
- `Promise<PatternAnalysisResult>`: Analysis results including pattern type and confidence

##### calculateGeometricRatios(priceData: number[]): { ratio: number; significance: number }[]
Calculates geometric ratios from price data.

Parameters:
- `priceData`: Array of price points

Returns:
- Array of geometric ratios with significance values

## Market Analysis Types

### TokenMarketData
```typescript
interface TokenMarketData {
    price: number;
    volume: number;
    timestamp: number;
    marketCap: number;
    supply: number;
}
```

### PatternAnalysisResult
```typescript
interface PatternAnalysisResult {
    patternType: PatternType;
    confidence: number;
    strength: number;
    geometricRatios: GeometricRatio[];
    complexity: number;
}
```

### PatternCharacteristics
```typescript
interface PatternCharacteristics {
    trendStrength: number;
    volumeProfile: VolumeProfile;
    ratioStability: number;
    goldenRatioAlignment: number;
}
```

## API Endpoints

### Token Discovery
`GET /api/tokens/discover`

Returns newly discovered tokens matching specific criteria.

Parameters:
- `criteria`: Search criteria
- `limit`: Maximum results
- `offset`: Pagination offset

Response:
```json
{
    "tokens": Token[],
    "total": number,
    "page": number
}
```

## WebGL Integration

### Rendering API
Methods for rendering sacred geometry patterns using WebGL.

#### initializeWebGL()
Initializes WebGL context and sets up shaders.

#### renderPattern(pattern: PatternType)
Renders specified pattern using WebGL.

## Error Handling

### Error Codes
- `1001`: Invalid pattern data
- `1002`: WebGL initialization failed
- `1003`: API request failed
- `1004`: Invalid configuration

### Error Responses
All API endpoints return standard error format:
```json
{
    "error": {
        "code": number,
        "message": string,
        "details": object
    }
}
```