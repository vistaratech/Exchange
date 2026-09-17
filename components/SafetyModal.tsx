'use client';

import React from 'react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="safety-title">
      <div className="modal" style={{ maxWidth: 560 }}>
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <h2 id="safety-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🛡️</span> Safe Exchange Guidelines
        </h2>
        <p>
          EXCHANGE is built on community trust and mutual respect. Follow these essential tips to protect yourself during every in-person exchange:
        </p>

        <div style={{ display: 'grid', gap: 14, margin: '18px 0' }}>
          <div style={{ display: 'flex', gap: 12, background: '#eff6e6', padding: 14, borderRadius: 14 }}>
            <span style={{ fontSize: 22 }}>📍</span>
            <div>
              <b style={{ color: 'var(--pine)', fontSize: 14 }}>Meet in Busy Public Places</b>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-soft)' }}>
                Choose well-lit, populated public locations: Metro stations, shopping mall lobbies, coffee shops, or outside police stations. Never meet at secluded spots or late at night.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, background: '#eff6e6', padding: 14, borderRadius: 14 }}>
            <span style={{ fontSize: 22 }}>🚫</span>
            <div>
              <b style={{ color: 'var(--pine)', fontSize: 14 }}>Zero Money & No Shipping Scams</b>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-soft)' }}>
                EXCHANGE is 100% no-price barter. Never pay cash, advance fees, courier charges, or scan UPI QR codes. Anyone asking for payment or gift cards is violating our policy.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, background: '#eff6e6', padding: 14, borderRadius: 14 }}>
            <span style={{ fontSize: 22 }}>🔍</span>
            <div>
              <b style={{ color: 'var(--pine)', fontSize: 14 }}>Inspect the Item Thoroughly</b>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-soft)' }}>
                Take your time to test electronics (turn them on, check charging, camera, battery) and examine the condition before confirming the exchange.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, background: '#eff6e6', padding: 14, borderRadius: 14 }}>
            <span style={{ fontSize: 22 }}>👥</span>
            <div>
              <b style={{ color: 'var(--pine)', fontSize: 14 }}>Bring a Friend Along</b>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-soft)' }}>
                Whenever possible, bring a friend or family member with you to the meeting. Inform someone you trust about your exchange location and time.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
