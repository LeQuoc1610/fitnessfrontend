import { useProfile } from '../../hooks/useProfile';
import { Avatar } from '../common/Avatar';

interface ProfileHeaderProps {
  uid: string;
}

export function ProfileHeader({ uid }: ProfileHeaderProps) {
  const { profile, isCurrentUser, loading } = useProfile(uid);

  if (loading) {
    return (
      <div className="card-neon p-4 animate-pulse h-28" />
    );
  }

  if (!profile) {
    return <div className="text-sm text-red-400">User profile not found.</div>;
  }

  return (
    <section className="card-neon flex items-center gap-4 p-4 md:p-6">
      <Avatar src={profile.photoURL} alt={profile.displayName} size="lg" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-xl md:text-2xl text-neon-blue">
            {profile.displayName}
          </h1>
          {isCurrentUser && (
            <span className="rounded-full border border-neon-green/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-neon-green">
              You
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted break-words max-w-xl">
          {profile.bio || 'No bio yet. Tell the world about your training style.'}
        </p>
      </div>
    </section>
  );
}
