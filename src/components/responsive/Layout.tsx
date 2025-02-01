import React from 'react';
import { useWindowSize } from '../../hooks/useWindowSize';
import { usePatternStore } from '../../store/patterns';
import PatternControls from '../controls/PatternControls';
import { LoadingSpinner } from '../common/LoadingStates';

interface LayoutProps {
  children: React.ReactNode;
  showControls?: boolean;
  loading?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showControls = true,
  loading = false
}) => {
  const { width } = useWindowSize();
  const isTransitioning = usePatternStore(state => state.animationState.isTransitioning);

  const controlsPosition = width > 768 ? 'right-4' : 'bottom-4';

  return (
    <div className="sacred-geometry-layout relative w-full h-screen overflow-hidden">
      <main 
        className="w-full h-full"
        aria-live={isTransitioning ? 'polite' : 'off'}
        aria-atomic="true"
      >
        {children}
      </main>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <LoadingSpinner />
        </div>
      )}

      {showControls && (
        <div 
          className={`fixed ${controlsPosition} top-4 max-w-xs w-full md:w-64`}
          aria-label="Pattern Controls"
        >
          <PatternControls />
        </div>
      )}
    </div>
  );
};

export default Layout;