'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ItemCard } from '@/components/ItemCard';
import { MarketplaceBanner } from '@/components/MarketplaceBanner';
import { categories } from '@/utils/seedData';

function HomeContent() {
  const searchParams = useSearchParams();
  const {
    posts,
    isLoadingPosts,
    search,
    setSearch,
    setIsCreateModalOpen,
    setIsSafetyModalOpen,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [openToAny, setOpenToAny] = useState<boolean>(false);

  // Read URL params if any
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const filteredPosts = posts.filter((p) => {
    if (p.status === 'archived' || p.status === 'removed') return false;

    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      [p.title, p.category, p.city, p.locality, p.wanted, p.description]
        .join(' ')
        .toLowerCase()
        .includes(q);

    const matchCategory =
      !selectedCategory ||
      p.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();

    const matchCity =
      !selectedCity || p.city?.trim().toLowerCase() === selectedCity.trim().toLowerCase();

    const matchCondition =
      !selectedCondition ||
      p.condition?.trim().toLowerCase() === selectedCondition.trim().toLowerCase();

    const matchAny =
      !openToAny || /any|interesting|creative|surprise/i.test(p.wanted);

    return matchSearch && matchCategory && matchCity && matchCondition && matchAny;
  });

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedCity('');
    setSelectedCondition('');
    setOpenToAny(false);
  };

  const hasActiveFilters = Boolean(
    selectedCategory || selectedCity || selectedCondition || openToAny || search
  );

  return (
    <main className="marketplace-shell">
      {/* ── TOP MOBILE-FIRST MARKETPLACE BANNER & SEARCH & CATEGORIES ── */}
      <MarketplaceBanner
        onPostClick={() => setIsCreateModalOpen(true)}
        onSafetyClick={() => setIsSafetyModalOpen(true)}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        search={search}
        onSearchChange={setSearch}
      />

      {/* ── CLEAN FILTER STRIP ── */}
      <section className="marketplace-filter-toolbar" id="feed">
        <div className="filter-toolbar-left">
          <span className="results-count">
            <b>{filteredPosts.length}</b> {filteredPosts.length === 1 ? 'item available' : 'items available to swap'}
            {selectedCategory && <span className="cat-badge">in {selectedCategory}</span>}
          </span>
        </div>

        <div className="filter-toolbar-right">
          {/* City select */}
          <select
            className="filter-select"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">📍 All Cities</option>
            {[
              'Chennai',
              'Bangalore',
              'Hyderabad',
              'Mumbai',
              'Delhi',
              'Kochi',
              'Coimbatore',
              'Pune',
              'Madurai',
            ].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Condition select */}
          <select
            className="filter-select"
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
          >
            <option value="">Condition: Any</option>
            <option value="Brand New">Brand New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>

          {/* Open to any checkbox pill */}
          <button
            type="button"
            className={`filter-pill-btn ${openToAny ? 'active' : ''}`}
            onClick={() => setOpenToAny(!openToAny)}
          >
            {openToAny ? '✓ Open to any' : '+ Open to any'}
          </button>

          {hasActiveFilters && (
            <button type="button" className="filter-reset-link" onClick={clearFilters}>
              Reset
            </button>
          )}
        </div>
      </section>

      {/* ── VINTED / MARKETPLACE ITEM GRID ── */}
      <section className="marketplace-grid-section">
        {isLoadingPosts ? (
          <div className="marketplace-loading">
            <div className="loading-spinner" />
            <p>Loading community items...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="marketplace-empty">
            <div className="empty-icon">🔍</div>
            <h3>No items found</h3>
            <p>Try adjusting your search keywords or reset active filters.</p>
            <button type="button" className="btn-marketplace-primary" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="vinted-grid">
            {filteredPosts.map((post) => (
              <ItemCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="shell"><div className="empty">Loading...</div></div>}>
      <HomeContent />
    </Suspense>
  );
}
