import { useState, useEffect } from 'react';

interface PriceData {
    timestamp: number;
    price: number;
    volume: number;
    liquidityScore: number;
}

interface MarketDataHook {
    data: PriceData[] | null;
    loading: boolean;
    error: string | null;
}

export const useMarketData = (tokenAddress: string, timeframe: string): MarketDataHook => {
    const [data, setData] = useState<PriceData[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                setLoading(true);
                // TODO: Implement actual API call to fetch market data
                const mockData: PriceData[] = generateMockData();
                setData(mockData);
                setError(null);
            } catch (err) {
                setError('Failed to fetch market data');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMarketData();
    }, [tokenAddress, timeframe]);

    return { data, loading, error };
};

// Helper function to generate mock data for development
const generateMockData = (): PriceData[] => {
    const now = Date.now();
    const data: PriceData[] = [];

    for (let i = 0; i < 100; i++) {
        data.push({
            timestamp: now - i * 3600000, // 1 hour intervals
            price: Math.random() * 1000 + 500,
            volume: Math.random() * 1000000,
            liquidityScore: Math.random()
        });
    }

    return data.sort((a, b) => a.timestamp - b.timestamp);
};
