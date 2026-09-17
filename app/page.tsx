'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { categories } from '@/utils/seedData';
import { ItemCard } from '@/components/ItemCard';
import { ShieldIcon, SearchIcon, PlusIcon, getCategoryIcon } from '@/components/Icons';

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

  const handleCategoryClick = (name: string) => {
    const nextCategory = selectedCategory.toLowerCase() === name.toLowerCase() ? '' : name;
    setSelectedCategory(nextCategory);

    // If user clicks a category, smoothly scroll to feed so they see the filtered list immediately
    if (nextCategory) {
      setTimeout(() => {
        const feedEl = document.getElementById('feed');
        if (feedEl) {
          feedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedCity('');
    setSelectedCondition('');
    setOpenToAny(false);
  };

  return (
    <main className="shell">
      {/* Home Hero */}
      <section className="home-hero">
        <div>
          <div className="eyebrow">A better kind of peer-to-peer barter</div>
          <h1>
            Trade stories,<br />
            not transactions.
          </h1>
          <p>
            Exchange useful items with people around you — no money, no prices, no checkout.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <PlusIcon size={16} />
          <span>Post an item</span>
        </button>
      </section>

      {/* Mobile Search Bar */}
      <div className="mobile-search-bar">
        <span><SearchIcon size={16} /></span>
        <input
          type="search"
          placeholder="Search items, categories, or cities…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      {/* Trust & Safety Advisory Banner */}
      <div
        style={{
          background: '#eff6e6',
          border: '1px solid #d4e8c5',
          borderRadius: 16,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          margin: '20px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldIcon size={22} color="var(--pine)" />
          <span style={{ fontSize: 13, color: 'var(--pine)', fontWeight: 600 }}>
            Public Safety: 100% No-Price Barter. Always meet in public daylight locations. Never send money or courier fees.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsSafetyModalOpen(true)}
          style={{
            background: 'none',
            border: 0,
            color: 'var(--pine)',
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Read Safety Rules →
        </button>
      </div>

      {/* Categories Section */}
      <section className="section" id="categories">
        <div className="section-heading">
          <h2>Browse by category</h2>
          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              style={{ color: 'var(--pine)', fontSize: 13 }}
            >
              Clear category ({selectedCategory}) ×
            </button>
          )}
        </div>
        <div className="categories">
          {categories.map(([name, icon]) => {
            const isSelected = selectedCategory.toLowerCase() === name.toLowerCase();
            return (
              <button
                key={name}
                type="button"
                className={`category ${isSelected ? 'selected' : ''}`}
                onClick={() => handleCategoryClick(name)}
                aria-pressed={isSelected}
              >
                <i className="category-icon">{getCategoryIcon(name, 22)}</i>
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Feed with Filters */}
      <section className="section" id="feed">
        <div className="section-heading">
          <h2>
            {selectedCategory
              ? `${selectedCategory} (${filteredPosts.length})`
              : search
              ? `Search results for “${search}” (${filteredPosts.length})`
              : 'Live Community Exchanges'}
          </h2>
          {(selectedCategory || selectedCity || selectedCondition || openToAny || search) && (
            <button type="button" onClick={clearFilters}>
              Reset all filters
            </button>
          )}
        </div>

        <div className="feed-layout">
          {/* Filters Sidebar */}
          <aside className="filters">
            <h3>Filter exchanges</h3>

            <div className="filter-group">
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All categories</option>
                {categories.map(([n]) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Location</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">Anywhere in India</option>
                {[
                  'Chennai',
                  'Bangalore',
                  'Hyderabad',
                  'Mumbai',
                  'Delhi',
                  'Kochi',
                  'Pune',
                  'Coimbatore',
                  'Madurai',
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
              >
                <option value="">Any condition</option>
                {['New', 'Like New', 'Good', 'Fair'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="check">
                <input
                  type="checkbox"
                  checked={openToAny}
                  onChange={(e) => setOpenToAny(e.target.checked)}
                />
                Open to any exchange
              </label>
            </div>
          </aside>

          {/* Posts Grid */}
          <div>
            {isLoadingPosts ? (
              <div className="empty" style={{ padding: '60px 20px' }}>
                <b>Loading community items…</b>
                <span>Connecting to live Supabase exchange database.</span>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="item-grid">
                {filteredPosts.map((post) => (
                  <ItemCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="empty">
                <b>Be the first to post an item!</b>
                <p style={{ maxWidth: 440, margin: '8px auto 16px', fontSize: 14 }}>
                  {selectedCategory
                    ? `No items posted under ${selectedCategory} yet.`
                    : 'No items matching your search.'}{' '}
                  Start the circular exchange community in your city by posting what you have!
                </p>
                <div
                  className="inline-actions"
                  style={{ justifyContent: 'center' }}
                >
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <PlusIcon size={16} />
                    <span>Post an item now</span>
                  </button>
                  {(selectedCategory || selectedCity || search) && (
                    <button
                      type="button"
                      className="btn btn-quiet"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="empty" style={{ margin: '40px auto' }}>Loading feed…</div>}>
      <HomeContent />
    </Suspense>
  );
}
