import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

export type NotificationType = 'like' | 'comment' | 'follow' | 'repost' | 'post';
export type NotificationEntityType = 'user' | 'thread';

export type NotificationItem = {
  groupKey?: string;
  groupCount?: number;
  id: string;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
  text: string;
  createdAt: string;
  readAt: string | null;
  actor: {
    uid: string;
    displayName: string;
    photoURL?: string | null;
  };
};

type NotificationsResponse = {
  items: NotificationItem[];
  unreadCount: number;
  page: number;
  limit: number;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const useNotifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const authHeader = useMemo(() => {
    return token ? { authorization: `Bearer ${token}` } : undefined;
  }, [token]);

  // Lấy danh sách thông báo
  const fetchNotifications = useCallback(
    async (page = 1) => {
      if (!token) return;

      setIsLoading(true);
      try {
        const qs = new URLSearchParams();
        qs.set('page', String(page));
        qs.set('limit', '10');

        const res = await fetch(`/api/notifications/me?${qs.toString()}`, {
          headers: authHeader,
        });

        const data = (await parseJsonSafe(res)) as NotificationsResponse | any;
        if (!res.ok) {
          const message = data?.error?.message ?? data?.message ?? 'Failed to load notifications';
          throw new Error(message);
        }

        const items = Array.isArray(data?.items) ? (data.items as NotificationItem[]) : [];
        const nextUnread = Number(data?.unreadCount ?? 0);

        setUnreadCount(Number.isFinite(nextUnread) ? nextUnread : 0);
        setNotifications((prev) => {
          const keyOf = (n: NotificationItem) => n.groupKey ?? n.id;

          if (page === 1) {
            const seen = new Set<string>();
            const out: NotificationItem[] = [];
            for (const n of items) {
              const k = keyOf(n);
              if (seen.has(k)) continue;
              seen.add(k);
              out.push(n);
            }
            return out;
          }

          const mergedMap = new Map<string, NotificationItem>();
          for (const n of prev) mergedMap.set(keyOf(n), n);
          for (const n of items) {
            const k = keyOf(n);
            const existing = mergedMap.get(k);
            if (!existing) {
              mergedMap.set(k, n);
              continue;
            }
            // Prefer latest representative for grouped notifications
            const a = new Date(existing.createdAt).getTime();
            const b = new Date(n.createdAt).getTime();
            mergedMap.set(k, b >= a ? { ...existing, ...n } : existing);
          }

          const merged = Array.from(mergedMap.values());
          merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return merged;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [authHeader, token]
  );

  // Khởi tạo Socket.IO
  useEffect(() => {
    if (!token) return;

    const newSocket = io(API_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });

    newSocket.on('new-notification', () => {
      void fetchNotifications(1);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    socketRef.current = newSocket;

    return () => {
      newSocket.disconnect();
    };
  }, [fetchNotifications, token]);

  // Đánh dấu một thông báo là đã đọc
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!token) return;

      const res = await fetch(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {
        method: 'POST',
        headers: authHeader,
      });

      const data = (await parseJsonSafe(res)) as any;
      if (!res.ok) {
        const message = data?.error?.message ?? data?.message ?? 'Failed to mark notification as read';
        throw new Error(message);
      }

      const nextReadAt = data?.readAt ? String(data.readAt) : new Date().toISOString();
      setNotifications((prev) => {
        const keyOf = (n: NotificationItem) => n.groupKey ?? n.id;
        const target = prev.find((n) => n.id === notificationId);
        const targetKey = target ? keyOf(target) : notificationId;
        return prev.map((n) =>
          keyOf(n) === targetKey ? { ...n, readAt: n.readAt ?? nextReadAt } : n
        );
      });
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [authHeader, token]
  );

  // Đánh dấu tất cả thông báo là đã đọc
  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    const res = await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: authHeader,
    });

    const data = (await parseJsonSafe(res)) as any;
    if (!res.ok) {
      const message = data?.error?.message ?? data?.message ?? 'Failed to mark all as read';
      throw new Error(message);
    }

    const nowIso = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? nowIso })));
    setUnreadCount(0);
  }, [authHeader, token]);

  // Xóa một thông báo
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!token) return;

      const keyOf = (n: NotificationItem) => n.groupKey ?? n.id;
      const existing = notifications.find((n) => n.id === notificationId);
      const existingKey = existing ? keyOf(existing) : notificationId;
      const res = await fetch(`/api/notifications/${encodeURIComponent(notificationId)}`, {
        method: 'DELETE',
        headers: authHeader,
      });

      const data = (await parseJsonSafe(res)) as any;
      if (!res.ok) {
        const message = data?.error?.message ?? data?.message ?? 'Failed to delete notification';
        throw new Error(message);
      }

      setNotifications((prev) => prev.filter((n) => keyOf(n) !== existingKey));
      if (existing && !existing.readAt) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    },
    [authHeader, notifications, token]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    socket: socketRef.current,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};