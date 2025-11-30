'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Blog } from '../../types/blog';
import { fetchBlogsByStatus, approveBlog, rejectBlog, putUnderReview } from '../../services/blogService';

export default function ModerationPage() {
  const { user, isLoggedIn } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'REVIEW' | 'APPROVED' | 'REJECTED'>('REVIEW');
  const [counts, setCounts] = useState({ REVIEW: 0, APPROVED: 0, REJECTED: 0 });

  useEffect(() => {
    if (isLoggedIn && user?.isAdmin) {
      load(activeTab);
      loadAllCounts();
    }
  }, [isLoggedIn, user, activeTab]);

  async function loadAllCounts() {
    try {
      const [review, approved, rejected] = await Promise.all([
        fetchBlogsByStatus('REVIEW'),
        fetchBlogsByStatus('APPROVED'),
        fetchBlogsByStatus('REJECTED')
      ]);
      setCounts({ REVIEW: review.length, APPROVED: approved.length, REJECTED: rejected.length });
    } catch (err) {
      console.error(err);
    }
  }

  async function load(status: string) {
    setLoading(true);
    try {
      const data = await fetchBlogsByStatus(status);
      setBlogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function onApprove(id?: number) {
    if (!id) return;
    await approveBlog(id);
    setBlogs(prev => prev.filter(b => b.id !== id));
    setCounts(prev => ({ ...prev, REVIEW: prev.REVIEW - 1, APPROVED: prev.APPROVED + 1 }));
  }

  async function onReject(id?: number) {
    if (!id) return;
    await rejectBlog(id);
    setBlogs(prev => prev.filter(b => b.id !== id));
    setCounts(prev => ({ ...prev, [activeTab]: prev[activeTab] - 1, REJECTED: prev.REJECTED + 1 }));
  }

  async function onPutUnderReview(id?: number) {
    if (!id) return;
    await putUnderReview(id);
    setBlogs(prev => prev.filter(b => b.id !== id));
    setCounts(prev => ({ ...prev, [activeTab]: prev[activeTab] - 1, REVIEW: prev.REVIEW + 1 }));
  }

  if (!isLoggedIn || !user?.isAdmin) {
    return (
      <main style={{ maxWidth: 500, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{
          backgroundColor: '#fff', border: '1px solid #ffd5cc',
          borderRadius: 12, padding: 48
        }}>
          <h1 style={{ color: '#000', marginBottom: 12, fontWeight: 600 }}>Admin access required</h1>
          <p style={{ color: '#1a1a1a', marginBottom: 8 }}>Sign in as admin to access moderation.</p>
          <p style={{ color: '#333', fontSize: 13 }}>admin@bloggy.com / password</p>
        </div>
      </main>
    );
  }

  const tabConfig = {
    REVIEW: { label: 'Pending Review', color: '#f5a097', bg: '#fff0ed' },
    APPROVED: { label: 'Approved', color: '#7ac47f', bg: '#f0f9f0' },
    REJECTED: { label: 'Rejected', color: '#e07060', bg: '#fef5f3' }
  };

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 26, color: '#000', fontWeight: 600, marginBottom: 8
        }}>Moderation Dashboard</h1>
        <p style={{ color: '#1a1a1a' }}>Review and manage submitted content</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        {(['REVIEW', 'APPROVED', 'REJECTED'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '12px 24px', border: 'none', borderRadius: 8, cursor: 'pointer',
            backgroundColor: activeTab === tab ? tabConfig[tab].bg : '#fff0ed',
            color: activeTab === tab ? tabConfig[tab].color : '#333',
            fontWeight: activeTab === tab ? 600 : 400, fontSize: 14,
            borderBottom: activeTab === tab ? `2px solid ${tabConfig[tab].color}` : '2px solid transparent'
          }}>
            {tabConfig[tab].label} ({counts[tab]})
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#333', padding: 40, textAlign: 'center' }}>Loading...</p>
      ) : blogs.length === 0 ? (
        <div style={{
          padding: 48, textAlign: 'center', backgroundColor: '#fff0ed',
          borderRadius: 10, border: '1px solid #ffd5cc'
        }}>
          <p style={{ color: '#1a1a1a' }}>No {tabConfig[activeTab].label.toLowerCase()} posts.</p>
        </div>
      ) : (
        blogs.map(b => (
          <div key={b.id} style={{
            backgroundColor: '#fff', border: '1px solid #ffd5cc',
            borderRadius: 10, padding: 24, marginBottom: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, marginBottom: 6, color: '#000', fontWeight: 600 }}>{b.title}</h2>
                <p style={{ color: '#333', fontSize: 13 }}>
                  {b.author} · {new Date(b.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {activeTab !== 'APPROVED' && (
                  <button onClick={() => onApprove(b.id)} style={{
                    padding: '8px 16px', backgroundColor: '#7ac47f', color: '#000',
                    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500
                  }}>Approve</button>
                )}
                {activeTab !== 'REVIEW' && (
                  <button onClick={() => onPutUnderReview(b.id)} style={{
                    padding: '8px 16px', backgroundColor: '#ffb4a2', color: '#000',
                    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500
                  }}>Move to Review</button>
                )}
                {activeTab !== 'REJECTED' && (
                  <button onClick={() => onReject(b.id)} style={{
                    padding: '8px 16px', backgroundColor: '#e07060', color: '#000',
                    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500
                  }}>Reject</button>
                )}
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff9f7', padding: 16, borderRadius: 8,
              marginBottom: 16, border: '1px solid #ffd5cc'
            }}>
              <p style={{ color: '#1a1a1a', lineHeight: 1.6, fontSize: 14 }}>
                {b.content.slice(0, 400)}{b.content.length > 400 ? '...' : ''}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{
                padding: 14, borderRadius: 8, border: '1px solid #ffd5cc',
                backgroundColor: b.profanityFound ? '#fef5f3' : '#f0f9f0'
              }}>
                <p style={{ fontSize: 12, color: '#333', marginBottom: 4 }}>Profanity Check</p>
                <p style={{
                  color: b.profanityFound ? '#e07060' : '#7ac47f',
                  fontSize: 15, fontWeight: 600
                }}>
                  {b.profanityFound ? 'Detected' : 'Clean'}
                </p>
              </div>
              <div style={{
                padding: 14, borderRadius: 8, border: '1px solid #ffd5cc', backgroundColor: '#fff9f7'
              }}>
                <p style={{ fontSize: 12, color: '#333', marginBottom: 4 }}>SEO Score</p>
                <p style={{
                  fontSize: 15, fontWeight: 600,
                  color: b.seoScore >= 70 ? '#7ac47f' : b.seoScore >= 40 ? '#f5a097' : '#e07060'
                }}>
                  {b.seoScore?.toFixed(0)}/100
                </p>
              </div>
              <div style={{
                padding: 14, borderRadius: 8, border: '1px solid #ffd5cc', backgroundColor: '#fff9f7'
              }}>
                <p style={{ fontSize: 12, color: '#333', marginBottom: 4 }}>AI Similarity</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>
                  {(b.aiSimilarityScore * 100)?.toFixed(1)}%
                </p>
              </div>
              <div style={{
                padding: 14, borderRadius: 8, border: '1px solid #ffd5cc', backgroundColor: '#fff9f7'
              }}>
                <p style={{ fontSize: 12, color: '#333', marginBottom: 4 }}>Tags</p>
                <p style={{ fontSize: 13, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {b.tags || 'None'}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </main>
  );
}
