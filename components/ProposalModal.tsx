'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export const ProposalModal: React.FC = () => {
  const {
    proposalModalTargetId,
    setProposalModalTargetId,
    posts,
    createProposal,
  } = useApp();

  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [message, setMessage] = useState('Would you like to exchange these?');

  if (!proposalModalTargetId) return null;

  const targetPost = posts.find((p) => p.id === proposalModalTargetId);
  if (!targetPost) return null;

  const myPosts = posts.filter((p) => p.mine);
  const activeOfferId = selectedOfferId || (myPosts.length > 0 ? myPosts[0].id : '');
  const offerPost = posts.find((p) => p.id === activeOfferId) || myPosts[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerPost) return;
    createProposal(targetPost.id, offerPost.id, message);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="proposal-title">
      <form className="modal" onSubmit={handleSubmit}>
        <button
          className="modal-close"
          type="button"
          onClick={() => setProposalModalTargetId(null)}
          aria-label="Close"
        >
          ×
        </button>

        <h2 id="proposal-title">Exchange proposal</h2>
        <p>Choose one of your active posts to offer to {targetPost.owner}.</p>

        <div className="form-grid">
          {myPosts.length > 0 ? (
            myPosts.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`offer-choice ${p.id === activeOfferId ? 'selected' : ''}`}
                onClick={() => setSelectedOfferId(p.id)}
              >
                <img src={p.image} alt={p.title} />
                <span>
                  <b>{p.title}</b>
                  <br />
                  <small>{p.condition} condition</small>
                </span>
              </button>
            ))
          ) : (
            <p style={{ color: 'var(--coral)', fontSize: 13 }}>
              You don't have any active posts yet. Please post an item first to offer it for exchange!
            </p>
          )}
        </div>

        {offerPost && (
          <div className="proposal-visual">
            <div>
              <small>You offer</small>
              <img src={offerPost.image} alt={offerPost.title} />
              <b>{offerPost.title}</b>
            </div>
            <strong>↔</strong>
            <div>
              <small>You want</small>
              <img src={targetPost.image} alt={targetPost.title} />
              <b>{targetPost.title}</b>
            </div>
          </div>
        )}

        <div className="form-row">
          <label>Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => setProposalModalTargetId(null)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!offerPost}
          >
            Send proposal
          </button>
        </div>
      </form>
    </div>
  );
};
