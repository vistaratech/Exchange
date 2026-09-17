'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, SearchIcon, PlusIcon, MessageIcon, UserIcon } from '@/components/Icons';

interface MobileNavProps {
  onOpenCreate: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenCreate }) => {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <Link href="/" className={pathname === '/' ? 'active' : ''} aria-label="Home">
        <span><HomeIcon size={19} /></span>
        Home
      </Link>
      <Link href="/?focus=search" className={pathname === '/search' ? 'active' : ''} aria-label="Search">
        <span><SearchIcon size={18} /></span>
        Search
      </Link>
      <button
        type="button"
        className="post-fab"
        onClick={onOpenCreate}
        aria-label="Post an item"
      >
        <span><PlusIcon size={24} color="#0d382e" /></span>
      </button>
      <Link href="/messages" className={pathname === '/messages' ? 'active' : ''} aria-label="Messages">
        <span><MessageIcon size={18} /></span>
        Messages
      </Link>
      <Link href="/profile" className={pathname === '/profile' ? 'active' : ''} aria-label="Profile">
        <span><UserIcon size={19} /></span>
        Profile
      </Link>
    </nav>
  );
};
