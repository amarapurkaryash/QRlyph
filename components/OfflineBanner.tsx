import React, { useState, useEffect } from 'react';
import { IconCheck, IconClose } from './icons';

const OfflineBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('qrlyph_visited');
    if (isFirstVisit) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('qrlyph_visited', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-surface border border-border rounded-lg shadow-lg p-4 max-w-sm animate-fade-in-up">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconCheck className="h-6 w-6 text-green-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-bold uppercase tracking-wider text-text-main">Ready for Offline Use</p>
          <p className="mt-1 text-sm text-text-subtle">
            Once loaded, QRlyph works offline — even in airplane mode.
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleDismiss}
            className="inline-flex rounded-md bg-surface text-text-subtle hover:text-text-main focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            aria-label="Dismiss"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineBanner;