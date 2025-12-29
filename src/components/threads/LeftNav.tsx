import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useEffect } from 'react';

type NavItem = {
  label: string;
  to: string;
};

const navItems: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Messages', to: '/messages' },
  { label: 'Notifications', to: '/notifications' },
];

export function LeftNav() {
  const location = useLocation();
  const { unreadCount, fetchNotifications } = useNotifications();

  useEffect(() => {
    // Lấy số thông báo chưa đọc khi component mount
    fetchNotifications();
  }, []);

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[76px] space-y-4">
        <div className="card-neon p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-muted">Navigation</div>
          <nav className="mt-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              const showBadge = item.to === '/notifications' && unreadCount > 0;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    active
                      ? 'rounded-xl border border-neon-blue/40 bg-background/40 px-3 py-2 text-sm font-semibold text-neon-blue'
                      : 'rounded-xl border border-transparent px-3 py-2 text-sm text-muted hover:border-border/70 hover:bg-background/30 hover:text-foreground'
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{item.label}</span>
                    {showBadge && (
                      <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}