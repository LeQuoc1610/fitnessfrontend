import { FormEvent, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function RegisterForm() {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, password, displayName);
      // Clear inputs after successful registration
      setDisplayName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message ?? 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="font-display text-lg text-neon-green">Đăng ký</h2>
      <div className="space-y-2 text-sm">
        <div className="space-y-1">
          <label className="block text-xs text-muted">Tên hiển thị</label>
          <input
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs outline-none focus:border-neon-green"
            placeholder="BigBro, StrongGirl..."
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-muted">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs outline-none focus:border-neon-green"
            placeholder="you@gymbro.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-muted">Mật khẩu</label>
          <input
            type="password"
            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs outline-none focus:border-neon-green"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-neon-orange to-neon-blue px-3 py-2 text-xs font-semibold text-background shadow-neon hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Registering...' : 'Tạo tài khoản mới'}
      </button>
    </form>
  );
}
