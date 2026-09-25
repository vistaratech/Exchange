'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ItemCard } from '@/components/ItemCard';
import { LocationIcon, StarIcon } from '@/components/Icons';

export default function ProfilePage() {
  const {
    user,
    setUser,
    posts,
    saved,
    reviews,
    toast,
    setIsAuthModalOpen,
    signOut,
    deletePost,
  } = useApp();
  const [activeTab, setActiveTab] = useState<'posts' | 'reviews' | 'saved' | 'settings'>('posts');

  const myPosts = posts.filter((p) => p.mine || p.owner === user?.first || p.user_id === user?.id);
  const savedPosts = posts.filter((p) => saved.includes(p.id));

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
  };

  if (!user) {
    return (
      <main className="shell">
        <div className="empty" style={{ margin: '40px auto', maxWidth: 500 }}>
          <b>Sign in to view your profile</b>
          <p>Join EXCHANGE to manage your posts, saved items, and community ratings.</p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 14 }}
            onClick={() => setIsAuthModalOpen(true)}
          >
            Sign in or create account
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="shell">
      {/* Profile Hero */}
      <section className="profile-hero">
        <img
          className="avatar avatar-lg"
          src={user.avatar}
          alt={user.name}
        />
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <LocationIcon size={14} color="var(--ink-soft)" />
            <span>{user.locality}, {user.city} · Member since {user.joined}</span>
          </p>
        </div>
        <div className="profile-stats">
          <div>
            <b style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <StarIcon size={18} color="#f59e0b" />
              <span>{user.rating}</span>
            </b>
            <span>community rating</span>
          </div>
          <div>
            <b>{user.exchanges}</b>
            <span>successful exchanges</span>
          </div>
          <div>
            <b>{myPosts.length}</b>
            <span>active posts</span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="profile-tabs">
        {[
          ['posts', `Posts (${myPosts.length})`],
          ['reviews', `Reviews (${reviews.length})`],
          ['saved', `Saved (${savedPosts.length})`],
          ['settings', 'Settings'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={activeTab === id ? 'active' : ''}
            onClick={() => setActiveTab(id as any)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div>
          {myPosts.length > 0 ? (
            <div className="item-grid">
              {myPosts.map((post) => (
                <div key={post.id} style={{ position: 'relative' }}>
                  <ItemCard post={post} />
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    style={{ position: 'absolute', bottom: 15, right: 15, zIndex: 10 }}
                    onClick={() => handleDeletePost(post.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <b>No items posted yet.</b>
              <span>Have something you no longer need? Post it to exchange!</span>
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="request-list">
          {reviews.map((r, i) => (
            <article key={i} className="review">
              <b style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{r.name}</span>
                <span style={{ display: 'inline-flex', gap: 2 }}>
                  {Array.from({ length: r.rating }).map((_, idx) => (
                    <StarIcon key={idx} size={14} color="#f59e0b" />
                  ))}
                </span>
              </b>
              <p>{r.text}</p>
              <small>{r.time}</small>
            </article>
          ))}
        </div>
      )}

      {/* Saved Tab */}
      {activeTab === 'saved' && (
        <div>
          {savedPosts.length > 0 ? (
            <div className="item-grid">
              {savedPosts.map((post) => (
                <ItemCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <b>No saved items yet.</b>
              <span>Click the heart on any post in explore to save it for later.</span>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <section className="settings">
          <article className="settings-group">
            <h3>Account</h3>
            <p>{user.name}</p>
            <p>{user.email || 'priya@example.com'}</p>
            <button
              type="button"
              className="link-btn"
              onClick={() => toast('Profile details updated.')}
            >
              Edit profile →
            </button>
          </article>

          <article className="settings-group">
            <h3>Notifications</h3>
            <p>Messages, exchange requests and activity are enabled.</p>
            <button
              type="button"
              className="link-btn"
              onClick={() => toast('Notification preferences saved.')}
            >
              Manage notifications →
            </button>
          </article>

          <article className="settings-group">
            <h3>Privacy</h3>
            <p>Your public posts show city and locality, never your full address.</p>
            <button
              type="button"
              className="link-btn"
              onClick={() => toast('Privacy settings saved.')}
            >
              Manage privacy →
            </button>
          </article>

          <article className="settings-group">
            <h3>Session</h3>
            <p>Active user session (Local mode).</p>
            <button
              type="button"
              className="btn btn-danger btn-small"
              style={{ marginTop: 8 }}
              onClick={handleSignOut}
            >
              Log out
            </button>
          </article>
        </section>
      )}
    </main>
  );
}
