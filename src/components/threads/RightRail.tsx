import { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../common/Avatar';

export function RightRail() {
  const { user } = useAuth();

  const name = useMemo(() => user?.displayName || user?.email || 'GymBro', [user]);

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-[76px] space-y-4">
        <section className="card-neon p-4">
          <div className="flex items-start gap-3">
            <Avatar src={user?.photoURL ?? null} alt={name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg text-neon-blue truncate">{name}</div>
              <div className="mt-1 text-xs text-muted">@{user?.email ?? ''}</div>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
