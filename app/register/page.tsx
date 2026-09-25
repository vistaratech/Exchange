'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { EyeIcon, EyeOffIcon } from '@/components/Icons';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, toast, registerWithEmail, loginWithGoogle } = useApp();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToSafety, setAgreedToSafety] = useState(true);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (!agreedToSafety) {
      toast('Please agree to the barter community pledge.', 'error');
      return;
    }

    setLoading(true);

    try {
      await registerWithEmail(email, password, name, city);
      router.push('/profile');
    } catch (err: any) {
      console.error('Registration error:', err);
      let msg = err?.message || 'Failed to create account.';
      if (err?.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Try signing in.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      }
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page-shell">
      <div className="auth-card">
        <div className="auth-card-head">
          <Link href="/" className="wordmark" aria-label="EXCHANGE home">
            <i className="wordmark-mark"></i>
            EXCHANGE
          </Link>
          <h1>Join EXCHANGE</h1>
          <p>The neighborhood barter network. Exchange goods and skills directly with your neighbors.</p>
        </div>

        {/* Tab switch */}
        <div className="auth-tabs">
          <Link href="/login" className="auth-tab-btn" style={{ textAlign: 'center' }}>
            Sign In
          </Link>
          <button type="button" className="auth-tab-btn active">
            Create Account
          </button>
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
          {googleLoading ? 'Connecting to Google…' : 'Sign up with Google'}
        </button>

        <div className="auth-divider">
          <span>or sign up with email</span>
        </div>

        <form onSubmit={handleRegister} className="form-grid">
          <div className="form-two">
            <div className="form-row">
              <label>Full Name</label>
              <input
                name="name"
                placeholder="e.g. Ramesh V"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label>City / Town</label>
              <input
                name="city"
                placeholder="e.g. Chennai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ margin: 0 }}>Password</label>
              <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Min 6 characters</span>
            </div>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <label className="check" style={{ marginTop: 4, alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              checked={agreedToSafety}
              onChange={(e) => setAgreedToSafety(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
              I agree to the Community Safety Pledge to describe items truthfully and meet in public places.
            </span>
          </label>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8, padding: 12 }}
            disabled={loading}
          >
            {loading ? 'Creating Account…' : 'Create Free Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link href="/login">Sign in here</Link>
        </p>
      </div>
    </main>
  );
}
