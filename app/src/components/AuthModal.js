import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

function AuthModal({ open, onClose, onAuth }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!supabase) {
      setError('Supabase is not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
      return;
    }
    setLoading(true);
    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    onAuth?.(result.data.user);
    onClose();
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <section className="auth-modal" role="dialog" aria-modal="true" aria-label="Driver account" onMouseDown={(event) => event.stopPropagation()}>
        <div className="auth-header">
          <strong>Driver Account</strong>
          <button type="button" onClick={onClose} aria-label="Close sign in">Close</button>
        </div>
        <div className="auth-tabs">
          <button className={mode === 'signin' ? 'active' : ''} type="button" onClick={() => setMode('signin')}>Sign In</button>
          <button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => setMode('signup')}>Create Account</button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <label className="field-group" htmlFor="auth-email">
            <span className="field-label">Email</span>
            <input className="field-input" id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="field-group" htmlFor="auth-password">
            <span className="field-label">Password</span>
            <input className="field-input" id="auth-password" type="password" minLength="6" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <div className="field-error auth-error">{error}</div>}
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Please wait' : mode === 'signin' ? 'Sign In' : 'Create Account'}</button>
        </form>
      </section>
    </div>
  );
}

export default AuthModal;

