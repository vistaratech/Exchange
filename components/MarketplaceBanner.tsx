'use client';

import React from 'react';
import { PlusIcon, ShieldIcon, SearchIcon, getCategoryIcon } from '@/components/Icons';
import { categories } from '@/utils/seedData';

interface MarketplaceBannerProps {
  onPostClick: () => void;
  onSafetyClick: () => void;
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function MarketplaceBanner({
  onPostClick,
  onSafetyClick,
  selectedCategory,
  onCategorySelect,
  search,
  onSearchChange,
}: MarketplaceBannerProps) {
  return (
    <div className="marketplace-top-section">
      {/* ── CLEAN VINTED / MARKETPLACE HERO ── */}
      <div className="marketplace-hero-card">
        <div className="hero-card-left">
          <div className="hero-pill-badge">
            <span className="badge-pulse-dot" />
            <span>Direct Item-to-Item Barter</span>
          </div>

          <h1 className="hero-heading">
            Trade what you have.
            <br />
            <span className="hero-heading-highlight">Get what you need.</span>
          </h1>

          <p className="hero-desc">
            No prices, no cash payments, no commission. Direct, safe barter with verified members across your city.
          </p>

          <div className="hero-btn-row">
            <button
              type="button"
              className="btn-marketplace-primary"
              onClick={onPostClick}
            >
              <PlusIcon size={16} />
              <span>Post an Item to Trade</span>
            </button>

            <button
              type="button"
              className="btn-marketplace-secondary"
              onClick={onSafetyClick}
            >
              <ShieldIcon size={15} color="#059669" />
              <span>How Safe Barter Works</span>
            </button>
          </div>
        </div>

        <div className="hero-card-right">
          <div className="hero-mini-visual">
            <div className="visual-trade-chip left">
              <span className="chip-emoji">📸</span>
              <div>
                <b>Camera</b>
                <small>Offering</small>
              </div>
            </div>
            <div className="visual-center-arrow">⇄</div>
            <div className="visual-trade-chip right">
              <span className="chip-emoji">🎸</span>
              <div>
                <b>Guitar</b>
                <small>Receiving</small>
              </div>
            </div>
          </div>
          <div className="hero-badge-tag">Zero cash needed · 100% Barter</div>
        </div>
      </div>

      {/* ── SEARCH & FILTER STRIP ── */}
      <div className="marketplace-search-strip">
        <div className="search-input-wrapper">
          <SearchIcon size={18} color="#64748b" />
          <input
            type="search"
            placeholder="Search items, desired trades (e.g. 'Camera', 'Keyboard', 'Guitar')..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── HORIZONTAL CATEGORIES CAROUSEL (Vinted Stories Style) ── */}
      <div className="marketplace-categories-scroll">
        <button
          type="button"
          className={`category-pill ${!selectedCategory ? 'active' : ''}`}
          onClick={() => onCategorySelect('')}
        >
          <span className="cat-icon-wrap">✨</span>
          <span>All Items</span>
        </button>

        {categories.map(([name]) => {
          const isSelected = selectedCategory.toLowerCase() === name.toLowerCase();
          return (
            <button
              key={name}
              type="button"
              className={`category-pill ${isSelected ? 'active' : ''}`}
              onClick={() => onCategorySelect(isSelected ? '' : name)}
            >
              <span className="cat-icon-wrap">{getCategoryIcon(name, 18)}</span>
              <span>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
