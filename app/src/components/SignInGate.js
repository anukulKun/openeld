import React, { useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../firebase';

export default function SignInGate({ children }) {
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleGoogleSignIn() {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('[OpenELD] Google sign-in error:', err.code, err.message, err);
      const messages = {
        'auth/unauthorized-domain': 'This domain isn\u2019t authorized for sign-in yet. Contact the site owner.',
        'auth/network-request-failed': 'Network error. Check your connection and try again.',
        'auth/operation-not-allowed': 'Google sign-in is not enabled yet. Contact the site owner.',
      };
      const displayCode = (err.code || '').replace(/[A-Za-z0-9_-]{25,}/g, '[key redacted]');
      setError(messages[err.code] || `Sign-in failed (${displayCode || 'unknown error'}). Please try again.`);
    } finally {
      setSigningIn(false);
    }
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSigningIn(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      console.error('[OpenELD] Email sign-in error:', err.code, err.message, err);
      const messages = {
        'auth/email-already-in-use': 'An account already exists with this email. Try signing in instead.',
        'auth/invalid-email': 'That email address looks invalid.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-not-found': 'No account found with that email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/operation-not-allowed': 'Email sign-in is not enabled yet. Contact the site owner.',
      };
      const displayCode = (err.code || '').replace(/[A-Za-z0-9_-]{25,}/g, '[key redacted]');
      setError(messages[err.code] || `Auth error (${displayCode || 'unknown error'}). Please try again.`);
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <div className="signin-gate">
      <div className="signin-gate-card">
        <div className="signin-gate-logo">
          <img src="/logo.png" alt="OpenELD" />
          <span>OpenELD</span>
        </div>

        <h1>Sign in to plan your route.</h1>
        <p>
          OpenELD keeps your trips, cycle hours, and log history tied to
          your account, so they're there whenever you come back.
        </p>

        {error && <div className="signin-gate-error">{error}</div>}

        <button
          type="button"
          className="signin-gate-google-btn"
          onClick={handleGoogleSignIn}
          disabled={signingIn}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33C2.44 15.98 5.48 18 9 18z"/>
            <path fill="#FBBC05" d="M3.97 10.72c-.18-.54-.28-1.12-.28-1.72s.1-1.18.28-1.72V4.95H.96A8.996 8.996 0 000 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
          </svg>
          {signingIn ? 'Signing in\u2026' : 'Sign in with Google'}
        </button>

        <div className="signin-gate-divider">
          <span>or</span>
        </div>

        <form onSubmit={handleEmailSubmit} className="signin-gate-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
          <button type="submit" className="signin-gate-email-btn" disabled={signingIn}>
            {signingIn ? 'Please wait\u2026' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="signin-gate-switch">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            className="signin-gate-switch-link"
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setError(null);
            }}
          >
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </button>
        </p>

        <p className="signin-gate-footnote">
          By continuing, you agree this is a planning tool, not a certified
          ELD device.
        </p>
      </div>
    </div>
  );
}
