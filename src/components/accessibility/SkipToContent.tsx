import React from 'react';

export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0
                 bg-primary text-white px-4 py-2 z-50"
    >
      Skip to main content
    </a>
  );
};