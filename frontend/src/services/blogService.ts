

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export async function submitBlog(blog: {title:string, author:string, content:string}){
    const res = await fetch(`${API_BASE}/api/blogs`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(blog),
    });

    if(!res.ok) throw new Error('Failed to submit blog');
    return res.json();
}

export async function fetchBlogsByStatus(status: String){
    const res = await fetch(`${API_BASE}/api/blogs?status=${status}`);
    if(!res.ok) throw new Error('Failed to fetch blogs');
    return res.json();
}

export async function approveBlog(id: number){
    const res = await fetch(`${API_BASE}/api/blogs/${id}/approve`, {
        method: 'PUT',
    });

    if(!res.ok) throw new Error('Failed to approve blog');
    return res.json();
}

export async function rejectBlog(id: number){
    const res = await fetch(`${API_BASE}/api/blogs/${id}/reject`, {
        method: 'PUT',
    });

    if(!res.ok) throw new Error('Failed to reject blog');
    return res.json();
}

export async function putUnderReview(id: number){
    const res = await fetch(`${API_BASE}/api/blogs/${id}/review`, {
        method: 'PUT',
    });

    if(!res.ok) throw new Error('Failed to put blog under review');
    return res.json();
}

export async function fetchBlogsByAuthor(author: string){
    const res = await fetch(`${API_BASE}/api/blogs?author=${encodeURIComponent(author)}`);
    if(!res.ok) throw new Error('Failed to fetch blogs by author');
    return res.json();
}