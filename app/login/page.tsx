'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { initialUser } from '@/utils/seedData';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, toast, loginWithEmail, loginWithGoogle } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push('/profile');
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        toast('Google sign in popup was closed.', 'error');
      } else {
        toast(err?.message || 'Google sign in failed.', 'error');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      router.push('/profile');
    } catch (err: any) {
      console.error('Email sign in error:', err);
      let msg = err?.message || 'Invalid email or password.';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found') {
        msg = 'Invalid email or password.';
      }
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setUser(initialUser);
    toast('Logged in as Priya (Demo mode).');
    router.push('/profile');
  };

  return (
    <main className="auth-page-shell">
      <div className="auth-card">
        <div className="auth-card-head">
          <Link href="/" className="wordmark" aria-label="EXCHANGE home">
            <i className="wordmark-mark"></i>
            EXCHANGE
          </Link>
          <h1>Welcome back</h1>
          <p>Sign in to manage your barters, messages, and listings.</p>
        </div>

        {/* Tab switch */}
        <div className="auth-tabs">
          <button type="button" className="auth-tab-btn active">
            Sign In
          </button>
          <Link href="/register" className="auth-tab-btn" style={{ textAlign: 'center' }}>
            Create Account
          </Link>
        </div>

        {/* Google Authentication */}
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
          {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
        </button>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        <form onSubmit={handleEmailSignIn} className="form-grid">
          <div className="form-row">
            <label>Email Address</label>
            <input
              type="email"
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
              placeholder="Your account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8, padding: 12 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <button
            type="button"
            className="btn btn-quiet"
            style={{ width: '100%' }}
            onClick={handleDemo}
          >
            Quick Demo Preview
          </button>
        </form>

        <p className="auth-footer-text">
          Don&apos;t have an account yet?{' '}
          <Link href="/register">Create one here</Link>
        </p>
      </div>
    </main>
  );
}
