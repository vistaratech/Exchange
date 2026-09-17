'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserProfile } from '@/types/exchange';
import { SearchIcon, PlusIcon, HeartIcon, BellIcon } from '@/components/Icons';

interface NavbarProps {
  user: UserProfile | null;
  onOpenCreate: () => void;
  onOpenAuth: () => void;
  onSignOut?: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  unreadNotificationsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenCreate,
  onOpenAuth,
  search,
  onSearchChange,
  unreadNotificationsCount = 2,
}) => {
  const pathname = usePathname();

  return (
    <div className="topbar-wrap">
      <header className="topbar">
        <Link href="/" className="wordmark" aria-label="EXCHANGE home">
          <i className="wordmark-mark"></i>
          EXCHANGE
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/" className={pathname === '/' ? 'active' : ''}>
            Explore
          </Link>
          <Link href="/#categories">
            Categories
          </Link>
          <Link href="/messages" className={pathname === '/messages' ? 'active' : ''}>
            Messages
          </Link>
          <Link href="/requests" className={pathname === '/requests' ? 'active' : ''}>
            Requests
          </Link>
        </nav>

        <label className="header-search">
          <span>
            <SearchIcon size={16} />
          </span>
          <input
            placeholder="Search items…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>

        <div className="header-actions">
          <button className="btn btn-primary btn-small" onClick={onOpenCreate} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <PlusIcon size={15} />
            <span>Post an item</span>
          </button>

          <Link href="/requests" className="icon-btn" aria-label="Saved posts" title="Saved Posts">
            <HeartIcon size={18} />
          </Link>

          <Link href="/requests" className="icon-btn" aria-label="Notifications" title="Notifications">
            <BellIcon size={18} />
            {unreadNotificationsCount > 0 && (
              <i className="badge">{unreadNotificationsCount}</i>
            )}
          </Link>

          {user ? (
            <Link href="/profile" className="icon-btn" aria-label="Your profile" style={{ padding: 0, overflow: 'hidden' }}>
              <img
                src={user.avatar || '/phone.svg'}
                alt={user.name}
                className="avatar"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </Link>
          ) : (
            <button className="btn btn-quiet btn-small" onClick={onOpenAuth}>
              Sign In
            </button>
          )}
        </div>
      </header>
    </div>
  );
};
