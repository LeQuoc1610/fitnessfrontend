import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../components/common/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { useFollow } from '../hooks/useFollow';
import { useProfile } from '../hooks/useProfile';
import { useRepostsFeed } from '../hooks/useRepostsFeed';
import { useThreadsFeed } from '../hooks/useThreadsFeed';
import { ThreadCard } from '../components/threads/ThreadCard';

type ProfileTab = 'Post' | 'Repost';

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function ProfilePage() {
  const { addToast } = useToast();
  const { uid } = useParams<{ uid: string }>();
  const [activeTab, setActiveTab] = useState<ProfileTab>('Post');

  const { user, token, refreshMe } = useAuth();
  const { profile, loading: profileLoading, error: profileError, isCurrentUser, refresh } = useProfile(uid ?? '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [displayNameEditing, setDisplayNameEditing] = useState(false);
  const [displayNameValue, setDisplayNameValue] = useState('');
  const [displayNameSaving, setDisplayNameSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const { items, loadMore, hasMore, loading, update, remove } = useThreadsFeed({ pageSize: 10, authorId: uid });
  const {
    items: repostItems,
    loadMore: loadMoreReposts,
    hasMore: hasMoreReposts,
    loading: loadingReposts,
    refresh: refreshReposts,
  } = useRepostsFeed({ pageSize: 10, uid: uid ?? '' });
  const follow = useFollow(uid ?? '');
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const repostSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveTab('Post');
  }, [uid]);

  useEffect(() => {
    if (!profile) return;
    if (!isCurrentUser) return;
    if (displayNameEditing) return;
    setDisplayNameValue(profile.displayName ?? '');
  }, [displayNameEditing, isCurrentUser, profile]);

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

  useEffect(() => {
    const el = repostSentinelRef.current;
    if (!el) return;
    if (!hasMoreReposts) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          void loadMoreReposts();
        }
      },
      { rootMargin: '600px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMoreReposts, loadMoreReposts]);


  if (!uid) return <div className="text-sm text-red-400">Profile not found.</div>;

  const glassCard =
    'rounded-[18px] border border-[rgba(255,255,255,0.04)] bg-[rgba(8,12,18,0.6)] shadow-[0_18px_60px_rgba(7,20,26,0.6),inset_0_0_40px_rgba(41,224,185,0.03)]';

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'Post', label: 'Post' },
    { key: 'Repost', label: 'Repost' },
  ];

  if (profileLoading) {
    return <div className="card-neon p-6 text-sm text-muted">Loading…</div>;
  }

  if (profileError) {
    return <div className="card-neon p-6 text-sm text-red-400">{profileError}</div>;
  }

  if (!profile) {
    return <div className="card-neon p-6 text-sm text-red-400">Profile not found.</div>;
  }

  const displayName = profile.displayName || profile.email;
  const badge = user && user.uid === profile.uid ? ('YOU' as const) : null;

  return (
    <div className="space-y-6">
      <section className={cn(glassCard, 'overflow-hidden')}>
        <div className="relative">
          <div className="h-32 md:h-40 bg-[linear-gradient(90deg,rgba(42,183,228,0.25),rgba(41,224,185,0.25))]" />

          <div className="px-4 md:px-6 -mt-14 pb-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-4">
                <div className="h-[110px] w-[110px] rounded-full p-[3px] bg-[linear-gradient(135deg,#2AB7E4,#29E0B9)]">
                  <div className="h-full w-full rounded-full bg-[#041017] flex items-center justify-center">
                    {profile.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt={displayName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-[linear-gradient(135deg,#2AB7E4,#29E0B9)] opacity-90 flex items-center justify-center font-display text-3xl text-[#041017]">
                        {displayName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {displayNameEditing ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          value={displayNameValue}
                          onChange={(e) => setDisplayNameValue(e.target.value)}
                          className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(8,12,18,0.35)] px-3 py-2 text-sm text-[#cfeff0] outline-none focus:border-[#2AB7E4]/60 focus:ring-2 focus:ring-[#2AB7E4]/10"
                          disabled={displayNameSaving}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="rounded-xl px-3 py-2 text-xs font-bold text-[#041017] bg-[linear-gradient(90deg,#2AB7E4,#29E0B9)] hover:opacity-95 transition-opacity disabled:opacity-60"
                          disabled={displayNameSaving || displayNameValue.trim().length === 0}
                          onClick={() =>
                            void (async () => {
                              if (!token) {
                                addToast('Unauthorized', { type: 'error' });
                                return;
                              }
                              if (displayNameSaving) return;

                              const nextName = displayNameValue.trim();
                              if (!nextName) {
                                addToast('Name is required', { type: 'error' });
                                return;
                              }

                              setDisplayNameSaving(true);
                              try {
                                const res = await fetch('/api/profiles/me', {
                                  method: 'PUT',
                                  headers: {
                                    authorization: `Bearer ${token}`,
                                    'content-type': 'application/json',
                                  },
                                  body: JSON.stringify({ displayName: nextName }),
                                });

                                const data = (await res.json().catch(() => null)) as any;
                                if (!res.ok) {
                                  const message = data?.error?.message ?? data?.message ?? 'Update failed';
                                  throw new Error(message);
                                }

                                addToast('Name updated', { type: 'success' });
                                setDisplayNameEditing(false);
                                refresh();
                                await refreshMe();
                              } catch (e: any) {
                                addToast(e?.message ?? 'Update failed', { type: 'error' });
                              } finally {
                                setDisplayNameSaving(false);
                              }
                            })()
                          }
                        >
                          {displayNameSaving ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          className="rounded-xl px-3 py-2 text-xs font-semibold text-[#9ecfd0] border border-[rgba(255,255,255,0.04)] bg-transparent hover:bg-[rgba(255,255,255,0.02)] transition-colors disabled:opacity-60"
                          disabled={displayNameSaving}
                          onClick={() => {
                            setDisplayNameEditing(false);
                            setDisplayNameValue(profile.displayName ?? '');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-display text-xl md:text-2xl tracking-wide text-[#74F0D4] truncate">{displayName}</div>
                        {isCurrentUser && (
                          <button
                            type="button"
                            className="rounded-full border border-[rgba(255,255,255,0.08)] bg-transparent px-3 py-1 text-[11px] font-semibold text-[#9ecfd0] hover:bg-[rgba(255,255,255,0.02)] disabled:opacity-60"
                            disabled={displayNameSaving}
                            onClick={() => {
                              setDisplayNameEditing(true);
                              setDisplayNameValue(profile.displayName ?? '');
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                    {badge && (
                      <span className="rounded-full border border-emerald-400/50 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-[#9cffb8]">
                        {badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-[#9ecfd0] max-w-2xl">
                    {profile.bio ?? ''}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isCurrentUser ? (
                  <>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        void (async () => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (!token) {
                            addToast('Unauthorized', { type: 'error' });
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            addToast('Avatar must be <= 5MB', { type: 'error' });
                            return;
                          }

                          setAvatarUploading(true);
                          try {
                            const fd = new FormData();
                            fd.append('avatar', file);

                            const res = await fetch('/api/profiles/me/avatar', {
                              method: 'PUT',
                              headers: {
                                authorization: `Bearer ${token}`,
                              },
                              body: fd,
                            });

                            const data = (await res.json().catch(() => null)) as any;
                            if (!res.ok) {
                              const message = data?.error?.message ?? data?.message ?? 'Upload failed';
                              throw new Error(message);
                            }

                            addToast('Avatar updated', { type: 'success' });
                            refresh();
                            await refreshMe();
                          } catch (err: any) {
                            addToast(err?.message ?? 'Upload failed', { type: 'error' });
                          } finally {
                            setAvatarUploading(false);
                            if (avatarInputRef.current) avatarInputRef.current.value = '';
                          }
                        })()
                      }
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-[#041017] bg-[linear-gradient(90deg,#2AB7E4,#29E0B9)] hover:opacity-95 transition-opacity"
                    >
                      {avatarUploading ? 'Uploading…' : 'Change Avatar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => addToast('More actions (placeholder)', { type: 'info' })}
                      className="rounded-xl px-3 py-2 text-xs font-semibold text-[#9ecfd0] border border-[rgba(255,255,255,0.04)] bg-transparent hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    >
                      •••
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={follow.loading || follow.isSelf}
                    onClick={() =>
                      void (async () => {
                        try {
                          await follow.toggle();
                        } catch (e: any) {
                          addToast(e?.message ?? 'Failed', { type: 'error' });
                        }
                      })()
                    }
                    className={
                      follow.stats.isFollowing
                        ? 'rounded-xl px-4 py-2 text-xs font-bold text-[#9ecfd0] border border-[rgba(255,255,255,0.08)] bg-transparent hover:bg-[rgba(255,255,255,0.02)] transition-colors disabled:opacity-60'
                        : 'rounded-xl px-4 py-2 text-xs font-bold text-[#041017] bg-[linear-gradient(90deg,#2AB7E4,#29E0B9)] hover:opacity-95 transition-opacity disabled:opacity-60'
                    }
                  >
                    {follow.stats.isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="rounded-[18px] border border-[rgba(255,255,255,0.04)] bg-[rgba(8,12,18,0.35)] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.22em] text-[#9ecfd0]">Posts</div>
                <div className="mt-1 font-display text-xl text-[#cfeff0]">{items.length}</div>
              </div>
              <div className="rounded-[18px] border border-[rgba(255,255,255,0.04)] bg-[rgba(8,12,18,0.35)] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.22em] text-[#9ecfd0]">Following</div>
                <div className="mt-1 font-display text-xl text-[#cfeff0]">{follow.stats.followingCount}</div>
              </div>
              <div className="rounded-[18px] border border-[rgba(255,255,255,0.04)] bg-[rgba(8,12,18,0.35)] px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.22em] text-[#9ecfd0]">Followers</div>
                <div className="mt-1 font-display text-xl text-[#cfeff0]">{follow.stats.followerCount}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={cn(glassCard, 'px-2 py-2 sticky top-[64px] z-20 backdrop-blur')}>
        <div className="flex items-center gap-1">
          {tabs.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  'flex-1 rounded-xl px-3 py-2 text-xs md:text-sm font-semibold transition-colors',
                  isActive ? 'text-[#29E0B9]' : 'text-[#9ecfd0] hover:bg-[rgba(255,255,255,0.02)] hover:text-[#cfeff0]'
                )}
              >
                <span className="relative inline-flex flex-col items-center">
                  <span>{t.label}</span>
                  <span
                    className={cn(
                      'mt-2 h-[2px] w-10 rounded-full transition-all',
                      isActive ? 'bg-[#29E0B9]' : 'bg-transparent'
                    )}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 transition-all duration-300">
        {activeTab === 'Post' && (
          <div className="space-y-4">
            {items.map((t) => (
              <ThreadCard
                key={t.id}
                item={t}
                onToggleLike={() => addToast('Like (open from feed)', { type: 'info' })}
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
              />
            ))}

            <div className={cn(glassCard, 'p-4 text-sm text-[#9ecfd0]')}>
              {loading ? 'Loading…' : hasMore ? 'Scroll to load more…' : 'No more posts.'}
            </div>
            <div ref={sentinelRef} />
          </div>
        )}

        {activeTab === 'Repost' && (
          <div className="space-y-4">
            {repostItems.map((t) => (
              <ThreadCard
                key={t.id}
                item={t}
                onToggleLike={() => addToast('Like (open from feed)', { type: 'info' })}
                onEdit={(id, nextText) =>
                  void (async () => {
                    try {
                      await update(id, nextText);
                      await refreshReposts();
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
                      await refreshReposts();
                      addToast('Deleted', { type: 'success' });
                    } catch (e: any) {
                      addToast(e?.message ?? 'Failed to delete', { type: 'error' });
                    }
                  })()
                }
              />
            ))}

            <div className={cn(glassCard, 'p-4 text-sm text-[#9ecfd0]')}>
              {loadingReposts ? 'Loading…' : hasMoreReposts ? 'Scroll to load more…' : 'No more reposts.'}
            </div>
            <div ref={repostSentinelRef} />
          </div>
        )}
      </section>
    </div>
  );
}
