'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { createClient } from '@/utils/supabase/client';
import { initialUser } from '@/utils/seedData';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setUser, toast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });
      if (error) {
        toast(error.message, 'error');
        setGoogleLoading(false);
      }
    } catch (err: any) {
      toast(err.message || 'Google sign-in error', 'error');
      setGoogleLoading(false);
    }
  };

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
              full_name: name.trim(),
              city: city.trim() || 'Chennai',
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
            name: name.trim() || email.split('@')[0],
            first: (name.trim() || email).split(' ')[0],
            city: city.trim() || 'Chennai',
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
          toast(error.message, 'error');
          setLoading(false);
          return;
        }

        if (data.user) {
          const u = data.user;
          const fullName = u.user_metadata?.full_name || u.user_metadata?.name || email.split('@')[0];
          setUser({
            id: u.id,
            name: fullName,
            first: fullName.split(' ')[0],
            city: u.user_metadata?.city || 'Chennai',
            locality: u.user_metadata?.locality || 'Adyar',
            avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || initialUser.avatar,
            joined: 'Recently',
            rating: '5.0',
            exchanges: 0,
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
      <div className="modal">
        <button
          className="modal-close"
          type="button"
          onClick={() => setIsAuthModalOpen(false)}
          aria-label="Close"
        >
          ×
        </button>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(false)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(true)}
          >
            Create Account
          </button>
        </div>

        <h2>{isSignUp ? 'Join EXCHANGE' : 'Welcome back'}</h2>
        <p>
          {isSignUp
            ? 'Connect with your local community to barter goods and services.'
            : 'Sign in to manage your exchanges, proposals, and chats.'}
        </p>

        {/* Google Authentication Button */}
        <button
          type="button"
          className="btn-google"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          {googleLoading ? 'Redirecting to Google…' : isSignUp ? 'Sign up with Google' : 'Continue with Google'}
        </button>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          {isSignUp && (
            <div className="form-two">
              <div className="form-row">
                <label>Full Name</label>
                <input
                  name="name"
                  placeholder="e.g. Anand Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-row">
                <label>City / Area</label>
                <input
                  name="city"
                  placeholder="e.g. Chennai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="modal-actions" style={{ marginTop: 14 }}>
            <button
              type="button"
              className="btn btn-quiet"
              onClick={handleDemo}
            >
              Demo Preview
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
