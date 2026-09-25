'use client';

import React, { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, ShieldIcon } from '@/components/Icons';

interface SwapPair {
  id: string;
  category: string;
  itemA: {
    title: string;
    condition: string;
    city: string;
    image: string;
    owner: string;
    avatar: string;
  };
  itemB: {
    title: string;
    condition: string;
    city: string;
    image: string;
    owner: string;
    avatar: string;
  };
}

const SAMPLE_SWAPS: SwapPair[] = [
  {
    id: 'swap-1',
    category: 'Electronics ⇄ Music',
    itemA: {
      title: 'Fujifilm X-T30 Mirrorless 4K',
      condition: 'Like New',
      city: 'Chennai',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      owner: 'Karthik R.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    },
    itemB: {
      title: 'Taylor GS Mini Solid Mahogany',
      condition: 'Mint',
      city: 'Bangalore',
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80',
      owner: 'Ananya S.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'swap-2',
    category: 'Gadgets ⇄ Outdoor',
    itemA: {
      title: 'Sony WH-1000XM5 Headset',
      condition: 'Excellent',
      city: 'Hyderabad',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      owner: 'Vikram V.',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    },
    itemB: {
      title: 'Quechua 4-Person Camping Tent',
      condition: 'Brand New',
      city: 'Coimbatore',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80',
      owner: 'Pooja M.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'swap-3',
    category: 'Gaming ⇄ Workspace',
    itemA: {
      title: 'Keychron Q1 Pro Mechanical Board',
      condition: 'Like New',
      city: 'Bangalore',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
      owner: 'Deepak T.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    itemB: {
      title: 'Ergonomic Mesh Highback Chair',
      condition: 'Like New',
      city: 'Chennai',
      image: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=600&q=80',
      owner: 'Harini K.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    },
  },
];

const RECENT_LIVE_TRADES = [
  '⚡ Rahul (Chennai) traded Polaroid Go for Espresso Maker · 3m ago',
  '🔥 Divya (Bangalore) swapped iPad 10th Gen for Kindle Oasis · 6m ago',
  '✨ Manoj (Hyderabad) exchanged Road Bicycle for Tent & Stove · 11m ago',
  '🌿 Sneha (Kochi) swapped Ceramic Crockery for Bonsai Ficus · 18m ago',
  '💎 Arun (Mumbai) traded Mechanical Watch for Studio Mic · 24m ago',
];

interface BarterHeroArenaProps {
  onPostClick: () => void;
  onSafetyClick: () => void;
  onFindMatch: (haveText: string, wantText: string) => void;
}

export function BarterHeroArena({ onPostClick, onSafetyClick, onFindMatch }: BarterHeroArenaProps) {
  const [activeSwapIndex, setActiveSwapIndex] = useState(0);
  const [isSwapped, setIsSwapped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [successBurst, setSuccessBurst] = useState(false);

  const [haveQuery, setHaveQuery] = useState('');
  const [wantQuery, setWantQuery] = useState('');

  const currentPair = SAMPLE_SWAPS[activeSwapIndex];

  // Auto trigger subtle swap demo every 12 seconds if user isn't interacting
  useEffect(() => {
    const timer = setInterval(() => {
      handleSwapTrigger();
    }, 12000);
    return () => clearInterval(timer);
  }, [isSwapped, activeSwapIndex]);

  const handleSwapTrigger = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsSwapped((prev) => !prev);
    setSuccessBurst(true);

    setTimeout(() => {
      setSuccessBurst(false);
      setIsAnimating(false);
    }, 1200);
  };

  const handleSelectPair = (index: number) => {
    setIsAnimating(true);
    setActiveSwapIndex(index);
    setIsSwapped(false);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const handleMatcherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFindMatch(haveQuery, wantQuery);
  };

  const firstItem = isSwapped ? currentPair.itemB : currentPair.itemA;
  const secondItem = isSwapped ? currentPair.itemA : currentPair.itemB;

  return (
    <div className="barter-hero-wrapper">
      {/* ── LIVE REAL-TIME TRICKER ── */}
      <div className="live-ticker-bar">
        <div className="ticker-badge">
          <span className="live-dot" />
          <span>LIVE SWAPS</span>
        </div>
        <div className="ticker-track">
          <div className="ticker-content">
            {RECENT_LIVE_TRADES.concat(RECENT_LIVE_TRADES).map((text, idx) => (
              <span key={idx} className="ticker-item">
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN HERO STAGE ── */}
      <div className="barter-stage">
        {/* Background Ambient Glow Orbs */}
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />
        <div className="ambient-mesh" />

        <div className="stage-left">
          <div className="hero-eyebrow-pill">
            <span className="pulse-icon">⇄</span>
            <span>100% Cashless Peer-to-Peer Barter</span>
          </div>

          <h1 className="hero-punchline">
            What You Have.
            <br />
            <span className="gradient-text">What You Want.</span>
            <br />
            Just Swap.
          </h1>

          <p className="hero-subtitle">
            Say goodbye to price negotiations, hidden platform fees, and scams. Trade your
            valuable unused items directly with trusted people in your city.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="btn btn-emerald-glow"
              onClick={onPostClick}
            >
              <PlusIcon size={18} />
              <span>List What You Have</span>
              <span className="btn-tag">Free</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost-glass"
              onClick={onSafetyClick}
            >
              <ShieldIcon size={16} color="#34d399" />
              <span>Safe Barter Rules</span>
            </button>
          </div>

          {/* Quick Stats Strip */}
          <div className="hero-stats-row">
            <div className="stat-pill">
              <b>₹0</b>
              <span>Money Spent</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-pill">
              <b>100%</b>
              <span>Direct Barter</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-pill">
              <b>3.2k+</b>
              <span>Verified Swappers</span>
            </div>
          </div>
        </div>

        {/* ── 3D INTERACTIVE SWAP ARENA (STAGE RIGHT) ── */}
        <div className="stage-right">
          <div className="arena-header">
            <span className="arena-title">LIVE BARTER SIMULATOR</span>
            <div className="arena-pills">
              {SAMPLE_SWAPS.map((swap, idx) => (
                <button
                  key={swap.id}
                  type="button"
                  className={`arena-tab-pill ${activeSwapIndex === idx ? 'active' : ''}`}
                  onClick={() => handleSelectPair(idx)}
                >
                  {swap.category}
                </button>
              ))}
            </div>
          </div>

          <div className={`swap-arena-stage ${isAnimating ? 'swapping' : ''}`}>
            {/* Success Burst Toast Notification */}
            {successBurst && (
              <div className="swap-success-flash">
                <span className="flash-emoji">🎉</span>
                <span>Perfect Match! Zero cash, 100% value!</span>
              </div>
            )}

            {/* Left Card: Given Item */}
            <div className="arena-card card-give">
              <div className="card-top-tag">
                <span className="tag-circle give" />
                <span>{isSwapped ? 'WANTED TO RECEIVE' : 'OFFERING TO TRADE'}</span>
              </div>
              <div className="arena-img-container">
                <img src={firstItem.image} alt={firstItem.title} />
                <span className="card-city-chip">{firstItem.city}</span>
              </div>
              <div className="arena-card-body">
                <h4 className="card-item-name">{firstItem.title}</h4>
                <div className="card-trader-row">
                  <img src={firstItem.avatar} alt={firstItem.owner} className="trader-avatar" />
                  <div className="trader-meta">
                    <b>{firstItem.owner}</b>
                    <small>Condition: {firstItem.condition}</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Dynamic Orbit Core */}
            <div className="arena-center-core">
              <div className="orbit-energy-line" />
              <button
                type="button"
                className="interactive-swap-orb"
                onClick={handleSwapTrigger}
                title="Click to trigger animated swap!"
                aria-label="Swap items"
              >
                <div className="orb-ring ring-1" />
                <div className="orb-ring ring-2" />
                <div className="orb-center">
                  <span className={`orb-arrow ${isAnimating ? 'spinning' : ''}`}>⇄</span>
                </div>
              </button>
              <span className="tap-hint">Tap to Swap</span>
            </div>

            {/* Right Card: Wanted Item */}
            <div className="arena-card card-receive">
              <div className="card-top-tag">
                <span className="tag-circle get" />
                <span>{isSwapped ? 'OFFERING TO TRADE' : 'WANTED TO RECEIVE'}</span>
              </div>
              <div className="arena-img-container">
                <img src={secondItem.image} alt={secondItem.title} />
                <span className="card-city-chip">{secondItem.city}</span>
              </div>
              <div className="arena-card-body">
                <h4 className="card-item-name">{secondItem.title}</h4>
                <div className="card-trader-row">
                  <img src={secondItem.avatar} alt={secondItem.owner} className="trader-avatar" />
                  <div className="trader-meta">
                    <b>{secondItem.owner}</b>
                    <small>Condition: {secondItem.condition}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TWO-SIDED SMART MATCH BAR ("I HAVE" ⇄ "I WANT") ── */}
      <form className="smart-match-bar" onSubmit={handleMatcherSubmit}>
        <div className="match-input-box">
          <label>
            <span className="label-dot give" />
            <span>I HAVE TO TRADE:</span>
          </label>
          <div className="input-wrap">
            <input
              type="text"
              placeholder="e.g. Mechanical Keyboard, Canon DSLR..."
              value={haveQuery}
              onChange={(e) => setHaveQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="match-center-divider">
          <div className="swap-icon-badge">⇄</div>
        </div>

        <div className="match-input-box">
          <label>
            <span className="label-dot get" />
            <span>LOOKING TO GET:</span>
          </label>
          <div className="input-wrap">
            <input
              type="text"
              placeholder="e.g. Guitar, Headphones, Camping Tent..."
              value={wantQuery}
              onChange={(e) => setWantQuery(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="match-submit-btn">
          <SearchIcon size={16} />
          <span>Find Direct Swaps</span>
        </button>
      </form>
    </div>
  );
}
