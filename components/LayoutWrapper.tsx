'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { AuthModal } from './AuthModal';
import { CreatePostModal } from './CreatePostModal';
import { ProposalModal } from './ProposalModal';
import { SafetyModal } from './SafetyModal';
import { GuidelinesModal } from './GuidelinesModal';
import { Footer } from './Footer';

export const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    search,
    setSearch,
    setIsCreateModalOpen,
    setIsAuthModalOpen,
    isSafetyModalOpen,
    setIsSafetyModalOpen,
    isGuidelinesModalOpen,
    setIsGuidelinesModalOpen,
    notifications,
  } = useApp();

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="app" id="app">
      <Navbar
        user={user}
        search={search}
        onSearchChange={setSearch}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        unreadNotificationsCount={unreadCount}
      />

      {children}

      <Footer
        onOpenSafety={() => setIsSafetyModalOpen(true)}
        onOpenGuidelines={() => setIsGuidelinesModalOpen(true)}
        onOpenCreate={() => setIsCreateModalOpen(true)}
      />

      <MobileNav onOpenCreate={() => setIsCreateModalOpen(true)} />

      {/* Global Dialogs */}
      <AuthModal />
      <CreatePostModal />
      <ProposalModal />
      <SafetyModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />
      <GuidelinesModal
        isOpen={isGuidelinesModalOpen}
        onClose={() => setIsGuidelinesModalOpen(false)}
      />
    </div>
  );
};
