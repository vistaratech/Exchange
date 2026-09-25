'use client';

import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('PWA ServiceWorker registered:', reg.scope))
        .catch((err) => console.error('PWA ServiceWorker registration failed:', err));
    }

    // Check if already running in standalone mode (installed)
    if (typeof window !== 'undefined') {
      const isRunningStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isRunningStandalone);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Don't show if user previously dismissed in this session
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted PWA installation');
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isStandalone || !showBanner || !deferredPrompt) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 84,
        left: 16,
        right: 16,
        zIndex: 9999,
        background: 'linear-gradient(135deg, rgba(15, 55, 45, 0.96), rgba(8, 34, 27, 0.98))',
        border: '1px solid rgba(52, 211, 153, 0.35)',
        borderRadius: 16,
        padding: '12px 16px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45), 0 0 16px rgba(52, 211, 153, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        color: '#f4ede2',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img
          src="/icon-192.png"
          alt="Exchange App Icon"
          style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
        />
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#f4ede2' }}>Install EXCHANGE App</div>
          <div style={{ fontSize: 12, color: 'rgba(244, 237, 226, 0.75)' }}>Add to your Android home screen</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          onClick={handleInstall}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            padding: '7px 14px',
            borderRadius: 10,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          }}
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(244, 237, 226, 0.6)',
            fontSize: 18,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
          aria-label="Dismiss banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
