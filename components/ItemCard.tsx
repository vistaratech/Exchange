'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/types/exchange';
import { useApp } from '@/context/AppContext';
import { HeartIcon, LocationIcon, ExchangeIcon } from '@/components/Icons';

interface ItemCardProps {
  post: Post;
}

export const ItemCard: React.FC<ItemCardProps> = ({ post }) => {
  const router = useRouter();
  const { saved, toggleSave, setProposalModalTargetId, toast, user } = useApp();
  const isSaved = saved.includes(post.id);

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.mine || post.owner === user?.first) {
      toast('This is your own post.');
      return;
    }
    router.push(`/messages?user=${encodeURIComponent(post.owner)}&post=${encodeURIComponent(post.title)}`);
  };

  const handlePropose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.mine || post.owner === user?.first) {
      toast('Choose someone else’s post to propose an exchange.');
      return;
    }
    setProposalModalTargetId(post.id);
  };

  return (
    <article className="item-card enhanced-barter-card">
      <Link href={`/post?id=${post.id}`} className="item-image-wrap">
        <img
          className="item-image"
          src={post.image}
          alt={post.title}
          loading="lazy"
        />

        <div className="card-glass-overlay" />

        <button
          type="button"
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSave(post.id);
          }}
          aria-label={isSaved ? 'Remove from saved' : 'Save post'}
        >
          <HeartIcon size={16} filled={isSaved} color={isSaved ? '#e04848' : '#1b3b33'} />
        </button>

        <span className="condition-chip">
          <span className="condition-dot" />
          {post.condition}
        </span>

        {post.category && (
          <span className="category-tag-floating">{post.category}</span>
        )}
      </Link>

      <div className="item-content">
        <div className="item-title-row">
          <Link href={`/post?id=${post.id}`} className="item-title">
            {post.title}
          </Link>
        </div>

        {/* ── THEMATIC BARTER BADGE: What they want in return! ── */}
        <div className="barter-wanted-box">
          <div className="wanted-header">
            <span className="swap-icon-tiny">⇄</span>
            <span>WANTS IN RETURN:</span>
          </div>
          <p className="wanted-text" title={post.wanted || 'Any good trade'}>
            {post.wanted || 'Open to interesting offers'}
          </p>
        </div>

        <div className="item-meta-strip">
          <div className="item-location">
            <LocationIcon size={12} color="var(--ink-soft)" />
            <span>{post.locality ? `${post.locality}, ${post.city}` : post.city}</span>
          </div>
          <div className="item-trader-inline">
            <img src={post.avatar} alt={post.owner} className="trader-avatar-tiny" />
            <span>{post.owner}</span>
          </div>
        </div>

        <div className="item-actions">
          <button
            type="button"
            className="btn btn-card-msg"
            onClick={handleMessage}
            title="Chat with owner"
          >
            Message
          </button>
          <button
            type="button"
            className="btn btn-card-swap"
            onClick={handlePropose}
            title="Propose direct item swap"
          >
            <span className="swap-arrow-rot">⇄</span>
            <span>Swap Item</span>
          </button>
        </div>
      </div>
    </article>
  );
};
