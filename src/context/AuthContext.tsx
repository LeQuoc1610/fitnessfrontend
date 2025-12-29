import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Lightweight fake auth user to decouple from Firebase.
// Later you can replace this with data returned from your MongoDB backend.
export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'gymbro_token';
const USER_KEY = 'gymbro_user';
const LEGACY_THREADS_KEY = 'gymbro_threads_v1';

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      window.localStorage.removeItem(LEGACY_THREADS_KEY);
      const storedToken = window.localStorage.getItem(TOKEN_KEY);
      setToken(storedToken);

      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              authorization: `Bearer ${storedToken}`,
            },
          });

          if (!res.ok) {
            throw new Error('Unauthorized');
          }

          const me = (await res.json()) as AuthUser;
          if (cancelled) return;
          setUser(me);
          window.localStorage.setItem(USER_KEY, JSON.stringify(me));
        } catch {
          window.localStorage.removeItem(TOKEN_KEY);
          window.localStorage.removeItem(USER_KEY);
          window.localStorage.removeItem(LEGACY_THREADS_KEY);
          if (cancelled) return;
          setToken(null);
          setUser(null);
        } finally {
          if (!cancelled) setLoading(false);
        }

        return;
      }

      const raw = window.localStorage.getItem(USER_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as AuthUser;
          if (!cancelled) setUser(parsed);
        } catch {
          window.localStorage.removeItem(USER_KEY);
        }
      }

      if (!cancelled) setLoading(false);
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = (await parseJsonSafe(res)) as any;

    if (!res.ok) {
      const message = data?.error?.message ?? data?.message ?? 'Login failed';
      throw new Error(message);
    }

    const nextToken = String(data?.token ?? '');
    const nextUser = data?.user as AuthUser | undefined;
    if (!nextToken || !nextUser) {
      throw new Error('Invalid login response');
    }

    setToken(nextToken);
    setUser(nextUser);
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const refreshMe = async () => {
    if (!token) return;

    const res = await fetch('/api/auth/me', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const data = (await parseJsonSafe(res)) as any;
    if (!res.ok) {
      const message = data?.error?.message ?? data?.message ?? 'Unauthorized';
      throw new Error(message);
    }

    const me = data as AuthUser;
    setUser(me);
    window.localStorage.setItem(USER_KEY, JSON.stringify(me));
  };

  const register = async (email: string, password: string, displayName: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email, password, displayName }),
    });

    const data = (await parseJsonSafe(res)) as any;

    if (!res.ok) {
      const message = data?.error?.message ?? data?.message ?? 'Register failed';
      throw new Error(message);
    }

    const nextToken = String(data?.token ?? '');
    const nextUser = data?.user as AuthUser | undefined;
    if (!nextToken || !nextUser) {
      throw new Error('Invalid register response');
    }

    setToken(nextToken);
    setUser(nextUser);
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(LEGACY_THREADS_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, refreshMe, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
