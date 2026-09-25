'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ItemCard } from '@/components/ItemCard';
import {
  LocationIcon,
  StarIcon,
  ShieldCheckIcon,
  LogOutIcon,
  EditIcon,
  CheckIcon,
} from '@/components/Icons';
import { media } from '@/utils/seedData';

const AVATAR_PRESETS = [
  media.priya,
  media.arun,
  media.kavya,
  media.rishi,
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80',
];

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
    updateProfileData,
    resetPassword,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'posts' | 'reviews' | 'saved' | 'settings'>('posts');

  // Edit Profile form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Notification toggles
  const [notifyProposals, setNotifyProposals] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyCommunity, setNotifyCommunity] = useState(false);

  // Sync form inputs when user loads/changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCity(user.city || 'Chennai');
      setLocality(user.locality || 'Central');
      setPhone(user.phone || '');
      setAvatar(user.avatar || media.priya);
    }
  }, [user]);

  const myPosts = posts.filter((p) => p.mine || p.owner === user?.first || p.user_id === user?.id);
  const savedPosts = posts.filter((p) => saved.includes(p.id));

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Please enter your name.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const selectedAvatar = customAvatarUrl.trim() || avatar || media.priya;
      await updateProfileData({
        name: name.trim(),
        first: name.trim().split(' ')[0],
        city: city.trim() || 'Chennai',
        locality: locality.trim() || 'Central',
        phone: phone.trim(),
        avatar: selectedAvatar,
      });
      setCustomAvatarUrl('');
    } catch (err: any) {
      toast(err?.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) {
      toast('No email found for this account.', 'error');
      return;
    }
    setIsSendingReset(true);
    try {
      await resetPassword(user.email);
    } catch (err: any) {
      toast(err?.message || 'Could not send reset email.', 'error');
    } finally {
      setIsSendingReset(false);
    }
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
          src={user.avatar || media.priya}
          alt={user.name}
        />
        <div className="profile-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>{user.name}</h1>
            <span className="verified-chip">
              <ShieldCheckIcon size={14} color="#059669" />
              Verified Trader
            </span>
          </div>
          <p style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
            <LocationIcon size={14} color="var(--ink-soft)" />
            <span>{user.locality}, {user.city} · Member since {user.joined || 'Recently'}</span>
          </p>
        </div>
        <div className="profile-stats">
          <div>
            <b style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <StarIcon size={18} color="#f59e0b" />
              <span>{user.rating || '5.0'}</span>
            </b>
            <span>community rating</span>
          </div>
          <div>
            <b>{user.exchanges || 0}</b>
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
          ['settings', 'Settings & Account'],
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
          {reviews.length > 0 ? (
            reviews.map((r, i) => (
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
            ))
          ) : (
            <div className="empty">
              <b>No reviews yet</b>
              <span>Complete your first barter exchange to receive community feedback!</span>
            </div>
          )}
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

      {/* Settings & Account Tab */}
      {activeTab === 'settings' && (
        <section className="settings">
          {/* 1. Edit Profile Form */}
          <article className="settings-group">
            <div className="settings-group-header">
              <h3>
                <EditIcon size={18} color="var(--pine)" />
                Edit Profile
              </h3>
              <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Public Information</span>
            </div>

            <form onSubmit={handleSaveProfile} className="form-grid">
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>
                  Choose Your Avatar
                </label>
                <div className="avatar-selection-wrap">
                  <img
                    src={customAvatarUrl.trim() || avatar || media.priya}
                    alt="Current Avatar"
                    className="current-avatar-preview"
                  />
                  <div>
                    <div className="avatar-presets">
                      {AVATAR_PRESETS.map((src, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`avatar-preset-btn ${avatar === src && !customAvatarUrl ? 'selected' : ''}`}
                          onClick={() => {
                            setAvatar(src);
                            setCustomAvatarUrl('');
                          }}
                          title={`Preset ${i + 1}`}
                        >
                          <img src={src} alt="preset avatar" />
                        </button>
                      ))}
                    </div>
                    <small style={{ display: 'block', color: 'var(--ink-soft)', marginTop: 6, fontSize: 11 }}>
                      Click a preset or enter photo link below
                    </small>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <label>Custom Photo Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                />
              </div>

              <div className="form-row">
                <label>Full Display Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-two">
                <div className="form-row">
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="e.g. Chennai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Locality / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Adyar, T. Nagar"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <label>Phone / Contact Preference (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 8 }}
                disabled={isSaving}
              >
                {isSaving ? 'Saving Changes…' : 'Save Profile Changes'}
              </button>
            </form>
          </article>

          {/* 2. Account & Security */}
          <article className="settings-group">
            <div className="settings-group-header">
              <h3>
                <ShieldCheckIcon size={18} color="var(--pine)" />
                Account & Security
              </h3>
              <span className="verified-chip">
                <CheckIcon size={12} color="#065f46" /> Active
              </span>
            </div>

            <p style={{ margin: '0 0 16px' }}>
              Your account is authenticated via Firebase Cloud Services.
            </p>

            <div style={{ background: 'var(--mist)', padding: 14, borderRadius: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Connected Email</span>
                <b style={{ fontSize: 13, color: 'var(--ink)' }}>{user.email || 'Email user'}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Account ID</span>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--pine-deep)' }}>
                  {user.id ? user.id.slice(0, 14) + '…' : 'usr-active'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Security Status</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>Protected</span>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <b style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Password Management</b>
              <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '0 0 10px' }}>
                Need to change or reset your password? We will send a secure link to your email.
              </p>
              <button
                type="button"
                className="btn btn-quiet btn-small"
                onClick={handleSendPasswordReset}
                disabled={isSendingReset}
              >
                {isSendingReset ? 'Sending reset link…' : 'Send Password Reset Email'}
              </button>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '16px 0' }} />

            {/* Notification Preferences */}
            <div style={{ marginBottom: 16 }}>
              <b style={{ fontSize: 14, display: 'block', marginBottom: 8, color: 'var(--pine-deep)' }}>
                Notification Preferences
              </b>

              <div className="settings-switch-row">
                <div className="settings-switch-info">
                  <b>Exchange Proposals</b>
                  <span>When someone wants to trade for your item</span>
                </div>
                <button
                  type="button"
                  className={`switch-toggle ${notifyProposals ? 'on' : ''}`}
                  onClick={() => {
                    setNotifyProposals(!notifyProposals);
                    toast(notifyProposals ? 'Proposal alerts muted.' : 'Proposal alerts active.');
                  }}
                  aria-label="Toggle Proposal Notifications"
                >
                  <span className="switch-circle"></span>
                </button>
              </div>

              <div className="settings-switch-row">
                <div className="settings-switch-info">
                  <b>Direct Messages</b>
                  <span>Instant notification on new chat replies</span>
                </div>
                <button
                  type="button"
                  className={`switch-toggle ${notifyMessages ? 'on' : ''}`}
                  onClick={() => {
                    setNotifyMessages(!notifyMessages);
                    toast(notifyMessages ? 'Message alerts muted.' : 'Message alerts active.');
                  }}
                  aria-label="Toggle Message Notifications"
                >
                  <span className="switch-circle"></span>
                </button>
              </div>

              <div className="settings-switch-row">
                <div className="settings-switch-info">
                  <b>Nearby Community Alerts</b>
                  <span>When hot items are posted in your city</span>
                </div>
                <button
                  type="button"
                  className={`switch-toggle ${notifyCommunity ? 'on' : ''}`}
                  onClick={() => {
                    setNotifyCommunity(!notifyCommunity);
                    toast(notifyCommunity ? 'Community alerts muted.' : 'Community alerts active.');
                  }}
                  aria-label="Toggle Community Alerts"
                >
                  <span className="switch-circle"></span>
                </button>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '18px 0' }} />

            {/* Danger Zone: Log Out */}
            <div>
              <b style={{ fontSize: 14, color: '#dc2626', display: 'block', marginBottom: 4 }}>
                Session & Security
              </b>
              <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '0 0 12px' }}>
                Safely disconnect this device from your EXCHANGE account.
              </p>
              <button
                type="button"
                className="btn btn-danger"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  fontWeight: 700,
                  fontSize: 13.5,
                }}
                onClick={handleSignOut}
              >
                <LogOutIcon size={16} />
                <span>Log out of EXCHANGE</span>
              </button>
            </div>
          </article>
        </section>
      )}
    </main>
  );
}
