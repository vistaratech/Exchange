'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/utils/supabase/client';
import { initialUser } from '@/utils/seedData';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setUser, toast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('Priya Srinivasan');
  const [email, setEmail] = useState('priya@example.com');
  const [password, setPassword] = useState('password123');
  const [city, setCity] = useState('Chennai');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              city,
            },
          },
        });

        if (error) {
          toast(error.message, 'error');
          setLoading(false);
          return;
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            name,
            first: name.split(' ')[0],
            city,
            locality: 'Central',
            avatar: initialUser.avatar,
            joined: 'Just now',
            rating: '5.0',
            exchanges: 0,
            email,
          });
          toast('Account created! Welcome to EXCHANGE.');
          setIsAuthModalOpen(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If login fails (e.g. demo credentials not in Supabase yet), inform user and offer demo fallback
          toast(error.message, 'error');
          setLoading(false);
          return;
        }

        if (data.user) {
          const u = data.user;
          setUser({
            id: u.id,
            name: u.user_metadata?.full_name || email.split('@')[0],
            first: (u.user_metadata?.full_name || email).split(' ')[0],
            city: u.user_metadata?.city || city,
            locality: 'Adyar',
            avatar: initialUser.avatar,
            joined: 'Recently',
            rating: '4.9',
            exchanges: 6,
            email,
          });
          toast('Welcome back to EXCHANGE.');
          setIsAuthModalOpen(false);
        }
      }
    } catch (err: any) {
      toast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setUser(initialUser);
    toast('Logged in as Priya (Demo mode).');
    setIsAuthModalOpen(false);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal" onSubmit={handleSubmit}>
        <button
          className="modal-close"
          type="button"
          onClick={() => setIsAuthModalOpen(false)}
          aria-label="Close"
        >
          ×
        </button>

        <h2>{isSignUp ? 'Join EXCHANGE' : 'Sign in to EXCHANGE'}</h2>
        <p>
          {isSignUp
            ? 'Create a community profile to post, message, and exchange.'
            : 'Welcome back! Sign in to manage your exchanges and messages.'}
        </p>

        <div className="form-grid">
          {isSignUp && (
            <div className="form-row">
              <label>Full name</label>
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-two">
            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label>City</label>
              <input
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <button
              type="button"
              className="link-btn"
              onClick={() => setIsSignUp(!isSignUp)}
              style={{ fontSize: 13 }}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-quiet"
            onClick={handleDemo}
          >
            Continue as Priya (Demo)
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Connecting…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
};
