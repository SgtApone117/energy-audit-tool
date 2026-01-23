'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleRegister = () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.warn('Service worker registration failed:', error);
      });
    };

    window.addEventListener('load', handleRegister);
    return () => window.removeEventListener('load', handleRegister);
  }, []);

  return null;
}
