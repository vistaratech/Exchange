'use client';

import React, { useState } from 'react';

export function HowItWorksAnimated() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Snap & Post What You Have',
      desc: 'Got tech, musical instruments, cameras, or gear lying around? Upload 2-3 photos, describe the condition, and list what kind of items you’d love in exchange.',
      highlight: 'No pricing tags. No undervaluation.',
      tag: 'Step 1: Listing',
      visual: (
        <div className="step-mockup-card">
          <div className="mockup-header">
            <span className="mockup-dot red" />
            <span className="mockup-dot yellow" />
            <span className="mockup-dot green" />
            <span className="mockup-title">Instant Item Post</span>
          </div>
          <div className="mockup-body upload-demo">
            <div className="mockup-photo-box">
              <img
                src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80"
                alt="Demo Polaroid Camera"
              />
              <span className="upload-badge">✓ Photos Added</span>
            </div>
            <div className="mockup-info">
              <span className="info-title">Vintage Polaroid Now+</span>
              <div className="info-wanted-tag">Looking for: Acoustic Guitar / Coffee Gear</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '02',
      title: 'Discover & Propose Direct Swaps',
      desc: 'Browse items across your city. Found something you want? Tap "Propose Exchange" and offer one of your items. No awkward money haggling.',
      highlight: 'Direct peer-to-peer item matching.',
      tag: 'Step 2: Proposing',
      visual: (
        <div className="step-mockup-card">
          <div className="mockup-header">
            <span className="mockup-dot red" />
            <span className="mockup-dot yellow" />
            <span className="mockup-dot green" />
            <span className="mockup-title">1-Click Swap Proposal</span>
          </div>
          <div className="mockup-body match-demo">
            <div className="match-item-bubble left">
              <img
                src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=150&q=80"
                alt="Item A"
              />
              <small>Your Camera</small>
            </div>
            <div className="match-center-pulse">
              <span className="pulse-arrow">⇄</span>
              <small>PROPOSED</small>
            </div>
            <div className="match-item-bubble right">
              <img
                src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=150&q=80"
                alt="Item B"
              />
              <small>Their Guitar</small>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '03',
      title: 'Meet in Daylight & Exchange',
      desc: 'Agree to meet at a busy cafe, metro station, or mall. Inspect both items together, shake hands, and complete the exchange. 100% cashless!',
      highlight: 'Safe community barter protocol.',
      tag: 'Step 3: Handshake',
      visual: (
        <div className="step-mockup-card">
          <div className="mockup-header">
            <span className="mockup-dot red" />
            <span className="mockup-dot yellow" />
            <span className="mockup-dot green" />
            <span className="mockup-title">Safe Exchange Complete</span>
          </div>
          <div className="mockup-body success-demo">
            <div className="success-icon-wrap">
              <span className="success-badge-icon">🤝</span>
            </div>
            <h4>Exchange Completed!</h4>
            <p>Both members rated 5/5 stars ⭐</p>
            <div className="cashless-seal">Zero Cash Spent · Verified Community</div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="how-it-works-section">
      <div className="hiw-header">
        <div className="eyebrow">BARTER SIMPLIFIED</div>
        <h2>How Cashless Barter Works on EXCHANGE</h2>
        <p>Three straightforward steps to turn unused gear into items you actually need.</p>
      </div>

      <div className="hiw-grid">
        {/* Step Selector List */}
        <div className="hiw-steps-nav">
          {steps.map((s, idx) => {
            const isCurrent = activeStep === idx;
            return (
              <div
                key={s.num}
                className={`hiw-step-card ${isCurrent ? 'active' : ''}`}
                onClick={() => setActiveStep(idx)}
                role="button"
                tabIndex={0}
              >
                <div className="step-num-pill">{s.num}</div>
                <div className="step-details">
                  <span className="step-tag">{s.tag}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <div className="step-highlight">
                    <span className="sparkle">✦</span> {s.highlight}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Interactive Stage */}
        <div className="hiw-stage-preview">
          <div className="stage-glow-ambient" />
          <div className="stage-card-wrapper">{steps[activeStep].visual}</div>
        </div>
      </div>
    </section>
  );
}
