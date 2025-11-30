'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { fetchBlogsByAuthor } from '../../services/blogService';
import type { Blog } from '../../types/blog';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export default function ProfilePage() {
  const { user, isLoggedIn, logout, updateProfile } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'APPROVED' | 'REVIEW' | 'REJECTED'>('APPROVED');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [following, setFollowing] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      loadBlogs();
      loadFollowing();
      setEditName(user.name);
      setEditBio(user.bio || '');
    }
  }, [isLoggedIn, user]);

  async function loadBlogs() {
    try {
      const data = await fetchBlogsByAuthor(user?.name || user?.email || '');
      setBlogs(data);
    } catch (err) {
      console.error('Failed to load blogs:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadFollowing() {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/follow/following/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setFollowing(data);
      }
    } catch (err) {
      console.error('Failed to load following:', err);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    const result = await updateProfile(editName, editBio, editPassword || undefined);
    if (result.success) {
      setEditing(false);
      setEditPassword('');
      alert('Profile updated');
    } else {
      alert(result.error || 'Failed to update profile');
    }
    setSaving(false);
  }

  async function handleUnfollow(authorName: string) {
    if (!user) return;
    try {
      await fetch(`${API_BASE}/api/follow`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, authorName })
      });
      setFollowing(following.filter(f => f !== authorName));
    } catch (err) {
      console.error('Failed to unfollow:', err);
    }
  }

  if (!isLoggedIn || !user) {
    return (
      <main style={{ maxWidth: 500, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{
          backgroundColor: '#fff', border: '1px solid #ffd5cc',
          borderRadius: 12, padding: 48
        }}>
          <h1 style={{ color: '#000', marginBottom: 12, fontWeight: 600 }}>Sign in required</h1>
          <p style={{ color: '#1a1a1a' }}>Please sign in to view your profile.</p>
        </div>
      </main>
    );
  }

  const approvedBlogs = blogs.filter(b => b.status === 'APPROVED');
  const reviewBlogs = blogs.filter(b => b.status === 'REVIEW' || b.status === 'PENDING' || b.status === 'PROCESSING');
  const rejectedBlogs = blogs.filter(b => b.status === 'REJECTED');

  const filteredBlogs = activeTab === 'APPROVED' ? approvedBlogs
    : activeTab === 'REVIEW' ? reviewBlogs
    : rejectedBlogs;

  const tabConfig = {
    APPROVED: { label: 'Published', color: '#7ac47f' },
    REVIEW: { label: 'Pending', color: '#f5a097' },
    REJECTED: { label: 'Rejected', color: '#e07060' }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 8,
    border: '1px solid #ffd5cc', fontSize: 15, backgroundColor: '#fff9f7', color: '#000'
  };

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
      <section style={{
        backgroundColor: '#fff', border: '1px solid #ffd5cc',
        padding: 32, borderRadius: 12, marginBottom: 32
      }}>
        {editing ? (
          <div>
            <h2 style={{ marginBottom: 24, color: '#000', fontWeight: 600 }}>Edit Profile</h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#000', fontSize: 14 }}>Name</label>
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#000', fontSize: 14 }}>Bio</label>
              <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#000', fontSize: 14 }}>
                New Password <span style={{ fontWeight: 400, color: '#333' }}>(leave blank to keep current)</span>
              </label>
              <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSaveProfile} disabled={saving}
                style={{
                  padding: '12px 24px', backgroundColor: '#f5a097', color: '#000',
                  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500,
                  opacity: saving ? 0.7 : 1
                }}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button onClick={() => setEditing(false)}
                style={{
                  padding: '12px 24px', backgroundColor: 'transparent', color: '#000',
                  border: '1px solid #ffd5cc', borderRadius: 6, cursor: 'pointer', fontSize: 14
                }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h1 style={{ marginBottom: 6, color: '#000', fontWeight: 600, fontSize: 24 }}>{user.name}</h1>
              <p style={{ color: '#333', marginBottom: 8 }}>{user.email}</p>
              {user.bio && <p style={{ marginTop: 12, color: '#1a1a1a', lineHeight: 1.6 }}>{user.bio}</p>}
              {user.isAdmin && (
                <span style={{
                  backgroundColor: '#f5a097', color: '#000', padding: '4px 12px',
                  borderRadius: 4, fontSize: 12, marginTop: 12, display: 'inline-block', fontWeight: 500
                }}>Admin</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditing(true)} style={{
                padding: '10px 20px', backgroundColor: '#f5a097', color: '#000',
                border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14
              }}>Edit profile</button>
              <button onClick={logout} style={{
                padding: '10px 20px', backgroundColor: 'transparent', color: '#000',
                border: '1px solid #ffd5cc', borderRadius: 6, cursor: 'pointer', fontSize: 14
              }}>Sign out</button>
            </div>
          </div>
        )}
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={{
          backgroundColor: '#f0f9f0', border: '1px solid #d4edda',
          padding: 20, borderRadius: 10, textAlign: 'center'
        }}>
          <h2 style={{ color: '#7ac47f', marginBottom: 4, fontSize: 28, fontWeight: 600 }}>{approvedBlogs.length}</h2>
          <p style={{ color: '#000', fontSize: 14 }}>Published</p>
        </div>
        <div style={{
          backgroundColor: '#fff0ed', border: '1px solid #ffd5cc',
          padding: 20, borderRadius: 10, textAlign: 'center'
        }}>
          <h2 style={{ color: '#f5a097', marginBottom: 4, fontSize: 28, fontWeight: 600 }}>{reviewBlogs.length}</h2>
          <p style={{ color: '#000', fontSize: 14 }}>Pending</p>
        </div>
        <div style={{
          backgroundColor: '#fef5f3', border: '1px solid #ffd5cc',
          padding: 20, borderRadius: 10, textAlign: 'center'
        }}>
          <h2 style={{ color: '#e07060', marginBottom: 4, fontSize: 28, fontWeight: 600 }}>{rejectedBlogs.length}</h2>
          <p style={{ color: '#000', fontSize: 14 }}>Rejected</p>
        </div>
      </section>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {(['APPROVED', 'REVIEW', 'REJECTED'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px', border: 'none', borderRadius: 6, cursor: 'pointer',
            backgroundColor: activeTab === tab ? '#f5a097' : '#fff0ed',
            color: '#000', fontSize: 14
          }}>
            {tabConfig[tab].label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#333', padding: 40, textAlign: 'center' }}>Loading...</p>
      ) : filteredBlogs.length === 0 ? (
        <div style={{
          padding: 48, textAlign: 'center', backgroundColor: '#fff0ed',
          borderRadius: 10, border: '1px solid #ffd5cc'
        }}>
          <p style={{ color: '#1a1a1a' }}>No {tabConfig[activeTab].label.toLowerCase()} posts yet.</p>
        </div>
      ) : (
        filteredBlogs.map(blog => (
          <Link href={`/blog/${blog.id}`} key={blog.id} style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#fff', border: '1px solid #ffd5cc', borderRadius: 10,
              padding: 20, marginBottom: 12, cursor: 'pointer', transition: 'border-color 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ color: '#000', marginBottom: 6, fontWeight: 500 }}>{blog.title}</h3>
                  <p style={{ color: '#333', fontSize: 13 }}>
                    {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: 500,
                  backgroundColor: blog.status === 'APPROVED' ? '#f0f9f0' :
                                   blog.status === 'REJECTED' ? '#fef5f3' : '#fff0ed',
                  color: blog.status === 'APPROVED' ? '#7ac47f' :
                         blog.status === 'REJECTED' ? '#e07060' : '#f5a097'
                }}>{tabConfig[blog.status as keyof typeof tabConfig]?.label || blog.status}</span>
              </div>
              <p style={{ color: '#1a1a1a', marginTop: 12, lineHeight: 1.5, fontSize: 14 }}>
                {blog.content.slice(0, 150)}...
              </p>
              {blog.tags && (
                <div style={{ marginTop: 12 }}>
                  {blog.tags.split(',').map((tag, i) => (
                    <span key={i} style={{
                      backgroundColor: '#fff0ed', padding: '4px 10px', borderRadius: 4,
                      fontSize: 12, marginRight: 6, color: '#000'
                    }}>{tag.trim()}</span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))
      )}

      <section style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid #ffd5cc' }}>
        <h2 style={{ marginBottom: 20, color: '#000', fontWeight: 600, fontSize: 18 }}>
          Following ({following.length})
        </h2>
        {following.length === 0 ? (
          <p style={{ color: '#333' }}>You are not following any authors yet.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {following.map(author => (
              <div key={author} style={{
                backgroundColor: '#fff0ed', padding: '10px 14px', borderRadius: 6,
                display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #ffd5cc'
              }}>
                <span style={{ color: '#000' }}>{author}</span>
                <button onClick={() => handleUnfollow(author)} style={{
                  backgroundColor: 'transparent', color: '#f5a097', border: 'none',
                  padding: 0, fontSize: 13, cursor: 'pointer'
                }}>Unfollow</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

