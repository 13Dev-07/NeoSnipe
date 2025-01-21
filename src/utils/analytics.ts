import { WebVitals } from 'next/app';

export const reportWebVitals = ({ id, name, label, value }: WebVitals) => {
  // When the metric is ready, send to your analytics
  if (process.env.NODE_ENV === 'production') {
    const metric = {
      id,
      name,
      label,
      value,
      timestamp: Date.now(),
      page: window.location.pathname,
      userAgent: window.navigator.userAgent,
    };

    // Example using navigator.sendBeacon
    const blob = new Blob([JSON.stringify(metric)], { type: 'application/json' });
    navigator.sendBeacon('/api/metrics', blob);
  }
};