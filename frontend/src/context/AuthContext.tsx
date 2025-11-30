'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

interface User {
  id: number;
  email: string;
  name: string;
  bio?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (name: string, bio: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bloggy_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        const userData: User = {
          id: data.id,
          email: data.email,
          name: data.name,
          bio: data.bio,
          isAdmin: data.role === 'ADMIN'
        };
        setUser(userData);
        localStorage.setItem('bloggy_user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await res.json();

      if (res.ok) {
        const userData: User = {
          id: data.id,
          email: data.email,
          name: data.name,
          isAdmin: data.role === 'ADMIN'
        };
        setUser(userData);
        localStorage.setItem('bloggy_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, error: 'Network error' };
    }
  };

  const updateProfile = async (name: string, bio: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not logged in' };

    try {
      const body: { name: string; bio: string; password?: string } = { name, bio };
      if (password) body.password = password;

      const res = await fetch(`${API_BASE}/api/auth/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        const userData: User = {
          id: data.id,
          email: data.email,
          name: data.name,
          bio: data.bio,
          isAdmin: data.role === 'ADMIN'
        };
        setUser(userData);
        localStorage.setItem('bloggy_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: data.error || 'Update failed' };
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bloggy_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

