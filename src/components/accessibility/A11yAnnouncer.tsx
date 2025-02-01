import React, { useEffect, useState } from 'react';

interface AnnouncerProps {
  pattern: string;
  intensity: number;
}

export const A11yAnnouncer: React.FC<AnnouncerProps> = ({ pattern, intensity }) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    setAnnouncement(`Pattern changed to ${pattern.replace('-', ' ')}. Energy flow intensity: ${Math.round(intensity * 100)}%`);
  }, [pattern, intensity]);

  return (
    <div 
      role="status" 
      aria-live="polite" 
      className="sr-only"
    >
      {announcement}
    </div>
  );
};

export default A11yAnnouncer;