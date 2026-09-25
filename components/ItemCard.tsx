'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/types/exchange';
import { useApp } from '@/context/AppContext';
import { HeartIcon, LocationIcon } from '@/components/Icons';

interface ItemCardProps {
  post: Post;
}

export const ItemCard: React.FC<ItemCardProps> = ({ post }) => {
  const router = useRouter();
  const { saved, toggleSave, setProposalModalTargetId, toast, user } = useApp();
  const isSaved = saved.includes(post.id);

  const isMine = post.mine || post.owner === user?.first;

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMine) {
      toast('This is your own post.');
      return;
    }
    router.push(`/messages?user=${encodeURIComponent(post.owner)}&post=${encodeURIComponent(post.title)}`);
  };

  const handlePropose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMine) {
      toast('Choose someone else’s post to propose an exchange.');
      return;
    }
    setProposalModalTargetId(post.id);
  };

  return (
    <article className="vinted-card">
      <Link href={`/post?id=${post.id}`} className="vinted-card-link">
        {/* Image & Floating Badges */}
        <div className="vinted-img-wrap">
          <img
            src={post.image}
            alt={post.title}
            className="vinted-img"
            loading="lazy"
          />

          {/* Condition Chip */}
          <span className="vinted-badge-condition">
            <span className="condition-indicator" />
            {post.condition}
          </span>

          {/* Save Button */}
          <button
            type="button"
            className={`vinted-save-btn ${isSaved ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSave(post.id);
            }}
            aria-label={isSaved ? 'Remove from saved' : 'Save post'}
          >
            <HeartIcon size={16} filled={isSaved} color={isSaved ? '#ef4444' : '#1e293b'} />
          </button>

          {/* Category Chip */}
          {post.category && (
            <span className="vinted-badge-category">
              {post.category}
            </span>
          )}
        </div>

        {/* Card Body */}
        <div className="vinted-body">
          {/* Owner row */}
          <div className="vinted-owner-row">
            <img src={post.avatar || '/phone.svg'} alt={post.owner} className="vinted-avatar" />
            <span className="vinted-owner-name">{post.owner}</span>
            <span className="vinted-dot">·</span>
            <span className="vinted-time">{post.time || 'Today'}</span>
          </div>

          {/* Title */}
          <h3 className="vinted-title">{post.title}</h3>

          {/* THE SIGNATURE BARTER BADGE: What they want in return */}
          <div className="vinted-wanted-box">
            <span className="vinted-swap-icon">⇄</span>
            <div className="vinted-wanted-text">
              <span className="vinted-wanted-label">Wants: </span>
              <b>{post.wanted || 'Open to any item'}</b>
            </div>
          </div>

          {/* Location */}
          <div className="vinted-location">
            <LocationIcon size={12} color="#64748b" />
            <span>{post.locality ? `${post.locality}, ${post.city}` : post.city}</span>
          </div>

          {/* Quick Action Footer */}
          <div className="vinted-actions">
            <button
              type="button"
              className="vinted-btn-outline"
              onClick={handleMessage}
            >
              Chat
            </button>
            <button
              type="button"
              className="vinted-btn-primary"
              onClick={handlePropose}
            >
              Propose Swap
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
};
