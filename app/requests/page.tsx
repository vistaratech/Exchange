'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function RequestsPage() {
  const { proposals, posts, updateProposalStatus, addReview, user } = useApp();
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'accepted' | 'completed'>('received');
  const [reviewProposalId, setReviewProposalId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('Great person. Smooth exchange.');

  const currentUserFirst = user?.first || 'Priya';

  const filteredProposals = proposals.filter((p) => {
    if (activeTab === 'received') {
      return p.receiver === currentUserFirst && p.status === 'pending';
    }
    if (activeTab === 'sent') {
      return p.sender === currentUserFirst && p.status === 'pending';
    }
    if (activeTab === 'accepted') {
      return p.status === 'accepted';
    }
    if (activeTab === 'completed') {
      return p.status === 'completed';
    }
    return true;
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProposalId) return;
    addReview(reviewProposalId, rating, reviewText);
    setReviewProposalId(null);
  };

  return (
    <main className="shell">
      <div className="page-head">
        <div>
          <h1>Exchange requests</h1>
          <p>Every proposal stays simple: one thing for another thing.</p>
        </div>
      </div>

      <div className="request-tabs">
        {(['received', 'sent', 'accepted', 'completed'] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={activeTab === t ? 'active' : ''}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="request-list">
        {filteredProposals.length > 0 ? (
          filteredProposals.map((p) => {
            const offerPost = posts.find((item) => item.id === p.senderPost) || posts[0];
            const wantPost = posts.find((item) => item.id === p.receiverPost) || posts[1];
            const isReceived = p.receiver === currentUserFirst;

            return (
              <article key={p.id} className="request">
                <div>
                  <span className={`status ${p.status}`}>{p.status}</span>
                  <h3>
                    {isReceived
                      ? `${p.sender} wants your ${wantPost?.title || 'item'}`
                      : `Your proposal to ${p.receiver}`}
                  </h3>
                  <p>“{p.message}”</p>

                  <div className="proposal-items">
                    <div className="proposal-item">
                      <img src={offerPost?.image} alt="" />
                      <span>{offerPost?.title}</span>
                    </div>
                    <span className="arrow">↔</span>
                    <div className="proposal-item">
                      <img src={wantPost?.image} alt="" />
                      <span>{wantPost?.title}</span>
                    </div>
                  </div>
                </div>

                <div className="inline-actions">
                  {p.status === 'pending' && isReceived && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-small"
                        onClick={() => updateProposalStatus(p.id, 'accepted')}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="btn btn-quiet btn-small"
                        onClick={() => updateProposalStatus(p.id, 'declined')}
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {p.status === 'accepted' && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-small"
                      onClick={() => updateProposalStatus(p.id, 'completed')}
                    >
                      Mark complete
                    </button>
                  )}

                  {p.status === 'completed' && (
                    <button
                      type="button"
                      className="btn btn-quiet btn-small"
                      onClick={() => setReviewProposalId(p.id)}
                    >
                      Rate exchange
                    </button>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <div className="empty">
            <b>Your exchange journey starts here.</b>
            <span>
              {activeTab === 'received'
                ? 'When someone proposes an exchange for one of your items, it will appear here.'
                : 'You have nothing in this section yet.'}
            </span>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewProposalId && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal" onSubmit={handleReviewSubmit}>
            <button
              className="modal-close"
              type="button"
              onClick={() => setReviewProposalId(null)}
              aria-label="Close"
            >
              ×
            </button>
            <h2>How was your exchange experience?</h2>
            <p>Your review helps the community exchange with confidence.</p>

            <div className="form-row">
              <label>Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map((x) => (
                  <option key={x} value={x}>
                    {'★'.repeat(x)} {x} of 5
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Optional review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Great person. Smooth exchange."
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button type="submit" className="btn btn-primary">
                Submit review
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
