import { useState } from 'react';
import { Activity, Eye, EyeOff } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (username === 'admin' && password === '1234') {
      setLoading(true);
      setTimeout(() => onLogin(), 600);
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'var(--primary)' }}
          >
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)', fontFamily: 'Vazirmatn, sans-serif' }}>
            مرکز سنجش آمادگی جسمانی
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)', fontFamily: 'Vazirmatn, sans-serif' }}>
            پنل مدیریت مسئول مرکز
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 shadow-lg"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--foreground)', fontFamily: 'Vazirmatn, sans-serif' }}>
            ورود به سیستم
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm mb-1.5"
                style={{ color: 'var(--muted-foreground)', fontFamily: 'Vazirmatn, sans-serif' }}
              >
                نام کاربری
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="نام کاربری را وارد کنید"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--input-background)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontFamily: 'Vazirmatn, sans-serif',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            <div>
              <label
                className="block text-sm mb-1.5"
                style={{ color: 'var(--muted-foreground)', fontFamily: 'Vazirmatn, sans-serif' }}
              >
                رمز عبور
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="رمز عبور را وارد کنید"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--input-background)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    fontFamily: 'Vazirmatn, sans-serif',
                    paddingLeft: '2.5rem',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="text-sm px-3 py-2 rounded-lg"
                style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', fontFamily: 'Vazirmatn, sans-serif', border: '1px solid rgba(220,38,38,0.2)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{
                background: 'var(--primary)',
                color: '#fff',
                fontFamily: 'Vazirmatn, sans-serif',
              }}
            >
              {loading ? 'در حال ورود...' : 'ورود به پنل'}
            </button>
          </form>

          <div
            className="mt-4 text-xs text-center"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'Vazirmatn, sans-serif' }}
          >
            نام کاربری: <span className="font-mono">admin</span> — رمز: <span className="font-mono">1234</span>
          </div>
        </div>
      </div>
    </div>
  );
}
