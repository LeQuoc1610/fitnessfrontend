import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import type { ThreadItem } from '../components/threads/ThreadCard';

type ApiThreadItem = {
  id: string;
  author: { uid: string; displayName: string; photoURL?: string | null };
  createdAt: string;
  text: string;
  tags: string[];
  media?: { type: 'image' | 'video'; url: string }[];
  fitness?: { chips: string[]; line?: string; pr?: boolean };
  stats: { likes: number; replies: number; reposts: number };
  likedByMe?: boolean;
  savedByMe?: boolean;
  repostedByMe?: boolean;
};

type ThreadsPage = { items: ApiThreadItem[]; nextCursor: string | null };

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function toThreadItem(t: ApiThreadItem, currentUserId: string | null): ThreadItem {
  const isSelf = currentUserId ? String(t.author.uid) === String(currentUserId) : false;
  return {
    id: t.id,
    authorUid: t.author.uid,
    authorName: t.author.displayName,
    authorPhotoURL: t.author.photoURL ?? null,
    authorLabel: isSelf ? 'YOU' : null,
    createdAt: t.createdAt,
    text: t.text,
    tags: t.tags ?? [],
    media: t.media ?? [],
    stats: t.stats,
    fitness: t.fitness,
    repliesPreview: [],
    replyCount: t.stats.replies,
    likedByMe: !!t.likedByMe,
  };
}

export function useRepostsFeed({
  pageSize = 10,
  uid,
}: {
  pageSize?: number;
  uid: string;
}) {
  const { user, token } = useAuth();
  const userId = user?.uid ?? null;

  const [items, setItems] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token || !uid) {
      cursorRef.current = null;
      setItems([]);
      setHasMore(false);
      return;
    }

    setLoading(true);
    try {
      cursorRef.current = null;
      const qs = new URLSearchParams();
      qs.set('limit', String(pageSize));
      qs.set('uid', uid);

      const res = await fetch(`/api/threads/reposts?${qs.toString()}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = (await parseJsonSafe(res)) as ThreadsPage | any;
      if (!res.ok) {
        const message = data?.error?.message ?? data?.message ?? 'Failed to load reposts';
        throw new Error(message);
      }

      const page = data as ThreadsPage;
      setItems((page.items ?? []).map((t) => toThreadItem(t, userId)));
      cursorRef.current = page.nextCursor;
      setHasMore(page.nextCursor !== null);
    } finally {
      setLoading(false);
    }
  }, [pageSize, token, uid, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loadMore = useCallback(async () => {
    if (loading) return;
    if (!hasMore) return;
    if (!token) return;
    if (!uid) return;

    const cursor = cursorRef.current;
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('limit', String(pageSize));
      qs.set('uid', uid);
      if (cursor) qs.set('cursor', cursor);

      const res = await fetch(`/api/threads/reposts?${qs.toString()}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = (await parseJsonSafe(res)) as ThreadsPage | any;
      if (!res.ok) {
        const message = data?.error?.message ?? data?.message ?? 'Failed to load reposts';
        throw new Error(message);
      }

      const page = data as ThreadsPage;
      setItems((prev) => {
        const next = (page.items ?? []).map((t) => toThreadItem(t, userId));
        const seen = new Set(prev.map((x) => x.id));
        return [...prev, ...next.filter((x) => !seen.has(x.id))];
      });
      cursorRef.current = page.nextCursor;
      setHasMore(page.nextCursor !== null);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, pageSize, token, uid, userId]);

  const stats = useMemo(() => ({ count: items.length, loading, hasMore }), [hasMore, items.length, loading]);

  return {
    items,
    loading,
    hasMore,
    stats,
    refresh,
    loadMore,
  };
}
