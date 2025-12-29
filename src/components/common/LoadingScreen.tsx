import { LoadingSpinner } from './LoadingSpinner';

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center gym-gradient">
      <div className="card-neon flex flex-col items-center gap-3 px-8 py-6">
        <LoadingSpinner />
        <p className="font-display text-sm tracking-[0.2em] text-muted uppercase">
          Loading your gains...
        </p>
      </div>
    </div>
  );
}
