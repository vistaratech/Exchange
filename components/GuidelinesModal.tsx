'use client';

import React from 'react';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidelinesModal: React.FC<GuidelinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="guidelines-title">
      <div className="modal" style={{ maxWidth: 580 }}>
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <h2 id="guidelines-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>📋</span> Community Rules & Prohibited Items
        </h2>
        <p>
          To protect the community and ensure safe exchanges, the following items and behaviors are <strong>strictly forbidden</strong> on EXCHANGE:
        </p>

        <div style={{ display: 'grid', gap: 10, margin: '16px 0' }}>
          <div style={{ background: '#fff0ed', border: '1px solid #f9d2cb', borderRadius: 12, padding: 12 }}>
            <b style={{ color: '#b4402d', fontSize: 13 }}>❌ Prohibited Items:</b>
            <ul style={{ margin: '6px 0 0', paddingLeft: 20, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              <li><strong>Currency & Cash:</strong> Currency notes, coins, crypto, loans, gift cards, or financial instruments.</li>
              <li><strong>Weapons & Fireworks:</strong> Firearms, knives, ammunition, explosives, pepper sprays.</li>
              <li><strong>Substances:</strong> Alcohol, tobacco, vape/e-cigarettes, drugs, prescription medication.</li>
              <li><strong>Stolen or Counterfeit Goods:</strong> Replicas, pirated digital media, or unverified locked devices.</li>
              <li><strong>Animals & Wildlife:</strong> Pets, live animals, ivory, animal skins.</li>
              <li><strong>Adult Content:</strong> Explicit material, services, or adult products.</li>
            </ul>
          </div>

          <div style={{ background: '#eff6e6', border: '1px solid #d4e8c5', borderRadius: 12, padding: 12 }}>
            <b style={{ color: 'var(--pine)', fontSize: 13 }}>✅ Welcome on EXCHANGE:</b>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              Books, musical instruments, gadgets, computer accessories, clean furniture, sports gear, home decor, bicycles, photography equipment, and thoughtful items in working condition!
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
