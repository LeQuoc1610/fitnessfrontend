import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

type FollowStats = {
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
};

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function useFollow(targetUid: string) {
  const { token, user } = useAuth();
  const isSelf = !!user?.uid && String(user.uid) === String(targetUid);

  const [stats, setStats] = useState<FollowStats>({ followerCount: 0, followingCount: 0, isFollowing: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token || !targetUid) {
      setStats({ followerCount: 0, followingCount: 0, isFollowing: false });
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/follows/${targetUid}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = (await parseJsonSafe(res)) as any;
      if (!res.ok) {
        throw new Error(data?.error?.message ?? data?.message ?? 'Failed to load follow stats');
      }

      setStats({
        followerCount: Number(data?.followerCount ?? 0),
        followingCount: Number(data?.followingCount ?? 0),
        isFollowing: !!data?.isFollowing,
      });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load follow stats');
    } finally {
      setLoading(false);
    }
  }, [targetUid, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const follow = useCallback(async () => {
    if (!token) throw new Error('Unauthorized');
    if (!targetUid) throw new Error('Invalid user');
    if (isSelf) throw new Error('Cannot follow yourself');

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/follows/${targetUid}`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = (await parseJsonSafe(res)) as any;
      if (!res.ok) {
        throw new Error(data?.error?.message ?? data?.message ?? 'Failed to follow');
      }

      const followerCount = Number(data?.followerCount);
      const followingCount = Number(data?.followingCount);

      setStats((prev) => ({
        ...prev,
        isFollowing: true,
        followerCount: Number.isFinite(followerCount)
          ? followerCount
          : prev.isFollowing
            ? prev.followerCount
            : prev.followerCount + 1,
        followingCount: Number.isFinite(followingCount) ? followingCount : prev.followingCount,
      }));
    } finally {
      setLoading(false);
    }
  }, [isSelf, targetUid, token]);

  const unfollow = useCallback(async () => {
    if (!token) throw new Error('Unauthorized');
    if (!targetUid) throw new Error('Invalid user');
    if (isSelf) throw new Error('Cannot unfollow yourself');

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/follows/${targetUid}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = (await parseJsonSafe(res)) as any;
      if (!res.ok) {
        throw new Error(data?.error?.message ?? data?.message ?? 'Failed to unfollow');
      }

      const followerCount = Number(data?.followerCount);
      const followingCount = Number(data?.followingCount);

      setStats((prev) => ({
        ...prev,
        isFollowing: false,
        followerCount: Number.isFinite(followerCount)
          ? followerCount
          : prev.isFollowing
            ? Math.max(0, prev.followerCount - 1)
            : prev.followerCount,
        followingCount: Number.isFinite(followingCount) ? followingCount : prev.followingCount,
      }));
    } finally {
      setLoading(false);
    }
  }, [isSelf, targetUid, token]);

  const toggle = useCallback(async () => {
    if (stats.isFollowing) {
      await unfollow();
    } else {
      await follow();
    }
  }, [follow, stats.isFollowing, unfollow]);

  return {
    stats,
    loading,
    error,
    isSelf,
    refresh,
    follow,
    unfollow,
    toggle,
  };
}
