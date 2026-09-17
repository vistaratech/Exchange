'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { posts, setProposalModalTargetId, toast, user } = useApp();

  const postId = params.id as string;
  const post = posts.find((p) => p.id === postId);

  const [activeImage, setActiveImage] = useState<string>(post?.image || '');

  if (!post) {
    return (
      <main className="shell">
        <div className="empty" style={{ margin: '40px auto', maxWidth: 600 }}>
          <b>Item not found</b>
          <p>The post you are looking for may have been completed or removed.</p>
          <Link href="/" className="btn btn-primary btn-small" style={{ marginTop: 12 }}>
            ← Back to explore
          </Link>
        </div>
      </main>
    );
  }

  const gallery = [post.image, post.image];
  const isMine = post.mine || post.owner === user?.first;

  const handleMessage = () => {
    if (isMine) {
      toast('This is your own post.');
      return;
    }
    router.push(`/messages?user=${encodeURIComponent(post.owner)}&post=${encodeURIComponent(post.title)}`);
  };

  const handlePropose = () => {
    if (isMine) {
      toast('Choose someone else’s post to propose an exchange.');
      return;
    }
    setProposalModalTargetId(post.id);
  };

  return (
    <main className="shell">
      <section className="detail">
        <div>
          <Link href="/" className="back">
            ← Back to explore
          </Link>

          <img
            className="detail-image"
            id="detail-image"
            src={activeImage || post.image}
            alt={post.title}
          />

          <div className="thumbs">
            {gallery.map((src, i) => (
              <img
                key={i}
                className={`thumb ${(activeImage || post.image) === src ? 'active' : ''}`}
                src={src}
                alt={`${post.title} view ${i + 1}`}
                onClick={() => setActiveImage(src)}
              />
            ))}
          </div>

          <section className="section">
            <h2>About this item</h2>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{post.description}</p>
          </section>

          <section className="section">
            <h2>Safe exchanges start with a conversation</h2>
            <p>
              Keep communication on EXCHANGE. Meet in a comfortable public place and inspect
              each item before confirming an exchange.
            </p>
          </section>
        </div>

        <aside className="detail-panel">
          <div className="eyebrow">{post.category}</div>
          <h1>{post.title}</h1>

          <div className="meta">
            <span>{post.condition} condition</span>
            <span>⌖ {post.locality ? `${post.locality}, ${post.city}` : post.city}</span>
            <span>↔ Open to exchange</span>
          </div>

          <div className="wanted">
            <small>They’re looking for</small>
            <b>{post.wanted}</b>
          </div>

          <div className="inline-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleMessage}
            >
              Message
            </button>
            {!isMine && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePropose}
              >
                Propose exchange
              </button>
            )}
          </div>

          <div className="owner-box">
            <img
              className="avatar"
              src={post.avatar}
              alt={post.owner}
            />
            <div>
              <b>{post.owner}</b>
              <span>★ {post.rating} · {post.exchanges} successful exchanges</span>
            </div>
            <button
              type="button"
              className="link-btn"
              onClick={() => toast('Report received. Thank you for keeping EXCHANGE safe.')}
            >
              Report
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
