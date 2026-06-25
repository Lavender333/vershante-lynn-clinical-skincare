import { BlogPost } from '../types';

const readResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'Journal request failed.');
  return data;
};

export const fetchJournalPosts = async (status?: BlogPost['status']) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const data = await readResponse(await fetch(`/api/journal-posts${query}`));
  return Array.isArray(data.posts) ? data.posts as BlogPost[] : [];
};

export const saveJournalPostToApi = async (post: BlogPost, postId?: string) => {
  const response = await fetch(postId ? `/api/journal-posts/${postId}` : '/api/journal-posts', {
    method: postId ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post)
  });
  const data = await readResponse(response);
  return data.post as BlogPost;
};

export const deleteJournalPostFromApi = async (postId: string) => {
  await readResponse(await fetch(`/api/journal-posts/${postId}`, { method: 'DELETE' }));
};
