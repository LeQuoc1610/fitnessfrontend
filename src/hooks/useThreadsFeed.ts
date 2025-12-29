import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import type { ThreadItem } from '../components/threads/ThreadCard';

type ApiThreadItem = {
  id: string;
  author: { uid: string; displayName: string; photoURL?: string | null };
  createdAt: string;
  text: string;
  tags: string[];
  media?: { type: 'image' | 'video'; url: string; width?: number; height?: number; duration?: number }[];
  fitness?: { chips: string[]; line?: string; pr?: boolean };
  stats: { likes: number; replies: number; reposts: number };
  likedByMe?: boolean;
  savedByMe?: boolean;
  repostedByMe?: boolean;
};

type ThreadsPage = { items: ApiThreadItem[]; nextCursor: string | null };

type UploadResponse = {
  items: { type: 'image' | 'video'; url: string; width?: number; height?: number; duration?: number }[];
};

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

export function useThreadsFeed({
  pageSize = 8,
  authorId,
}: {
  pageSize?: number;
  authorId?: string;
} = {}) {
  const { user, token } = useAuth();
  const userId = user?.uid ?? null;

  const [items, setItems] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) {
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
      if (authorId) qs.set('authorId', authorId);

      const res = await fetch(`/api/threads?${qs.toString()}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = (await parseJsonSafe(res)) as ThreadsPage | any;
      if (!res.ok) {
        const message = data?.error?.message ?? data?.message ?? 'Failed to load threads';
        throw new Error(message);
      }

      const page = data as ThreadsPage;
      setItems((page.items ?? []).map((t) => toThreadItem(t, userId)));
      cursorRef.current = page.nextCursor;
      setHasMore(page.nextCursor !== null);
    } finally {
      setLoading(false);
    }
  }, [authorId, pageSize, token, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loadMore = useCallback(async () => {
    if (loading) return;
    if (!hasMore) return;
    if (!token) return;

    const cursor = cursorRef.current;
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('limit', String(pageSize));
      if (authorId) qs.set('authorId', authorId);
      if (cursor) qs.set('cursor', cursor);

      const res = await fetch(`/api/threads?${qs.toString()}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = (await parseJsonSafe(res)) as ThreadsPage | any;
      if (!res.ok) {
        const message = data?.error?.message ?? data?.message ?? 'Failed to load threads';
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
  }, [authorId, hasMore, loading, pageSize, token, userId]);

  const create = useCallback(
    async (text: string, files: File[] = []) => {
      if (!token) return;

      let media: { type: 'image' | 'video'; url: string; width?: number; height?: number; duration?: number }[] = [];
      if (files.length > 0) {
        const fd = new FormData();
        for (const f of files.slice(0, 6)) {
          fd.append('files', f);
        }

        const uploadRes = await fetch('/api/uploads', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: fd,
        });

        const uploadData = (await parseJsonSafe(uploadRes)) as UploadResponse | any;
        if (!uploadRes.ok) {
          const message = uploadData?.error ?? uploadData?.message ?? 'Failed to upload media';
          throw new Error(message);
        }

        media = Array.isArray(uploadData?.items)
          ? (uploadData.items as any[])
              .filter(Boolean)
              .map((x) => ({ type: x.type, url: x.url, width: x.width, height: x.height, duration: x.duration }))
          : [];
      }

      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ text, media }),
      });

      const data = (await parseJsonSafe(res)) as any;
      if (!res.ok) {
        const message = data?.error ?? data?.message ?? 'Failed to create thread';
        throw new Error(message);
      }

      await refresh();
    },
    [refresh, token]
  );

  const repost = useCallback(
    async (threadId: string) => {
      if (!token) return;
      const res = await fetch(`/api/threads/${encodeURIComponent(threadId)}/repost`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = (await parseJsonSafe(res)) as any;
      if (!res.ok) {
        const message = data?.error?.message ?? data?.message ?? 'Failed to repost thread';
        throw new Error(message);
      }

      const repostCount = Number(data?.repostCount);
      setItems((prev) =>
        prev.map((x) =>
          x.id === threadId
            ? {
                ...x,
                stats: {
                  ...x.stats,
                  reposts: Number.isFinite(repostCount) ? repostCount : x.stats.reposts,
                },
              }
            : x
        )
      );
    },
    [token]
  );

  const comment = useCallback(
    async (threadId: string, text: string, parentCommentId?: string | null) => {
      if (!token) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      const res = await fetch(`/api/threads/${encodeURIComponent(threadId)}/comments`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ text: trimmed, parentCommentId: parentCommentId ?? undefined }),
      });

      const data = (await parseJsonSafe(res)) as any;
      if (!res.ok) {
        const message = data?.error?.message ?? data?.message ?? 'Failed to comment';
        throw new Error(message);
      }

      setItems((prev) =>
        prev.map((x) =>
          x.id === threadId
            ? {
                ...x,
                stats: {
                  ...x.stats,
                  replies: x.stats.replies + 1,
                },
                replyCount: (x.replyCount ?? x.stats.replies) + 1,
              }
            : x
        )
      );
    },
    [token]
  );

  const adjustReplies = useCallback((threadId: string, delta: number) => {
    if (!Number.isFinite(delta) || delta === 0) return;
    setItems((prev) =>
      prev.map((x) => {
        if (x.id !== threadId) return x;
        const nextReplies = Math.max(0, x.stats.replies + delta);
        const nextReplyCount = Math.max(0, (x.replyCount ?? x.stats.replies) + delta);
        return {
          ...x,
          stats: {
            ...x.stats,
            replies: nextReplies,
          },
          replyCount: nextReplyCount,
        };
      })
    );
  }, []);

  const like = useCallback(
    async (threadId: string) => {
      if (!token) return;
      const res = await fetch(`/api/threads/${encodeURIComponent(threadId)}/like`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = (await parseJsonSafe(res)) as any;
      if (!res.ok) {
        const message = data?.error?.message ?? data?.message ?? 'Failed to like thread';
        throw new Error(message);
      }

      const likedByMe = Boolean(data?.likedByMe);
      const likeCount = Number(data?.likeCount);

      setItems((prev) =>
        prev.map((x) =>
          x.id === threadId
            ? {
                ...x,
                likedByMe,
                stats: {
                  ...x.stats,
                  likes: Number.isFinite(likeCount) ? likeCount : x.stats.likes,
                },
              }
            : x
        )
      );
    },
    [token]
  );

  const update = useCallback(
    async (threadId: string, nextText: string) => {
      if (!token) return;
      const res = await fetch(`/api/threads/${encodeURIComponent(threadId)}`, {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ text: nextText }),
      });

      const data = (await parseJsonSafe(res)) as any;
      if (!res.ok) {
        const message = data?.error?.message ?? data?.message ?? 'Failed to update thread';
        throw new Error(message);
      }

      const updated = data?.item as ApiThreadItem | undefined;
      if (!updated) {
        await refresh();
        return;
      }
      setItems((prev) => prev.map((x) => (x.id === threadId ? toThreadItem(updated, userId) : x)));
    },
    [refresh, token, userId]
  );

  const remove = useCallback(
    async (threadId: string) => {
      if (!token) return;
      const res = await fetch(`/api/threads/${encodeURIComponent(threadId)}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = (await parseJsonSafe(res)) as any;
      if (!res.ok) {
        const message = data?.error?.message ?? data?.message ?? 'Failed to delete thread';
        throw new Error(message);
      }

      setItems((prev) => prev.filter((x) => x.id !== threadId));
    },
    [token]
  );

  const stats = useMemo(
    () => ({ count: items.length, loading, hasMore }),
    [items.length, loading, hasMore]
  );

  return {
    items,
    loading,
    hasMore,
    stats,
    refresh,
    loadMore,
    create,
    like,
    repost,
    comment,
    adjustReplies,
    update,
    remove,
  };
}
