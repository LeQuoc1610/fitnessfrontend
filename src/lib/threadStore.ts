export type StoredReply = {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhotoURL?: string | null;
  text: string;
  createdAt: number;
};

export type StoredThread = {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhotoURL?: string | null;
  authorLabel?: 'YOU' | 'Verified' | null;
  createdAt: number;
  text: string;
  tags: string[];
  media: { type: 'image' | 'video'; url: string }[];
  likeCount: number;
  replyCount: number;
  repostCount: number;
  likedBy: string[];
  replies: StoredReply[];
  fitness?: {
    chips: string[];
    line?: string;
    pr?: boolean;
  };
};

const STORAGE_KEY = 'gymbro_threads_v1';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readAll(): StoredThread[] {
  const parsed = safeParse<StoredThread[]>(window.localStorage.getItem(STORAGE_KEY));
  if (!parsed) return [];
  return parsed;
}

function writeAll(items: StoredThread[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function uid() {
  return String(Date.now()) + '_' + Math.random().toString(36).slice(2, 10);
}

function extractTags(text: string): string[] {
  const tags: string[] = [];
  const re = /#([A-Za-z0-9_]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const t = m[1];
    if (t && !tags.includes(t)) tags.push(t);
  }
  return tags;
}

export function ensureThreadSeed() {
  const existing = readAll();
  if (existing.length > 0) return;

  const now = Date.now();
  const seed: StoredThread[] = [
    {
      id: uid(),
      authorUid: 'coach-minh',
      authorName: 'Coach Minh',
      authorLabel: 'Verified',
      createdAt: now - 1000 * 60 * 9,
      text: 'Tối nay ai #squat thì nhớ brace kỹ. Đừng chase PR khi warm-up còn chưa ổn. #technique',
      tags: ['squat', 'technique'],
      media: [],
      likeCount: 56,
      replyCount: 1,
      repostCount: 2,
      likedBy: [],
      replies: [
        {
          id: uid(),
          authorUid: 'linh-fit',
          authorName: 'Linh Fit',
          text: 'Brace drill nào dễ áp dụng nhất anh?',
          createdAt: now - 1000 * 60 * 6,
        },
      ],
      fitness: {
        chips: ['Squat cues', 'Brace'],
        line: 'Reminder: inhale + brace before descent',
      },
    },
    {
      id: uid(),
      authorUid: 'minh-power',
      authorName: 'Minh Power',
      authorLabel: 'Verified',
      createdAt: now - 1000 * 60 * 22,
      text: 'Hôm nay #squat lên 120kg x 5. Cảm giác bar speed ngon. #PR',
      tags: ['squat', 'PR'],
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=60',
        },
      ],
      likeCount: 124,
      replyCount: 2,
      repostCount: 7,
      likedBy: [],
      replies: [
        {
          id: uid(),
          authorUid: 'quang-pr',
          authorName: 'Quang PR',
          text: 'Quá đỉnh. Tuần sau lên 122.5 đi bro #PR',
          createdAt: now - 1000 * 60 * 14,
        },
        {
          id: uid(),
          authorUid: 'linh-fit',
          authorName: 'Linh Fit',
          text: 'Bar path chuẩn quá, share clip đi!',
          createdAt: now - 1000 * 60 * 10,
        },
      ],
      fitness: {
        chips: ['Squat • 120kg x 5', 'RPE 8'],
        line: 'Auto-detected: Squat 120kg x 5 · RPE 8',
        pr: true,
      },
    },
    {
      id: uid(),
      authorUid: 'linh-fit',
      authorName: 'Linh Fit',
      createdAt: now - 1000 * 60 * 48,
      text: 'AMRAP set #bench hôm nay: 70kg x 12. Pump căng. #hypertrophy',
      tags: ['bench', 'hypertrophy'],
      media: [],
      likeCount: 88,
      replyCount: 1,
      repostCount: 3,
      likedBy: [],
      replies: [
        {
          id: uid(),
          authorUid: 'coach-minh',
          authorName: 'Coach Minh',
          text: 'Nice. Giữ ROM full và pause 1s ở ngực sẽ lên nhanh.',
          createdAt: now - 1000 * 60 * 30,
        },
      ],
      fitness: {
        chips: ['Bench • 70kg x 12', 'Tempo 2-0-2'],
        line: 'Notes: focus on scapular retraction',
      },
    },
  ];

  const more: StoredThread[] = Array.from({ length: 24 }).map((_, i) => {
    const createdAt = now - 1000 * 60 * (70 + i * 25);
    const variants = [
      { text: 'Pull day done. Lat pump rất ổn. #pull #back', tags: ['pull', 'back'] },
      { text: 'Deadlift singles nhẹ để tập form. #deadlift #technique', tags: ['deadlift', 'technique'] },
      { text: 'Leg day: volume squat + hamstrings. #legday #squat', tags: ['legday', 'squat'] },
      { text: 'Cardio 20 phút zone2. Giữ đều nhịp. #cardio #zone2', tags: ['cardio', 'zone2'] },
      { text: 'Overhead press lên được 50kg x 5. #OHP #PR', tags: ['OHP', 'PR'] },
    ];
    const v = variants[i % variants.length];

    return {
      id: uid(),
      authorUid: 'seed-user-' + (i % 5),
      authorName: ['Quang PR', 'Thanh Bulk', 'Huy Cut', 'An Gym', 'Mai Fit'][i % 5],
      createdAt,
      text: v.text,
      tags: v.tags,
      media: [],
      likeCount: Math.floor(10 + Math.random() * 90),
      replyCount: Math.floor(Math.random() * 6),
      repostCount: Math.floor(Math.random() * 4),
      likedBy: [],
      replies: [],
    };
  });

  writeAll([...seed, ...more].sort((a, b) => b.createdAt - a.createdAt));
}

