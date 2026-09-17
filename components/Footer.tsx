'use client';

import React from 'react';
import Link from 'next/link';

interface FooterProps {
  onOpenSafety: () => void;
  onOpenGuidelines: () => void;
  onOpenCreate: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSafety,
  onOpenGuidelines,
  onOpenCreate,
}) => {
  return (
    <footer style={{ background: 'var(--pine-deep)', color: '#d4e5dc', marginTop: 60, padding: '48px 0 32px' }}>
      <div style={{ width: 'min(1220px, calc(100% - 40px))', margin: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 36 }}>
        <div>
          <div className="wordmark" style={{ color: 'white', fontSize: 18, marginBottom: 12 }}>
            <i className="wordmark-mark" style={{ borderColor: 'white' }}></i>
            EXCHANGE
          </div>
          <p style={{ fontSize: 13, color: '#a3beaf', lineHeight: 1.6, maxWidth: 320, margin: 0 }}>
            Trade stories, not transactions. A dedicated peer-to-peer barter community across India. Zero prices. Zero payments. Just pure item exchange.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'white', fontSize: 14, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Explore
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 9, fontSize: 13 }}>
            <li>
              <Link href="/" style={{ color: '#c1dcd0' }}>Explore fresh exchanges</Link>
            </li>
            <li>
              <button
                type="button"
                onClick={onOpenCreate}
                style={{ background: 'none', border: 0, padding: 0, color: 'var(--leaf)', fontWeight: 700 }}
              >
                ＋ Post an item now
              </button>
            </li>
            <li>
              <Link href="/requests" style={{ color: '#c1dcd0' }}>Your exchange proposals</Link>
            </li>
            <li>
              <Link href="/messages" style={{ color: '#c1dcd0' }}>Direct community chat</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', fontSize: 14, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Trust & Safety
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 9, fontSize: 13 }}>
            <li>
              <button
                type="button"
                onClick={onOpenSafety}
                style={{ background: 'none', border: 0, padding: 0, color: '#c1dcd0', textAlign: 'left' }}
              >
                🛡️ Safe Meetup Guidelines
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={onOpenGuidelines}
                style={{ background: 'none', border: 0, padding: 0, color: '#c1dcd0', textAlign: 'left' }}
              >
                📋 Prohibited Items Policy
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', fontSize: 14, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Community Pledge
          </h4>
          <p style={{ fontSize: 12, color: '#97b8a7', lineHeight: 1.6, margin: 0 }}>
            Every item posted on EXCHANGE is offered in good faith. Always inspect items in person, meet in public spaces, and help give useful things their next life.
          </p>
        </div>
      </div>

      <div style={{ width: 'min(1220px, calc(100% - 40px))', margin: '36px auto 0', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', fontSize: 12, color: '#7e9e8f', gap: 12 }}>
        <span>© {new Date().getFullYear()} EXCHANGE. All community rights reserved.</span>
        <span>Made with care for sustainable, circular barter.</span>
      </div>
    </footer>
  );
};
