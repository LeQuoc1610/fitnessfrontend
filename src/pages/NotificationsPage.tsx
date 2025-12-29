import React, { useEffect, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchNotifications(page);
  }, [fetchNotifications, page]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👥';
      case 'repost':
        return '🔁';
      case 'post':
        return '📝';
      default:
        return '🔔';
    }
  };

  const getNotificationLink = (notification: any) => {
    if (notification.entityType === 'thread') {
      return '/';
    }
    return `/profile/${notification.actor.uid}`;
  };

  const getNotificationState = (notification: any) => {
    if (notification.entityType !== 'thread') return undefined;
    if (notification.type === 'comment') {
      return { openCommentsThreadId: notification.entityId };
    }
    if (notification.type === 'like') {
      return { focusThreadId: notification.entityId };
    }
    return { focusThreadId: notification.entityId };
  };

  const handleMarkAsRead = (notifId: string) => {
    markAsRead(notifId);
  };

  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    if (!notification.readAt) {
      handleMarkAsRead(notification.id);
    }
    navigate(getNotificationLink(notification), { state: getNotificationState(notification) });
  };

  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between gap-4 mb-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wide text-neon-blue">
            Notifications
          </h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs px-3 py-1.5 rounded-lg border border-neon-blue/40 bg-background/40 text-neon-blue hover:border-neon-blue/60 hover:bg-background/60 transition-all font-semibold"
          >
            Mark all as read
          </button>
        )}
      </header>

      {unreadCount > 0 && (
        <div className="card-neon p-3 border-l-4 border-neon-blue/60">
          <p className="text-sm text-neon-blue font-semibold">
            You have {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </p>
        </div>
      )}

      {isLoading && notifications.length === 0 && (
        <div className="flex justify-center py-12">
          <p className="text-muted">Loading notifications...</p>
        </div>
      )}

      {notifications.length === 0 && !isLoading && (
        <div className="card-neon p-8 flex flex-col items-center text-center">
          <div className="text-4xl mb-2">🔔</div>
          <p className="text-muted">No notifications yet</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((notification) => (
          <div
            key={(notification as any).groupKey ?? notification.id}
            className={`card-neon transition-all border-l-4 ${
              notification.readAt
                ? 'border-border/40'
                : 'border-neon-blue/60 bg-background/40'
            }`}
          >
            <div
              className="flex items-start gap-3 p-4 group"
              onClick={() => handleNotificationClick(notification)}
            >
              {/* Avatar */}
              <img
                src={notification.actor.photoURL || '/default-avatar.png'}
                alt={notification.actor.displayName}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0 group-hover:ring-2 ring-neon-blue/40 transition-all"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">
                      <Link
                        to={`/profile/${notification.actor.uid}`}
                        className="font-semibold text-neon-blue hover:text-neon-blue/80 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {notification.actor.displayName}
                      </Link>{' '}
                      <span className="text-foreground">{notification.text}</span>
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Unread indicator & Delete button */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!notification.readAt && (
                  <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="p-1.5 hover:bg-background/60 rounded transition-colors"
                  title="Delete notification"
                >
                  <Trash2 size={16} className="text-muted hover:text-foreground transition-colors" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {notifications.length > 0 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-border/40 text-muted hover:border-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-muted">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm rounded-lg border border-border/40 text-muted hover:border-border hover:text-foreground transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}