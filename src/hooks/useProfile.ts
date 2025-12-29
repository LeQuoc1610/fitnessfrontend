import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import type { UserProfile } from '../types';

interface UseProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isCurrentUser: boolean;
  refresh: () => void;
}

// Tạm thời: dùng dữ liệu từ AuthContext, không gọi backend.
// Khi có API MongoDB, bạn có thể thay phần body useEffect bằng fetch(`/profiles/${uid}`).
export function useProfile(uid: string): UseProfileResult {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/profiles/${encodeURIComponent(uid)}`, {
          headers: token
            ? {
                authorization: `Bearer ${token}`,
              }
            : undefined,
        });

        const data = (await res.json().catch(() => null)) as any;
        if (!res.ok) {
          const message = data?.error?.message ?? data?.message ?? 'Failed to load profile';
          throw new Error(message);
        }

        if (!cancelled) {
          setProfile(data as UserProfile);
        }
      } catch (e: any) {
        if (!cancelled) {
          setProfile(null);
          setError(e?.message ?? 'Failed to load profile');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [token, uid, refreshNonce]);

  const refresh = () => {
    setRefreshNonce((n) => n + 1);
  };

  return {
    profile,
    loading,
    error,
    isCurrentUser: !!user && user.uid === uid,
    refresh,
  };
}
