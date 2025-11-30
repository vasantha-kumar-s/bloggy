'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginPopupProps {
  onClose: () => void;
}

export default function LoginPopup({ onClose }: LoginPopupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        const result = await register(email, password, name);
        if (result.success) {
          onClose();
        } else {
          setError(result.error || 'Registration failed');
        }
      } else {
        const success = await login(email, password);
        if (success) {
          onClose();
        } else {
          setError('Invalid credentials');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 8,
    border: '1px solid #ffd5cc', fontSize: 15, backgroundColor: '#fff9f7', color: '#000'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '40px 36px', borderRadius: 12,
        minWidth: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.15)', position: 'relative'
      }}>
        <h2 style={{ marginBottom: 8, textAlign: 'center', color: '#000', fontWeight: 600 }}>
          {isSignup ? 'Create account' : 'Welcome back'}
        </h2>
        <p style={{ textAlign: 'center', color: '#333', marginBottom: 28, fontSize: 14 }}>
          {isSignup ? 'Join our community of writers' : 'Sign in to continue'}
        </p>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div style={{ marginBottom: 16 }}>
              <input type="text" placeholder="Full name" value={name}
                onChange={e => setName(e.target.value)} required style={inputStyle} />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <input type="email" placeholder="Email address" value={email}
              onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <input type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          </div>

          {error && (
            <p style={{ color: '#d44', marginBottom: 16, fontSize: 14, textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', backgroundColor: '#f5a097',
            color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer',
            fontSize: 15, fontWeight: 500, transition: 'opacity 0.2s',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Please wait...' : (isSignup ? 'Create account' : 'Sign in')}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#000' }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => { setIsSignup(!isSignup); setError(''); }}
            style={{ color: '#f5a097', cursor: 'pointer', fontWeight: 500 }}>
            {isSignup ? 'Sign in' : 'Create one'}
          </span>
        </p>

        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, background: 'none',
          border: 'none', fontSize: 20, cursor: 'pointer', color: '#333',
          width: 32, height: 32, borderRadius: '50%', transition: 'background 0.2s'
        }}>×</button>
      </div>
    </div>
  );
}

