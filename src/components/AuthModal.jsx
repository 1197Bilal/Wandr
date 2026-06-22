import { useState } from 'react';
import './AuthModal.css';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const TABS = ['Entrar', 'Crear cuenta'];

export default function AuthModal({ onClose }) {
  const [tab, setTab]         = useState(0);
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let userCredential;
      if (tab === 0) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name || email.split('@')[0]
        });
      }
      // Store email for premium check
      localStorage.setItem('wandr_user_email', userCredential.user.email || '');
      setDone(true);
      setTimeout(() => { onClose(); }, 1200);
    } catch (error) {
      console.error('Auth error:', error);
      alert(error.message);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.setItem('wandr_user_email', result.user.email || '');
      onClose();
    } catch (error) {
      console.error('Google Auth error:', error);
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal glass-strong" onClick={e => e.stopPropagation()}>

        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo__icon">✦</span>
          <span className="auth-logo__text">wandr</span>
        </div>

        <h2 className="auth-title">{tab === 0 ? 'Bienvenido de vuelta' : 'Únete a la comunidad'}</h2>
        <p className="auth-sub">{tab === 0 ? 'Continúa explorando y conectando con viajeros.' : 'Comparte tus experiencias y conecta con personas que viajan como tú.'}</p>

        {/* Google button */}
        <button className="auth-google btn" onClick={handleGoogle} id="auth-google" disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.4 33.5 30 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l6-6C34.4 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-7.7 19.7-20 0-1.3-.1-2.7-.2-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.2 19.1 13 24 13c3.1 0 5.8 1.1 7.9 2.9l6-6C34.4 6.5 29.5 4 24 4 16.1 4 9.3 8.4 6.3 14.7z"/><path fill="#FBBC05" d="M24 44c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.5 35.6 26.9 36.5 24 36.5c-5.9 0-10.4-3.5-12-8.5l-7 5.4C8.4 40.1 15.7 44 24 44z"/><path fill="#EA4335" d="M43.6 20H24v8.5h11.8c-.9 2.7-2.8 4.8-5.3 6.2l6.5 5.3C41.1 36.4 44 30.7 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
          Continuar con Google
        </button>

        <div className="auth-divider"><span>o con tu email</span></div>

        {/* Tabs */}
        <div className="auth-tabs">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`auth-tab ${tab === i ? 'auth-tab--active' : ''}`}
              onClick={() => setTab(i)}
              id={`auth-tab-${i}`}
            >{t}</button>
          ))}
        </div>

        {/* Form */}
        {done ? (
          <div className="auth-done anim-fade-in">
            <div className="auth-done__icon">✓</div>
            <p>¡Bienvenido a wandr!</p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {tab === 1 && (
              <div className="auth-field">
                <label className="label" htmlFor="auth-name">Nombre</label>
                <input
                  id="auth-name"
                  className="auth-input"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="auth-field">
              <label className="label" htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                className="auth-input"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label className="label" htmlFor="auth-pass">Contraseña</label>
              <input
                id="auth-pass"
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPass(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button className="btn btn-primary auth-submit" type="submit" disabled={loading} id="auth-submit">
              {loading ? <span className="hero__spinner" /> : (tab === 0 ? 'Entrar' : 'Crear cuenta')}
            </button>
          </form>
        )}

        <button className="auth-close" onClick={onClose} id="auth-close">✕</button>
      </div>
    </div>
  );
}