export function listThreads({
  cursor,
  limit,
}: {
  cursor?: number;
  limit: number;
}): { items: StoredThread[]; nextCursor: number | null } {
  const all = readAll().sort((a, b) => b.createdAt - a.createdAt);
  const filtered = typeof cursor === 'number' ? all.filter((t) => t.createdAt < cursor) : all;
  const page = filtered.slice(0, limit);
  const nextCursor = page.length === limit ? page[page.length - 1]!.createdAt : null;
  return { items: page, nextCursor };
}

export function createThread({
  authorUid,
  authorName,
  authorPhotoURL,
  text,
}: {
  authorUid: string;
  authorName: string;
  authorPhotoURL?: string | null;
  text: string;
}): StoredThread {
  const trimmed = text.trim();
  const t: StoredThread = {
    id: uid(),
    authorUid,
    authorName,
    authorPhotoURL: authorPhotoURL ?? null,
    authorLabel: 'YOU',
    createdAt: Date.now(),
    text: trimmed,
    tags: extractTags(trimmed),
    media: [],
    likeCount: 0,
    replyCount: 0,
    repostCount: 0,
    likedBy: [],
    replies: [],
  };

  const all = readAll();
  writeAll([t, ...all].sort((a, b) => b.createdAt - a.createdAt));
  return t;
}

export function toggleLike({
  threadId,
  userId,
}: {
  threadId: string;
  userId: string;
}): StoredThread | null {
  const all = readAll();
  const idx = all.findIndex((t) => t.id === threadId);
  if (idx < 0) return null;

  const t = all[idx]!;
  const liked = t.likedBy.includes(userId);
  const likedBy = liked ? t.likedBy.filter((x) => x !== userId) : [...t.likedBy, userId];
  const next: StoredThread = {
    ...t,
    likedBy,
    likeCount: liked ? Math.max(0, t.likeCount - 1) : t.likeCount + 1,
  };

  const updated = [...all.slice(0, idx), next, ...all.slice(idx + 1)];
  writeAll(updated.sort((a, b) => b.createdAt - a.createdAt));
  return next;
}
