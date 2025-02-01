import { useEffect, useState, useCallback } from 'react';
import { RealTimePatternDetector, PatternUpdateEvent } from '../market_analysis/core/real-time/pattern-updates';

export function usePatternUpdates(wsUrl: string) {
    const [detector, setDetector] = useState<RealTimePatternDetector | null>(null);
    const [latestUpdate, setLatestUpdate] = useState<PatternUpdateEvent | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const handlePatternUpdate = useCallback((event: PatternUpdateEvent) => {
        setLatestUpdate(event);
        // Trigger any notifications or UI updates here
    }, []);

    useEffect(() => {
        const newDetector = new RealTimePatternDetector(wsUrl, handlePatternUpdate);
        setDetector(newDetector);
        setIsConnected(true);

        return () => {
            if (newDetector) {
                newDetector.disconnect();
                setIsConnected(false);
            }
        };
    }, [wsUrl, handlePatternUpdate]);

    return {
        latestUpdate,
        isConnected,
        detector
    };
}