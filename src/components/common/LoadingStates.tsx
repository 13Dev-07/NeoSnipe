import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingStateProps> = ({ message = 'Loading...', className = '' }) => (
  <div 
    className={`loading-spinner animate-fade-in ${className}`}
    role="status"
    aria-live="polite"
  >
    <div className="spinner-icon animate-spin"></div>
    <p className="mt-2 text-center" aria-live="polite">{message}</p>
    <span className="sr-only">Loading</span>
  </div>
);

export const InitializationScreen: React.FC<LoadingStateProps> = ({ message = 'Initializing WebGL...', className = '' }) => (
  <div 
    className={`initialization-screen animate-fade-in flex flex-col items-center justify-center min-h-screen ${className}`}
    role="status"
    aria-live="polite"
    tabIndex={0}
  >
    <LoadingSpinner />
    <p className="mt-4 text-lg">{message}</p>
  </div>
);

export const ErrorScreen: React.FC<{ error: Error }> = ({ error }) => (
  <div 
    className="error-screen flex flex-col items-center justify-center min-h-screen p-4 text-center"
    role="alert"
    aria-live="assertive"
  >
    <div className="mb-4">
      <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
        />
      </svg>
    </div>
    <h2 className="text-xl font-bold mb-2">Initialization Error</h2>
    <p className="text-red-600 mb-4">{error.message}</p>
    <button 
      onClick={() => window.location.reload()}
      className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
      aria-label="Reload page"
    >
      Try Again
    </button>
  </div>
);

export const PerformanceWarning: React.FC = () => (
  <div 
    className="performance-warning fixed bottom-4 right-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-r"
    role="alert"
    aria-live="polite"
  >
    <p className="text-yellow-700">
      Performance optimization recommended. Consider lowering the quality settings.
    </p>
  </div>
);

export default {
  LoadingSpinner,
  InitializationScreen,
  ErrorScreen,
  PerformanceWarning,
};