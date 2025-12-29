import { Link } from 'react-router-dom';

export default function GymHeader({
  onToggle,
  active,
}: {
  onToggle: () => void;
  active: 'feed' | 'profile';
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-neon-green to-neon-blue text-xl font-display font-bold text-background shadow-neon">
            GB
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg tracking-wide text-neon-blue">GymBro</div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Lift · Track · Connect</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={onToggle}
          className="rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold text-muted hover:border-neon-blue hover:text-neon-blue"
        >
          {active === 'feed' ? 'Profile' : 'Feed'}
        </button>
      </div>
    </header>
  );
}
