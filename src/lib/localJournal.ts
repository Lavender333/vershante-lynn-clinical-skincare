import { BlogPost } from '../types';

const LOCAL_JOURNAL_KEY = 'vershante:journal-posts';
const LOCAL_JOURNAL_EVENT = 'vershante:journal-posts-updated';

const sortPosts = (posts: BlogPost[]) =>
  [...posts].sort((a, b) => (b.publishDate || '').localeCompare(a.publishDate || ''));

const isLocalJournalPost = (postId?: string) => Boolean(postId?.startsWith('local-'));

export const loadLocalJournalPosts = (): BlogPost[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(LOCAL_JOURNAL_KEY);
    if (!stored) return [];
    const posts = JSON.parse(stored);
    return Array.isArray(posts) ? sortPosts(posts as BlogPost[]) : [];
  } catch (error) {
    console.info('Unable to load locally saved journal posts.', error);
    return [];
  }
};

const saveLocalJournalPosts = (posts: BlogPost[]) => {
  window.localStorage.setItem(LOCAL_JOURNAL_KEY, JSON.stringify(sortPosts(posts)));
  window.dispatchEvent(new Event(LOCAL_JOURNAL_EVENT));
};

export const mergeJournalPosts = (primaryPosts: BlogPost[], localPosts = loadLocalJournalPosts()) => {
  const postsById = new Map<string, BlogPost>();

  [...primaryPosts, ...localPosts].forEach((post) => {
    const key = post.slug || post.id;
    if (key) postsById.set(key, post);
  });

  return sortPosts([...postsById.values()]);
};

export const upsertLocalJournalPost = (post: BlogPost) => {
  const posts = loadLocalJournalPosts();
  const localPost = {
    ...post,
    id: post.id || `local-${Date.now()}`
  };
  const index = posts.findIndex((current) => current.id === localPost.id || current.slug === localPost.slug);

  if (index >= 0) {
    posts[index] = localPost;
  } else {
    posts.unshift(localPost);
  }

  saveLocalJournalPosts(posts);
  return localPost;
};

export const deleteLocalJournalPost = (postId: string) => {
  const posts = loadLocalJournalPosts().filter((post) => post.id !== postId);
  saveLocalJournalPosts(posts);
};

export const subscribeToLocalJournalPosts = (callback: () => void) => {
  window.addEventListener(LOCAL_JOURNAL_EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(LOCAL_JOURNAL_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};

export { isLocalJournalPost };
