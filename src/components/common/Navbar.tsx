import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from './ToastContext';
import { Avatar } from './Avatar';

type UserSearchItem = {
  uid: string;
  displayName: string;
  photoURL?: string;
  email?: string;
};

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState<UserSearchItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const trimmed = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(trimmed), 250);
    return () => window.clearTimeout(t);
  }, [trimmed]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!user) return;

      const q = debounced.trim();
      if (!q) {
        setResults([]);
        setSearchOpen(false);
        setSearchError(null);
        return;
      }

      setSearchLoading(true);
      setSearchError(null);
      try {
        if (!token) throw new Error('Unauthorized');

        const qs = new URLSearchParams();
        qs.set('q', q);
        qs.set('limit', '8');

        const res = await fetch(`/api/users/search?${qs.toString()}`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        const data = (await parseJsonSafe(res)) as any;
        if (!res.ok) {
          throw new Error(data?.error?.message ?? data?.message ?? 'Search failed');
        }

        const items = (Array.isArray(data?.items) ? data.items : []) as UserSearchItem[];
        if (cancelled) return;
        setResults(items);
        setSearchOpen(true);
      } catch (e: any) {
        if (cancelled) return;
        setResults([]);
        setSearchOpen(true);
        setSearchError(e?.message ?? 'Search failed');
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [debounced, token, user]);

  useEffect(() => {
    if (!token) {
      setResults([]);
      setSearchOpen(false);
      setSearchError(null);
      setSearchLoading(false);
    }
  }, [token]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const el = containerRef.current;
      if (!el) return;
      if (el.contains(e.target as any)) return;
      setSearchOpen(false);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        inputRef.current?.blur();
      }
    }

    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleNewPost = () => {
    addToast('New Post UI sẽ được nối logic ở bước tiếp theo.', { type: 'info' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-neon-green to-neon-blue text-xl font-display font-bold text-background shadow-neon">
            GB
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg tracking-wide text-neon-blue">
              GymBro
            </div>
          </div>
        </Link>

        <div ref={containerRef} className="relative hidden md:block flex-1 max-w-xl">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!searchOpen) setSearchOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const q = query.trim();
                setDebounced(q);
                setSearchOpen(!!q);
              }
            }}
            onFocus={() => {
              if (query.trim()) setSearchOpen(true);
            }}
            placeholder="Search exercises / users…"
            className="w-full rounded-full border border-border/70 bg-background/30 px-4 py-2 pr-11 text-sm text-foreground placeholder:text-muted outline-none focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/10"
          />

          <button
            type="button"
            aria-label="Search"
            onClick={() => {
              const q = query.trim();
              setDebounced(q);
              setSearchOpen(!!q);
              inputRef.current?.focus();
            }}
            disabled={!query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-border/70 bg-background/40 p-2 text-muted hover:text-foreground disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10.5 18.5C14.9183 18.5 18.5 14.9183 18.5 10.5C18.5 6.08172 14.9183 2.5 10.5 2.5C6.08172 2.5 2.5 6.08172 2.5 10.5C2.5 14.9183 6.08172 18.5 10.5 18.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21.5 21.5L17.2 17.2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {searchOpen && (searchLoading || searchError || results.length > 0 || debounced.trim()) && (
            <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-2xl border border-border/60 bg-background/90 backdrop-blur shadow-neon">
              {searchLoading && (
                <div className="px-4 py-3 text-sm text-muted">Searching…</div>
              )}
              {!searchLoading && searchError && (
                <div className="px-4 py-3 text-sm text-rose-300">{searchError}</div>
              )}
              {!searchLoading && !searchError && results.map((u) => (
                <button
                  key={u.uid}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery('');
                    setResults([]);
                    navigate(`/profile/${u.uid}`);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-background/60"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={u.photoURL ?? null} alt={u.displayName} size="sm" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{u.displayName}</div>
                      <div className="text-xs text-muted truncate">{u.email ?? ''}</div>
                    </div>
                  </div>
                </button>
              ))}
              {!searchLoading && !searchError && results.length === 0 && debounced.trim() && (
                <div className="px-4 py-3 text-sm text-muted">No users found.</div>
              )}
            </div>
          )}
        </div>

        <nav className="flex items-center gap-3 text-sm shrink-0">
          <button
            type="button"
            onClick={handleNewPost}
            className="hidden sm:inline-flex rounded-full btn-accent px-4 py-2 text-xs font-bold text-background shadow-neon hover:opacity-90"
          >
            New Post
          </button>
          <Link
            to={`/profile/${user.uid}`}
            className="rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-muted hover:border-neon-blue hover:text-neon-blue"
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-full bg-gradient-to-r from-neon-orange to-neon-blue px-3 py-1.5 text-xs font-semibold text-background shadow-neon hover:opacity-90"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
