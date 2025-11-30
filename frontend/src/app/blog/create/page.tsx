'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { submitBlog } from '../../../services/blogService';

export default function CreateBlogPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn || !user) {
      alert('Please sign in to create a post');
      return;
    }

    setLoading(true);
    try {
      await submitBlog({ title, author: user.name || user.email, content });
      alert('Post submitted! It will be reviewed shortly.');
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Failed to submit post');
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{
          backgroundColor: '#fff', border: '1px solid #ffd5cc',
          borderRadius: 12, padding: 48
        }}>
          <h1 style={{ color: '#000', marginBottom: 12, fontWeight: 600 }}>Sign in required</h1>
          <p style={{ color: '#1a1a1a' }}>Please sign in to create a post.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{
        marginBottom: 8, fontSize: 28, color: '#000', fontWeight: 600
      }}>Create a new post</h1>
      <p style={{ color: '#1a1a1a', marginBottom: 32 }}>
        Share your thoughts with the community
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block', marginBottom: 8, fontWeight: 500,
            color: '#000', fontSize: 14
          }}>Title</label>
          <input
            type="text"
            placeholder="Give your post a title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 8,
              border: '1px solid #ffd5cc', fontSize: 16, backgroundColor: '#fff9f7', color: '#000'
            }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{
            display: 'block', marginBottom: 8, fontWeight: 500,
            color: '#000', fontSize: 14
          }}>Content</label>
          <textarea
            placeholder="Write your content here..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={18}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 8,
              border: '1px solid #ffd5cc', fontSize: 16, resize: 'vertical',
              backgroundColor: '#fff9f7', lineHeight: 1.7, color: '#000'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px 32px', backgroundColor: '#f5a097',
              color: '#000', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontSize: 15, fontWeight: 500,
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Publishing...' : 'Publish post'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: '14px 24px', backgroundColor: 'transparent',
              color: '#000', border: '1px solid #ffd5cc', borderRadius: 8,
              cursor: 'pointer', fontSize: 15
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}

