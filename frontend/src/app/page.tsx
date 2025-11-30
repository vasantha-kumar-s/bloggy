'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import type { Blog } from '../types/blog';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  useEffect(() => {
    fetchRecentBlogs();
  }, []);

  async function fetchRecentBlogs() {
    try {
      const res = await fetch(`${API_BASE}/api/blogs?status=APPROVED`);
      if (res.ok) {
        const blogs = await res.json();
        setAllBlogs(blogs);
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    }
  }

  const filteredBlogs = useMemo(() => {
    let result = [...allBlogs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(blog =>
        blog.title.toLowerCase().includes(query) ||
        blog.author.toLowerCase().includes(query) ||
        blog.content.toLowerCase().includes(query) ||
        (blog.tags && blog.tags.toLowerCase().includes(query))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

    return result.slice(0, 20);
  }, [allBlogs, searchQuery, sortBy]);

  function createBlog() {
    if (!isLoggedIn) {
      alert('Please sign in to create a blog');
      return;
    }
    router.push('/blog/create');
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center', padding: '60px 20px', marginBottom: 48,
        background: 'linear-gradient(135deg, #fff9f7 0%, #fff0ed 100%)',
        borderRadius: 16, border: '1px solid #ffd5cc'
      }}>
        <h1 style={{
          fontSize: 42, marginBottom: 12, color: '#000',
          fontWeight: 600, letterSpacing: '-1px'
        }}>
          Share your perspective
        </h1>
        <p style={{ color: '#1a1a1a', fontSize: 18, maxWidth: 500, margin: '0 auto 28px' }}>
          A space for writers to share ideas, stories, and insights with readers who care.
        </p>
        <button onClick={createBlog} style={{
          padding: '14px 32px', backgroundColor: '#f5a097', color: '#000',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15,
          fontWeight: 500, transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 2px 8px rgba(245,160,151,0.4)'
        }}>
          Start writing
        </button>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 48 }}>
        {/* Recent Blogs */}
        <section>
          {/* Search and Sort Controls */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, minWidth: 200, padding: '10px 14px', fontSize: 14,
                border: '1px solid #ffd5cc', borderRadius: 6, outline: 'none',
                backgroundColor: '#fff', color: '#000'
              }}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
              style={{
                padding: '10px 14px', fontSize: 14, border: '1px solid #ffd5cc',
                borderRadius: 6, outline: 'none', backgroundColor: '#fff', color: '#000',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>

          <h2 style={{
            marginBottom: 24, fontSize: 20, color: '#000', fontWeight: 600,
            paddingBottom: 12, borderBottom: '2px solid #ffd5cc'
          }}>
            {searchQuery ? `Results for "${searchQuery}"` : 'Recent posts'}
            {searchQuery && <span style={{ fontWeight: 400, fontSize: 14, marginLeft: 8 }}>({filteredBlogs.length} found)</span>}
          </h2>
          {filteredBlogs.length === 0 ? (
            <div style={{
              padding: 48, textAlign: 'center', backgroundColor: '#fff0ed',
              borderRadius: 12, border: '1px solid #ffd5cc'
            }}>
              <p style={{ color: '#1a1a1a', marginBottom: 16 }}>
                {searchQuery ? 'No posts match your search.' : 'No posts yet. Be the first to share something.'}
              </p>
              {!searchQuery && (
                <button onClick={createBlog} style={{
                  padding: '10px 24px', backgroundColor: '#f5a097', color: '#000',
                  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14
                }}>Write a post</button>
              )}
            </div>
          ) : (
            filteredBlogs.map((blog: Blog) => (
              <Link href={`/blog/${blog.id}`} key={blog.id} style={{ textDecoration: 'none', display: 'block' }}>
                <article style={{
                  backgroundColor: '#fff', border: '1px solid #ffd5cc', borderRadius: 10,
                  padding: '24px', marginBottom: 16, cursor: 'pointer',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}>
                  <h3 style={{ color: '#000', marginBottom: 8, fontSize: 18, fontWeight: 500 }}>
                    {blog.title}
                  </h3>
                  <p style={{ color: '#333', fontSize: 13, marginBottom: 12 }}>
                    {blog.author} · {new Date(blog.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                  <p style={{ color: '#1a1a1a', fontSize: 15, lineHeight: 1.6 }}>
                    {blog.content.slice(0, 160)}...
                  </p>
                  {blog.tags && (
                    <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {blog.tags.split(',').slice(0, 3).map((tag, i) => (
                        <span key={i} style={{
                          backgroundColor: '#fff0ed', padding: '4px 10px', borderRadius: 4,
                          fontSize: 12, color: '#000'
                        }}>{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                </article>
              </Link>
            ))
          )}
        </section>

        {/* Sidebar */}
        <aside>
          <div style={{
            backgroundColor: '#fff', border: '1px solid #ffd5cc',
            borderRadius: 10, padding: 24, marginBottom: 20
          }}>
            <h3 style={{ fontSize: 16, marginBottom: 16, color: '#000', fontWeight: 600 }}>
              Start writing today
            </h3>
            <p style={{ color: '#1a1a1a', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              Share your expertise, tell your story, or explore new ideas with our community.
            </p>
            <button onClick={createBlog} style={{
              width: '100%', padding: '12px', backgroundColor: '#f5a097', color: '#000',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500
            }}>Create a post</button>
          </div>

          <div style={{
            backgroundColor: '#fff0ed', border: '1px solid #ffd5cc',
            borderRadius: 10, padding: 24
          }}>
            <h3 style={{ fontSize: 16, marginBottom: 12, color: '#000', fontWeight: 600 }}>
              About Bloggy
            </h3>
            <p style={{ color: '#1a1a1a', fontSize: 14, lineHeight: 1.6 }}>
              A modern publishing platform with smart content moderation to maintain quality and authenticity.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}