import { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar } from '../common/Avatar';
import { formatTimeFromNow } from '../../utils/formatTime';
import { PostActionBar } from './PostActionBar';
import { Link } from 'react-router-dom';

type ThreadReply = {
  id: string;
  authorName: string;
  authorPhotoURL?: string | null;
  text: string;
  createdAt: string | number | Date;
};

type FitnessMeta = {
  chips: string[];
  line?: string;
  pr?: boolean;
};

export type ThreadItem = {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhotoURL?: string | null;
  authorLabel?: 'YOU' | 'Verified' | null;
  createdAt: string | number | Date;
  text: string;
  tags: string[];
  media?: { type: 'image' | 'video'; url: string; width?: number; height?: number; duration?: number }[];
  stats: { likes: number; replies: number; reposts: number };
  fitness?: FitnessMeta;
  repliesPreview?: ThreadReply[];
  replyCount?: number;
  likedByMe?: boolean;
};

function highlightHashtags(text: string) {
  const parts = text.split(/(#[A-Za-z0-9_]+)/g);
  return parts.map((p, idx) => {
    if (p.startsWith('#')) {
      return (
        <span key={idx} className="text-neon-blue">
          {p}
        </span>
      );
    }
    return <span key={idx}>{p}</span>;
  });
}

export function ThreadCard({
  item,
  onToggleLike,
  onComment,
  onShare,
  onEdit,
  onDelete,
}: {
  item: ThreadItem;
  onToggleLike?: (threadId: string) => void;
  onComment?: (threadId: string) => void;
  onShare?: (threadId: string) => void;
  onEdit?: (threadId: string, nextText: string) => void | Promise<void>;
  onDelete?: (threadId: string) => void | Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editSaving, setEditSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const media = item.media ?? [];
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIdx, setViewerIdx] = useState(0);

  const time = useMemo(() => formatTimeFromNow(item.createdAt), [item.createdAt]);

  const replies = item.repliesPreview ?? [];
  const repliesToShow = expanded ? replies : replies.slice(0, 2);

  const isSelf = item.authorLabel === 'YOU';

  const isVideoPost = media.length === 1 && media[0]?.type === 'video';
  const isImagePost = media.length > 0 && media.every((m) => m.type === 'image');

  useEffect(() => {
    setActiveMediaIdx(0);
  }, [media.length]);

  const onCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (!w) return;
    const idx = Math.round(el.scrollLeft / w);
    if (Number.isFinite(idx)) setActiveMediaIdx(Math.max(0, Math.min(media.length - 1, idx)));
  };

  const scrollToMedia = (idx: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollTo({ left: w * idx, behavior: 'smooth' });
  };

  const openViewer = (idx: number) => {
    if (!isImagePost) return;
    setViewerIdx(idx);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);

  const goPrevViewer = () => setViewerIdx((i) => (media.length ? (i - 1 + media.length) % media.length : 0));
  const goNextViewer = () => setViewerIdx((i) => (media.length ? (i + 1) % media.length : 0));

  const closeEdit = () => {
    if (editSaving) return;
    setEditOpen(false);
  };

  const closeDelete = () => {
    if (deleteSaving) return;
    setDeleteOpen(false);
  };

  return (
    <article className="card-neon p-4 md:p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Link to={`/profile/${encodeURIComponent(item.authorUid)}`} className="shrink-0">
            <Avatar src={item.authorPhotoURL ?? null} alt={item.authorName} size="md" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/profile/${encodeURIComponent(item.authorUid)}`}
                className="font-semibold text-sm text-foreground truncate hover:underline"
              >
                {item.authorName}
              </Link>
              {item.authorLabel && (
                <span
                  className={
                    item.authorLabel === 'YOU'
                      ? 'rounded-full border border-neon-green/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-neon-green'
                      : 'rounded-full border border-neon-blue/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-neon-blue'
                  }
                >
                  {item.authorLabel}
                </span>
              )}
              <span className="text-xs text-muted">· {time}</span>
              {item.fitness?.pr && (
                <span className="rounded-full border border-neon-orange/60 bg-background/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-neon-orange">
                  PR
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((s) => !s)}
            className="rounded-full border border-border/70 bg-background/30 px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
            aria-label="Post menu"
          >
            •••
          </button>

          {menuOpen && isSelf && (
            <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-border/60 bg-background/95 backdrop-blur shadow-neon">
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-xs font-semibold text-foreground hover:bg-background/60"
                onClick={() => {
                  setMenuOpen(false);
                  setEditText(item.text);
                  setEditOpen(true);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-300 hover:bg-background/60"
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteOpen(true);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </header>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeEdit} />
          <div className="relative w-full max-w-lg card-neon p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-muted">Edit post</div>
                <h3 className="mt-1 font-display text-xl text-neon-blue">Update</h3>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                disabled={editSaving}
                className="rounded-full border border-border/70 bg-background/30 px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground disabled:opacity-60"
              >
                Close
              </button>
            </div>

            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={5}
              className="mt-4 w-full resize-none rounded-2xl border border-border/70 bg-background/30 px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/10"
              placeholder="Write something…"
              disabled={editSaving}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                disabled={editSaving}
                className="rounded-full border border-border/70 bg-background/30 px-5 py-2 text-xs font-semibold text-muted hover:text-foreground disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={editSaving || editText.trim().length === 0}
                className="rounded-full btn-accent px-6 py-2 text-xs font-bold text-background hover:opacity-90 disabled:opacity-60"
                onClick={() =>
                  void (async () => {
                    if (!onEdit) return;
                    const trimmed = editText.trim();
                    if (!trimmed) return;
                    setEditSaving(true);
                    try {
                      await onEdit(item.id, trimmed);
                      setEditOpen(false);
                    } catch {
                      // swallow; caller is expected to toast
                    } finally {
                      setEditSaving(false);
                    }
                  })()
                }
              >
                {editSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeDelete} />
          <div className="relative w-full max-w-md card-neon p-5">
            <div className="text-xs uppercase tracking-[0.25em] text-muted">Delete post</div>
            <h3 className="mt-1 font-display text-xl text-rose-300">Are you sure?</h3>
            <div className="mt-2 text-sm text-muted">This action can’t be undone.</div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDelete}
                disabled={deleteSaving}
                className="rounded-full border border-border/70 bg-background/30 px-5 py-2 text-xs font-semibold text-muted hover:text-foreground disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteSaving}
                className="rounded-full border border-rose-400/50 bg-rose-400/10 px-6 py-2 text-xs font-bold text-rose-200 hover:bg-rose-400/15 disabled:opacity-60"
                onClick={() =>
                  void (async () => {
                    if (!onDelete) return;
                    setDeleteSaving(true);
                    try {
                      await onDelete(item.id);
                      setDeleteOpen(false);
                    } catch {
                      // swallow; caller is expected to toast
                    } finally {
                      setDeleteSaving(false);
                    }
                  })()
                }
              >
                {deleteSaving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 space-y-3">
        <div className="text-sm leading-relaxed text-foreground break-words">
          {highlightHashtags(item.text)}
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border/70 bg-background/30 px-3 py-1 text-[11px] font-semibold text-muted"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {media.length > 0 && isVideoPost && (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/20">
            <video src={media[0]!.url} controls muted playsInline preload="metadata" className="h-72 w-full object-cover" />
          </div>
        )}

        {media.length > 0 && isImagePost && media.length === 1 && (
          <button
            type="button"
            className="block w-full overflow-hidden rounded-2xl border border-border/60 bg-background/20"
            onClick={() => openViewer(0)}
            aria-label="Open image"
          >
            <img src={media[0]!.url} alt="media" className="h-72 w-full object-cover" />
          </button>
        )}

        {media.length > 1 && isImagePost && (
          <div className="space-y-2">
            <div
              ref={carouselRef}
              onScroll={onCarouselScroll}
              className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-2xl border border-border/60 bg-background/20"
            >
              {media.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="shrink-0 w-full snap-center"
                  onClick={() => openViewer(idx)}
                  aria-label={`Open image ${idx + 1}`}
                >
                  <img src={m.url} alt="media" className="h-72 w-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-1">
              {media.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToMedia(idx)}
                  aria-label={`Go to image ${idx + 1}`}
                  className={
                    idx === activeMediaIdx
                      ? 'h-1.5 w-4 rounded-full bg-neon-blue/90'
                      : 'h-1.5 w-1.5 rounded-full bg-border/80'
                  }
                />
              ))}
            </div>
          </div>
        )}

        {item.fitness && (item.fitness.chips.length > 0 || item.fitness.line) && (
          <div className="rounded-2xl border border-border/60 bg-background/25 p-3">
            <div className="flex flex-wrap items-center gap-2">
              {item.fitness.chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-neon-blue/30 bg-background/20 px-3 py-1 text-[11px] font-semibold text-neon-blue"
                >
                  {c}
                </span>
              ))}
            </div>
            {item.fitness.line && <div className="mt-2 text-xs text-muted">{item.fitness.line}</div>}
          </div>
        )}
      </div>

      <footer className="mt-4 space-y-3">
        <PostActionBar
          liked={!!item.likedByMe}
          likeCount={item.stats.likes}
          commentCount={item.stats.replies}
          shareCount={item.stats.reposts}
          onLike={() => onToggleLike?.(item.id)}
          onComment={() => onComment?.(item.id)}
          onShare={() => onShare?.(item.id)}
        />

        <div className="text-xs text-muted">
          {item.stats.replies} replies · {item.stats.likes} likes · {item.stats.reposts} reposts
        </div>

        {(item.replyCount ?? 0) > 0 && (
          <div className="rounded-2xl border border-border/60 bg-background/20 p-3">
            <div className="space-y-2">
              {repliesToShow.map((r) => (
                <div key={r.id} className="flex items-start gap-2">
                  <Avatar src={r.authorPhotoURL ?? null} alt={r.authorName} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-semibold text-foreground truncate">{r.authorName}</div>
                      <div className="text-[11px] text-muted">{formatTimeFromNow(r.createdAt)}</div>
                    </div>
                    <div className="text-xs text-muted break-words">{highlightHashtags(r.text)}</div>
                  </div>
                </div>
              ))}
            </div>

            {(item.replyCount ?? 0) > repliesToShow.length && (
              <button
                type="button"
                onClick={() => setExpanded((s) => !s)}
                className="mt-3 text-xs font-semibold text-neon-blue hover:opacity-90"
              >
                {expanded ? 'Collapse replies' : `View ${item.replyCount} replies`}
              </button>
            )}
          </div>
        )}
      </footer>

      {viewerOpen && isImagePost && media.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={closeViewer} />
          <div className="relative w-full max-w-5xl">
            <div className="flex items-center justify-between gap-2 pb-3">
              <div className="text-xs font-semibold text-white/80">
                {viewerIdx + 1} / {media.length}
              </div>
              <button
                type="button"
                onClick={closeViewer}
                className="rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs font-semibold text-white hover:bg-black/55"
              >
                Close
              </button>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-black/40">
              <img src={media[viewerIdx]!.url} alt="media" className="max-h-[80vh] w-full object-contain" />

              {media.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrevViewer}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-xs font-semibold text-white hover:bg-black/55"
                    aria-label="Previous"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={goNextViewer}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-xs font-semibold text-white hover:bg-black/55"
                    aria-label="Next"
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
