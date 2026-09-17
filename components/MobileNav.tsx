'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  onOpenCreate: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenCreate }) => {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <Link href="/" className={pathname === '/' ? 'active' : ''} aria-label="Home">
        <span>⌂</span>
        Home
      </Link>
      <Link href="/?focus=search" className={pathname === '/search' ? 'active' : ''} aria-label="Search">
        <span>⌕</span>
        Search
      </Link>
      <button
        type="button"
        className="post-fab"
        onClick={onOpenCreate}
        aria-label="Post an item"
      >
        <span>＋</span>
      </button>
      <Link href="/messages" className={pathname === '/messages' ? 'active' : ''} aria-label="Messages">
        <span>✉</span>
        Messages
      </Link>
      <Link href="/profile" className={pathname === '/profile' ? 'active' : ''} aria-label="Profile">
        <span>◉</span>
        Profile
      </Link>
    </nav>
  );
};
