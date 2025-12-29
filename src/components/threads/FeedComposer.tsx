import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Tooltip } from 'antd';
import {
  PictureOutlined,
  TrophyOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../common/ToastContext';

type ComposerTemplate = {
  label: string;
  value: string;
};

const templates: ComposerTemplate[] = [
  { label: 'PR check-in', value: 'PR check-in: ' },
];

const templateIconByLabel: Record<string, ReactNode> = {
  'PR check-in': <TrophyOutlined />,
};

export function FeedComposer({
  onPost,
}: {
  onPost: (text: string, files: File[]) => void | Promise<void>;
}) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [text, setText] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const canPost = text.trim().length > 0 || mediaFiles.length > 0;

  const displayName = useMemo(() => user?.displayName || user?.email || 'GymBro', [user]);

  const ALLOWED_IMAGE_MIME = useMemo(() => new Set(['image/jpeg', 'image/png', 'image/webp']), []);
  const ALLOWED_VIDEO_MIME = useMemo(() => new Set(['video/mp4', 'video/quicktime']), []);
  const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
  const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

  useEffect(() => {
    const urls = mediaFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => {
      for (const u of urls) {
        try {
          URL.revokeObjectURL(u);
        } catch {
          // ignore
        }
      }
    };
  }, [mediaFiles]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    setMediaFiles((prev) => {
      const next = [...prev];
      const prevHasVideo = next.some((x) => ALLOWED_VIDEO_MIME.has(x.type));
      const prevHasImage = next.some((x) => ALLOWED_IMAGE_MIME.has(x.type));
      for (const f of incoming) {
        const isImage = ALLOWED_IMAGE_MIME.has(f.type);
        const isVideo = ALLOWED_VIDEO_MIME.has(f.type);

        if (!isImage && !isVideo) {
          addToast('Sai định dạng. Chỉ hỗ trợ JPG/PNG/WEBP hoặc MP4/MOV.', { type: 'error' });
          continue;
        }

        if (isImage && f.size > MAX_IMAGE_BYTES) {
          addToast('Ảnh quá lớn (tối đa 10MB).', { type: 'error' });
          continue;
        }
        if (isVideo && f.size > MAX_VIDEO_BYTES) {
          addToast('Video quá lớn (tối đa 100MB).', { type: 'error' });
          continue;
        }

        if (isVideo) {
          if (prevHasImage || next.some((x) => ALLOWED_IMAGE_MIME.has(x.type))) {
            addToast('Mỗi bài chỉ được nhiều ảnh hoặc 1 video.', { type: 'error' });
            continue;
          }
          if (prevHasVideo || next.some((x) => ALLOWED_VIDEO_MIME.has(x.type))) {
            addToast('Mỗi bài chỉ được 1 video.', { type: 'error' });
            continue;
          }
        }

        if (isImage) {
          if (prevHasVideo || next.some((x) => ALLOWED_VIDEO_MIME.has(x.type))) {
            addToast('Mỗi bài chỉ được nhiều ảnh hoặc 1 video.', { type: 'error' });
            continue;
          }
          if (next.length >= 6) {
            addToast('Tối đa 6 ảnh mỗi bài.', { type: 'error' });
            break;
          }
        }

        const exists = next.some((x) => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified);
        if (!exists) next.push(f);
      }
      return next;
    });
  };

  const clear = () => {
    if (posting) return;
    setText('');
    setMediaFiles([]);
    if (photoInputRef.current) photoInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return (
    <section className="card-neon p-4 md:p-5">
      <div className="flex items-start gap-3">
        <Avatar src={user?.photoURL ?? null} alt={displayName} size="md" />
        <div className="min-w-0 flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Hôm nay PR gì? chia sẻ 1 chút…"
            className="w-full resize-none rounded-2xl border border-border/70 bg-background/30 px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/10"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Tooltip title="Photo">
              <Button
                aria-label="Photo"
                htmlType="button"
                size="small"
                shape="circle"
                icon={<PictureOutlined />}
                onClick={() => photoInputRef.current?.click()}
                className="border-border/70 bg-background/30 text-muted hover:!border-neon-blue/50 hover:!text-neon-blue"
              />
            </Tooltip>

            <Tooltip title="Video">
              <Button
                aria-label="Video"
                htmlType="button"
                size="small"
                shape="circle"
                icon={<VideoCameraOutlined />}
                onClick={() => videoInputRef.current?.click()}
                className="border-border/70 bg-background/30 text-muted hover:!border-neon-blue/50 hover:!text-neon-blue"
              />
            </Tooltip>

            <div className="ml-auto flex items-center gap-2">
              <Button
                htmlType="button"
                size="small"
                shape="round"
                className="border-border/70 bg-background/30 text-xs font-semibold text-muted hover:!border-border/90 hover:!text-foreground"
                onClick={clear}
                disabled={posting}
              >
                Clear
              </Button>
              <Button
                htmlType="button"
                size="small"
                shape="round"
                disabled={!canPost || posting}
                onClick={() => {
                  if (!canPost || posting) return;
                  void (async () => {
                    setPosting(true);
                    try {
                      const trimmed = text.trim();
                      if (!trimmed && mediaFiles.length === 0) {
                        addToast('Bài viết không được trống.', { type: 'error' });
                        return;
                      }
                      await onPost(trimmed, mediaFiles);
                      clear();
                    } finally {
                      setPosting(false);
                    }
                  })();
                }}
                className={
                  canPost
                    ? 'btn-accent text-xs font-bold !text-background hover:opacity-90'
                    : 'border-border/60 bg-background/30 text-xs font-bold text-muted opacity-60 cursor-not-allowed'
                }
              >
                {posting ? 'Posting…' : 'Post'}
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {templates.map((t) => (
              <Tooltip key={t.label} title={t.label}>
                <Button
                  aria-label={t.label}
                  htmlType="button"
                  size="small"
                  shape="circle"
                  icon={templateIconByLabel[t.label] ?? <TrophyOutlined />}
                  className="border-border/70 bg-card text-muted hover:!border-neon-blue/40 hover:!text-neon-blue"
                  onClick={() => setText((prev) => (prev.trim().length ? prev : t.value))}
                />
              </Tooltip>
            ))}
          </div>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple={false}
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />

          {mediaFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                {mediaFiles.map((f, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="rounded-full border border-border/70 bg-background/30 px-3 py-1 text-[11px] font-semibold text-muted hover:text-foreground disabled:opacity-60"
                    disabled={posting}
                    onClick={() => setMediaFiles((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label="Remove media"
                  >
                    {ALLOWED_VIDEO_MIME.has(f.type) ? 'Video' : 'Photo'}: {f.name}
                  </button>
                ))}
              </div>

              {previewUrls.length > 0 && ALLOWED_VIDEO_MIME.has(mediaFiles[0]!.type) ? (
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/20">
                  <video
                    src={previewUrls[0]}
                    controls
                    muted
                    playsInline
                    className="h-64 w-full object-cover"
                  />
                </div>
              ) : previewUrls.length > 0 ? (
                <div className={previewUrls.length > 1 ? 'grid grid-cols-2 gap-2' : ''}>
                  {previewUrls.map((u, idx) => (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-2xl border border-border/60 bg-background/20"
                    >
                      <img src={u} alt="preview" className="h-40 w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
