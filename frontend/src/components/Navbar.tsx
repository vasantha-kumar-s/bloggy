'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import LoginPopup from './LoginPopup';

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const { user, logout, isLoggedIn } = useAuth();

  return (
    <>
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 40px', backgroundColor: '#fff',
        borderBottom: '1px solid #ffd5cc', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#000">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            <span style={{
              fontSize: 22, fontWeight: 800, color: '#000', letterSpacing: '0.5px',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            }}>BLOGGY</span>
          </Link>
          <Link href="/" style={{
            textDecoration: 'none', color: '#000', fontSize: 15,
            transition: 'color 0.2s'
          }}>Home</Link>
          {isLoggedIn && user?.isAdmin && (
            <Link href="/moderation" style={{
              textDecoration: 'none', color: '#000', fontSize: 15
            }}>Moderation</Link>
          )}
        </div>

        <div>
          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link href="/profile" style={{
                textDecoration: 'none', color: '#000', fontSize: 15, fontWeight: 500
              }}>
                {user?.name}
              </Link>
              {user?.isAdmin && (
                <span style={{
                  color: '#fff', fontSize: 11, backgroundColor: '#f5a097',
                  padding: '2px 8px', borderRadius: 4
                }}>Admin</span>
              )}
              <button onClick={logout} style={{
                padding: '8px 16px', backgroundColor: 'transparent',
                border: '1px solid #ffd5cc', borderRadius: 6, cursor: 'pointer',
                color: '#000', fontSize: 14, transition: 'all 0.2s'
              }}>Sign out</button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{
              padding: '10px 24px', backgroundColor: '#f5a097', color: '#000',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14,
              fontWeight: 500, transition: 'background 0.2s'
            }}>Sign in</button>
          )}
        </div>
      </nav>

      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </>
  );
}

