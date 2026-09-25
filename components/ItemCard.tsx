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
    <article className="item-card">
      <Link href={`/post?id=${post.id}`} className="item-image-wrap">
        <img
          className="item-image"
          src={post.image}
          alt={post.title}
          loading="lazy"
        />
        <button
          type="button"
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSave(post.id);
          }}
          aria-label={isSaved ? 'Remove from saved' : 'Save post'}
          style={{ display: 'grid', placeItems: 'center' }}
        >
          <HeartIcon size={16} filled={isSaved} color={isSaved ? '#e04848' : '#1b3b33'} />
        </button>
        <span className="condition-chip">{post.condition}</span>
      </Link>

      <div className="item-content">
        <div className="item-title-row">
          <Link href={`/post?id=${post.id}`} className="item-title">
            {post.title}
          </Link>
        </div>

        <div className="item-location" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <LocationIcon size={12} color="var(--ink-soft)" />
          <span>{post.locality ? `${post.locality}, ${post.city}` : post.city}</span>
        </div>

        <div className="item-owner">
          {post.owner} · {post.time}
        </div>

        <div className="exchange-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <ExchangeIcon size={13} color="var(--pine)" />
          <span>Open to exchange</span>
        </div>

        <div className="item-actions">
          <button
            type="button"
            className="btn btn-quiet"
            onClick={handleMessage}
          >
            Message
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePropose}
          >
            Exchange
          </button>
        </div>
      </div>
    </article>
  );
};
