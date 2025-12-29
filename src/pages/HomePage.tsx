import { useCallback, useEffect, useRef, useState } from 'react';
import { LeftNav } from '../components/threads/LeftNav';
import { RightRail } from '../components/threads/RightRail';
import { FeedComposer } from '../components/threads/FeedComposer';
import { MobileBottomNav } from '../components/threads/MobileBottomNav';
import { ThreadCard } from '../components/threads/ThreadCard';
import { useThreadsFeed } from '../hooks/useThreadsFeed';
import { useToast } from '../components/common/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar } from '../components/common/Avatar';

type ApiCommentItem = {
  id: string;
  parentCommentId?: string | null;
  author: { uid: string; displayName: string; photoURL?: string | null };
  text: string;
  createdAt: string;
  likeCount?: number;
  likedByMe?: boolean;
  replies?: ApiCommentItem[];
};

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function HomePage() {
  const { addToast } = useToast();
  const { token, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [feedTab, setFeedTab] = useState<'following' | 'forYou' | 'nearby'>('forYou');

  const [focusThreadId, setFocusThreadId] = useState('');

  const [commentOpen, setCommentOpen] = useState(false);
  const [commentThreadId, setCommentThreadId] = useState<string | null>(null);
  const [commentItems, setCommentItems] = useState<ApiCommentItem[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentEditId, setCommentEditId] = useState<string | null>(null);
  const [commentEditText, setCommentEditText] = useState('');
  const [commentEditSaving, setCommentEditSaving] = useState(false);
  const [commentDeleteSaving, setCommentDeleteSaving] = useState(false);
  const [commentDeleteId, setCommentDeleteId] = useState<string | null>(null);
  const [commentLikeSavingId, setCommentLikeSavingId] = useState<string | null>(null);
  const [commentReplyTo, setCommentReplyTo] = useState<{ id: string; name: string } | null>(null);

  const { items, loadMore, hasMore, loading, create, like, repost, comment, adjustReplies, update, remove } = useThreadsFeed({ pageSize: 8 });
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const updateCommentInTree = useCallback(
    (list: ApiCommentItem[], commentId: string, updater: (c: ApiCommentItem) => ApiCommentItem): ApiCommentItem[] => {
      return list.map((c) => {
        if (c.id === commentId) {
          const next = updater(c);
          return { ...next, replies: Array.isArray(next.replies) ? next.replies : [] };
        }
        const replies = Array.isArray(c.replies) ? c.replies : [];
        if (replies.length === 0) return { ...c, replies };
        const nextReplies = updateCommentInTree(replies, commentId, updater);
        return nextReplies === replies ? { ...c, replies } : { ...c, replies: nextReplies };
      });
    },
    []
  );

  const removeCommentFromTree = useCallback((list: ApiCommentItem[], commentId: string): { next: ApiCommentItem[]; removed: number } => {
    let removed = 0;

    function countAll(node: ApiCommentItem): number {
      const replies = Array.isArray(node.replies) ? node.replies : [];
      return 1 + replies.reduce((acc, r) => acc + countAll(r), 0);
    }

    function walk(items: ApiCommentItem[]): ApiCommentItem[] {
      const out: ApiCommentItem[] = [];
      for (const c of items) {
        if (c.id === commentId) {
          removed += countAll(c);
          continue;
        }
        const replies = Array.isArray(c.replies) ? c.replies : [];
        const nextReplies = replies.length > 0 ? walk(replies) : replies;
        out.push(replies === nextReplies ? { ...c, replies } : { ...c, replies: nextReplies });
      }
      return out;
    }

    const next = walk(list);
    return { next, removed };
  }, []);

  const openComments = useCallback(
    async (threadId: string) => {
      setCommentOpen(true);
      setCommentThreadId(threadId);
      setCommentItems([]);
      setCommentText('');
      setCommentReplyTo(null);
      setCommentEditId(null);
      setCommentEditText('');
      setCommentEditSaving(false);
      setCommentDeleteSaving(false);
      setCommentDeleteId(null);
      setCommentLikeSavingId(null);
      setCommentLoading(true);
      try {
        const res = await fetch(`/api/threads/${encodeURIComponent(threadId)}/comments`, {
          headers: token
            ? {
                authorization: `Bearer ${token}`,
              }
            : undefined,
        });
        const data = (await parseJsonSafe(res)) as any;
        if (!res.ok) {
          const message = data?.error?.message ?? data?.message ?? 'Failed to load comments';
          throw new Error(message);
        }
        const roots = Array.isArray(data?.items) ? (data.items as ApiCommentItem[]) : [];
        setCommentItems(roots);
      } catch (e: any) {
        addToast(e?.message ?? 'Failed to load comments', { type: 'error' });
      } finally {
        setCommentLoading(false);
      }
    },
    [addToast, token]
  );

  useEffect(() => {
    const nextOpenCommentsId = String((location.state as any)?.openCommentsThreadId ?? '');
    const nextFocusId = String((location.state as any)?.focusThreadId ?? '');

    if (nextOpenCommentsId) {
      void openComments(nextOpenCommentsId);
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    if (nextFocusId) {
      setFocusThreadId(nextFocusId);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate, openComments]);

  useEffect(() => {
    if (!focusThreadId) return;
    if (items.length === 0) return;
    const el = document.getElementById(`thread-${focusThreadId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFocusThreadId('');
  }, [focusThreadId, items.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: '600px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const closeComments = () => {
    setCommentOpen(false);
    setCommentThreadId(null);
    setCommentItems([]);
    setCommentText('');
    setCommentLoading(false);
    setCommentReplyTo(null);
    setCommentEditId(null);
    setCommentEditText('');
    setCommentEditSaving(false);
    setCommentDeleteSaving(false);
    setCommentDeleteId(null);
    setCommentLikeSavingId(null);
  };

  const updateComment = async (threadId: string, commentId: string, nextText: string) => {
    const trimmed = nextText.trim();
    if (!trimmed) throw new Error('text is required');
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(
      `/api/threads/${encodeURIComponent(threadId)}/comments/${encodeURIComponent(commentId)}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ text: trimmed }),
      }
    );

    const data = (await parseJsonSafe(res)) as any;
    if (!res.ok) {
      const message = data?.error?.message ?? data?.message ?? 'Failed to update comment';
      throw new Error(message);
    }

    setCommentItems((prev) => updateCommentInTree(prev, commentId, (c) => ({ ...c, text: trimmed })));
  };

  const deleteComment = async (threadId: string, commentId: string) => {
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(
      `/api/threads/${encodeURIComponent(threadId)}/comments/${encodeURIComponent(commentId)}`,
      {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    const data = (await parseJsonSafe(res)) as any;
    if (!res.ok) {
      const message = data?.error?.message ?? data?.message ?? 'Failed to delete comment';
      throw new Error(message);
    }

    setCommentItems((prev) => {
      const { next, removed } = removeCommentFromTree(prev, commentId);
      adjustReplies(threadId, -removed);
      return next;
    });
  };

  const toggleCommentLike = async (threadId: string, commentId: string) => {
    if (!token) throw new Error('Unauthorized');
    const res = await fetch(
      `/api/threads/${encodeURIComponent(threadId)}/comments/${encodeURIComponent(commentId)}/like`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    const data = (await parseJsonSafe(res)) as any;
    if (!res.ok) {
      const message = data?.error?.message ?? data?.message ?? 'Failed to like comment';
      throw new Error(message);
    }

    const likedByMe = Boolean(data?.likedByMe);
    const likeCount = Number(data?.likeCount);

    setCommentItems((prev) =>
      updateCommentInTree(prev, commentId, (c) => ({
        ...c,
        likedByMe,
        likeCount: Number.isFinite(likeCount) ? likeCount : (c.likeCount ?? 0),
      }))
    );
  };

  const renderComment = (c: ApiCommentItem, depth: number) => {
    const replies = Array.isArray(c.replies) ? c.replies : [];
    const isSelf = user?.uid && String(c.author?.uid ?? '') === String(user.uid);
    return (
      <div key={c.id} className={depth > 0 ? 'ml-8 space-y-2' : 'space-y-2'}>
        <div className="rounded-2xl border border-border/60 bg-background/20 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 min-w-0">
              <Link to={`/profile/${encodeURIComponent(String(c.author?.uid ?? ''))}`} className="shrink-0">
                <Avatar src={c.author?.photoURL ?? null} alt={c.author?.displayName ?? 'GymBro'} size="sm" />
              </Link>
              <Link
                to={`/profile/${encodeURIComponent(String(c.author?.uid ?? ''))}`}
                className="text-xs font-semibold text-foreground truncate hover:underline"
              >
                {c.author?.displayName ?? 'GymBro'}
              </Link>
            </div>

            {isSelf && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full border border-border/70 bg-background/30 px-3 py-1 text-[11px] font-semibold text-muted hover:text-foreground disabled:opacity-60"
                  disabled={commentEditSaving || commentDeleteSaving}
                  onClick={() => {
                    setCommentEditId(c.id);
                    setCommentEditText(c.text);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-full border border-rose-400/50 bg-rose-400/10 px-3 py-1 text-[11px] font-semibold text-rose-200 hover:bg-rose-400/15 disabled:opacity-60"
                  disabled={commentEditSaving || commentDeleteSaving}
                  onClick={() => {
                    setCommentDeleteId(c.id);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {commentEditId === c.id ? (
            <div className="mt-2 space-y-2">
              <input
                value={commentEditText}
                onChange={(e) => setCommentEditText(e.target.value)}
                className="w-full rounded-xl border border-border/70 bg-background/30 px-3 py-2 text-sm outline-none focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/10"
                disabled={commentEditSaving}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-full border border-border/70 bg-background/30 px-4 py-1.5 text-xs font-semibold text-muted hover:text-foreground disabled:opacity-60"
                  disabled={commentEditSaving}
                  onClick={() => {
                    setCommentEditId(null);
                    setCommentEditText('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-full btn-accent px-5 py-1.5 text-xs font-bold text-background hover:opacity-90 disabled:opacity-60"
                  disabled={commentEditSaving || commentEditText.trim().length === 0}
                  onClick={() =>
                    void (async () => {
                      if (!commentThreadId) return;
                      if (commentEditSaving) return;
                      setCommentEditSaving(true);
                      try {
                        await updateComment(commentThreadId, c.id, commentEditText);
                        setCommentEditId(null);
                        setCommentEditText('');
                        addToast('Updated', { type: 'success' });
                      } catch (e: any) {
                        addToast(e?.message ?? 'Failed to update comment', { type: 'error' });
                      } finally {
                        setCommentEditSaving(false);
                      }
                    })()
                  }
                >
                  {commentEditSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-sm text-foreground break-words">{c.text}</div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={
                  c.likedByMe
                    ? 'flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1 text-[11px] font-semibold text-rose-200 hover:bg-rose-400/15 disabled:opacity-60'
                    : 'flex items-center gap-2 rounded-full border border-border/70 bg-background/30 px-3 py-1 text-[11px] font-semibold text-muted hover:text-foreground disabled:opacity-60'
                }
                disabled={commentLikeSavingId === c.id || commentLoading || commentEditSaving || commentDeleteSaving}
                onClick={() =>
                  void (async () => {
                    if (!commentThreadId) return;
                    if (commentLikeSavingId) return;
                    setCommentLikeSavingId(c.id);
                    try {
                      await toggleCommentLike(commentThreadId, c.id);
                    } catch (e: any) {
                      addToast(e?.message ?? 'Failed to like comment', { type: 'error' });
                    } finally {
                      setCommentLikeSavingId(null);
                    }
                  })()
                }
                aria-pressed={!!c.likedByMe}
              >
                {c.likedByMe ? <HeartFilled /> : <HeartOutlined />}
                <span>{c.likeCount ?? 0}</span>
              </button>

              <button
                type="button"
                className="rounded-full border border-border/70 bg-background/30 px-3 py-1 text-[11px] font-semibold text-muted hover:text-foreground disabled:opacity-60"
                disabled={commentLoading || commentEditSaving || commentDeleteSaving}
                onClick={() => {
                  setCommentReplyTo({ id: c.id, name: c.author?.displayName ?? 'GymBro' });
                }}
              >
                Reply
              </button>
            </div>

            <div className="text-[11px] text-muted">{new Date(c.createdAt).toLocaleString()}</div>
          </div>
        </div>

        {replies.length > 0 && <div className="space-y-2">{replies.map((r) => renderComment(r, depth + 1))}</div>}
      </div>
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_360px]">
      <LeftNav />

      <section className="space-y-4">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-3xl tracking-wide text-neon-blue">GymBro Feed</h1>
            <p className="text-sm text-muted mt-1">Nơi anh em chia sẻ lịch tập, PR mới và hành trình transform.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFeedTab('following')}
              className={
                feedTab === 'following'
                  ? 'rounded-full border border-neon-green/50 bg-background/30 px-4 py-2 text-xs font-bold text-neon-green'
                  : 'rounded-full border border-border/70 bg-background/30 px-4 py-2 text-xs font-semibold text-muted hover:text-foreground'
              }
            >
              Following
            </button>
            <button
              type="button"
              onClick={() => setFeedTab('forYou')}
              className={
                feedTab === 'forYou'
                  ? 'rounded-full border border-neon-blue/50 bg-background/30 px-4 py-2 text-xs font-bold text-neon-blue'
                  : 'rounded-full border border-border/70 bg-background/30 px-4 py-2 text-xs font-semibold text-muted hover:text-foreground'
              }
            >
              For you
            </button>
            <button
              type="button"
              onClick={() => setFeedTab('nearby')}
              className={
                feedTab === 'nearby'
                  ? 'rounded-full border border-neon-orange/50 bg-background/30 px-4 py-2 text-xs font-bold text-neon-orange'
                  : 'rounded-full border border-border/70 bg-background/30 px-4 py-2 text-xs font-semibold text-muted hover:text-foreground'
              }
            >
              Nearby
            </button>
          </div>
        </header>

        <FeedComposer
          onPost={async (text, files) => {
            try {
              await create(text, files);
              addToast('Posted', { type: 'success' });
            } catch (e: any) {
              addToast(e?.message ?? 'Failed to post', { type: 'error' });
            }
          }}
        />

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} id={`thread-${item.id}`}>
              <ThreadCard
                item={item}
                onToggleLike={(id) =>
                  void (async () => {
                    try {
                      await like(id);
                    } catch (e: any) {
                      addToast(e?.message ?? 'Failed to like', { type: 'error' });
                    }
                  })()
                }
                onEdit={(id, nextText) =>
                  void (async () => {
                    try {
                      await update(id, nextText);
                      addToast('Updated', { type: 'success' });
                    } catch (e: any) {
                      addToast(e?.message ?? 'Failed to update', { type: 'error' });
                    }
                  })()
                }
                onDelete={(id) =>
                  void (async () => {
                    try {
                      await remove(id);
                      addToast('Deleted', { type: 'success' });
                    } catch (e: any) {
                      addToast(e?.message ?? 'Failed to delete', { type: 'error' });
                    }
                  })()
                }
                onComment={(id) => void openComments(id)}
                onShare={(id) =>
                  void (async () => {
                    try {
                      await repost(id);
                      addToast('Shared', { type: 'success' });
                    } catch (e: any) {
                      addToast(e?.message ?? 'Failed to share', { type: 'error' });
                    }
                  })()
                }
              />
            </div>
          ))}
        </div>

        <div className="card-neon p-4 text-sm text-muted">
          {loading ? 'Loading…' : hasMore ? 'Scroll to load more…' : 'You reached the end.'}
        </div>
        <div ref={sentinelRef} />
      </section>

      <RightRail />

      <MobileBottomNav />

      {commentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeComments} />
          <div className="relative w-full max-w-lg card-neon p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-muted">Comments</div>
                <h3 className="mt-1 font-display text-xl text-neon-blue">Replies</h3>
              </div>
              <button
                type="button"
                onClick={closeComments}
                className="rounded-full border border-border/70 bg-background/30 px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="mt-4 max-h-[50vh] overflow-auto space-y-3">
              {commentLoading ? (
                <div className="text-sm text-muted">Loading…</div>
              ) : commentItems.length === 0 ? (
                <div className="text-sm text-muted">No comments yet.</div>
              ) : (
                commentItems.map((c) => renderComment(c, 0))
              )}
            </div>

            {commentDeleteId && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                <div
                  className="absolute inset-0 bg-black/60"
                  onClick={() => {
                    if (commentDeleteSaving) return;
                    setCommentDeleteId(null);
                  }}
                />
                <div className="relative w-full max-w-md card-neon p-5">
                  <div className="text-xs uppercase tracking-[0.25em] text-muted">Delete comment</div>
                  <h3 className="mt-1 font-display text-xl text-rose-300">Are you sure?</h3>
                  <div className="mt-2 text-sm text-muted">This action can’t be undone.</div>

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setCommentDeleteId(null)}
                      disabled={commentDeleteSaving}
                      className="rounded-full border border-border/70 bg-background/30 px-5 py-2 text-xs font-semibold text-muted hover:text-foreground disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={commentDeleteSaving}
                      className="rounded-full border border-rose-400/50 bg-rose-400/10 px-6 py-2 text-xs font-bold text-rose-200 hover:bg-rose-400/15 disabled:opacity-60"
                      onClick={() =>
                        void (async () => {
                          if (!commentThreadId) return;
                          if (!commentDeleteId) return;
                          if (commentDeleteSaving) return;
                          setCommentDeleteSaving(true);
                          try {
                            await deleteComment(commentThreadId, commentDeleteId);
                            if (commentEditId === commentDeleteId) {
                              setCommentEditId(null);
                              setCommentEditText('');
                            }
                            setCommentDeleteId(null);
                            addToast('Deleted', { type: 'success' });
                          } catch (e: any) {
                            addToast(e?.message ?? 'Failed to delete comment', { type: 'error' });
                          } finally {
                            setCommentDeleteSaving(false);
                          }
                        })()
                      }
                    >
                      {commentDeleteSaving ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={commentReplyTo ? `Reply to ${commentReplyTo.name}…` : 'Write a comment…'}
                className="flex-1 rounded-xl border border-border/70 bg-background/30 px-3 py-2 text-sm outline-none focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/10"
              />
              <button
                type="button"
                className="rounded-full btn-accent px-5 py-2 text-xs font-bold text-background hover:opacity-90"
                onClick={() =>
                  void (async () => {
                    if (!commentThreadId) return;
                    try {
                      await comment(commentThreadId, commentText, commentReplyTo?.id ?? null);
                      setCommentText('');
                      setCommentReplyTo(null);
                      await openComments(commentThreadId);
                      addToast('Commented', { type: 'success' });
                    } catch (e: any) {
                      addToast(e?.message ?? 'Failed to comment', { type: 'error' });
                    }
                  })()
                }
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
