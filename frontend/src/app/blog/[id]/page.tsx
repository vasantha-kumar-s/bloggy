'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import type { Blog } from '../../../types/blog';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

export default function BlogPage() {
  const params = useParams();
  const { user, isLoggedIn } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchBlog();
      fetchComments();
    }
  }, [params.id]);

  useEffect(() => {
    if (blog && user) {
      checkFollowing();
      fetchFollowerCount();
    }
  }, [blog, user]);

  async function fetchBlog() {
    try {
      const res = await fetch(`${API_BASE}/api/blogs/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setBlog(data);
      }
    } catch (err) {
      console.error('Failed to fetch blog:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments() {
    try {
      const res = await fetch(`${API_BASE}/api/blogs/${params.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  }

  async function checkFollowing() {
    if (!user || !blog) return;
    try {
      const res = await fetch(`${API_BASE}/api/follow/check?userId=${user.id}&authorName=${encodeURIComponent(blog.author)}`);
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (err) {
      console.error('Failed to check following:', err);
    }
  }

  async function fetchFollowerCount() {
    if (!blog) return;
    try {
      const res = await fetch(`${API_BASE}/api/follow/count/${encodeURIComponent(blog.author)}`);
      if (res.ok) {
        const data = await res.json();
        setFollowerCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch follower count:', err);
    }
  }

  async function handleFollow() {
    if (!user || !blog) return;
    try {
      if (isFollowing) {
        await fetch(`${API_BASE}/api/follow`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, authorName: blog.author })
        });
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
      } else {
        await fetch(`${API_BASE}/api/follow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, authorName: blog.author })
        });
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to follow/unfollow:', err);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn || !user || !newComment.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/blogs/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, userId: user.id })
      });

      if (res.ok) {
        const comment = await res.json();
        setComments([comment, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  }

  if (loading) return (
    <main style={{ padding: 60, textAlign: 'center', color: '#333' }}>Loading...</main>
  );
  if (!blog) return (
    <main style={{ padding: 60, textAlign: 'center', color: '#333' }}>Post not found</main>
  );

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px' }}>
      <article style={{ marginBottom: 48 }}>
        <h1 style={{
          fontSize: 34, marginBottom: 16, color: '#000',
          fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.5px'
        }}>{blog.title}</h1>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #ffd5cc'
        }}>
          <div>
            <p style={{ color: '#000', fontWeight: 500, marginBottom: 4 }}>
              {blog.author}
            </p>
            <p style={{ color: '#333', fontSize: 14 }}>
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })} · {followerCount} followers
            </p>
          </div>
          {isLoggedIn && user?.name !== blog.author && (
            <button onClick={handleFollow} style={{
              padding: '8px 20px',
              backgroundColor: isFollowing ? '#fff0ed' : '#f5a097',
              color: '#000',
              border: isFollowing ? '1px solid #ffd5cc' : 'none',
              borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500
            }}>
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        <div style={{
          lineHeight: 1.8, fontSize: 17, whiteSpace: 'pre-wrap', color: '#000'
        }}>
          {blog.content}
        </div>

        {blog.tags && (
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #ffd5cc' }}>
            {blog.tags.split(',').map((tag, i) => (
              <span key={i} style={{
                display: 'inline-block', backgroundColor: '#fff0ed', padding: '6px 14px',
                borderRadius: 6, marginRight: 8, marginBottom: 8, fontSize: 13, color: '#000'
              }}>{tag.trim()}</span>
            ))}
          </div>
        )}
      </article>

      <section style={{
        backgroundColor: '#fff', border: '1px solid #ffd5cc',
        borderRadius: 12, padding: 28
      }}>
        <h2 style={{
          marginBottom: 24, fontSize: 18, color: '#000', fontWeight: 600
        }}>
          Discussion ({comments.length})
        </h2>

        {isLoggedIn ? (
          <form onSubmit={handleAddComment} style={{ marginBottom: 28 }}>
            <textarea
              placeholder="Share your thoughts..." value={newComment}
              onChange={e => setNewComment(e.target.value)} rows={3}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 8,
                border: '1px solid #ffd5cc', marginBottom: 12, fontSize: 15,
                backgroundColor: '#fff9f7', resize: 'vertical', color: '#000'
              }}
            />
            <button type="submit" style={{
              padding: '10px 20px', backgroundColor: '#f5a097',
              color: '#000', border: 'none', borderRadius: 6,
              cursor: 'pointer', fontSize: 14, fontWeight: 500
            }}>Post comment</button>
          </form>
        ) : (
          <div style={{
            color: '#1a1a1a', marginBottom: 24, padding: 20,
            backgroundColor: '#fff0ed', borderRadius: 8, textAlign: 'center'
          }}>
            Sign in to join the discussion
          </div>
        )}

        {comments.length === 0 ? (
          <p style={{ color: '#333', textAlign: 'center', padding: 20 }}>
            No comments yet. Start the conversation!
          </p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} style={{
              borderBottom: '1px solid #ffd5cc', padding: '16px 0'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 8
              }}>
                <span style={{ fontWeight: 500, color: '#000' }}>{comment.author}</span>
                <span style={{ color: '#333', fontSize: 13 }}>
                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric'
                  })}
                </span>
              </div>
              <p style={{ color: '#1a1a1a', lineHeight: 1.6 }}>{comment.content}</p>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

