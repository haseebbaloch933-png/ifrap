'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

const showDemoAccounts = process.env.NODE_ENV !== 'production';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid email or password');
      setIsLoading(false);
    } else {
      router.push('/telemetry');
      router.refresh();
    }
  };

  const hasError = Boolean(error);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-100">IFRAP Portal Login</h1>
            <p className="text-sm text-slate-400 mt-2">Sign in to access the AnthropoGIS M&E Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && (
              <div
                id="login-error"
                role="alert"
                className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                aria-required="true"
                autoComplete="email"
                aria-invalid={hasError}
                aria-describedby={hasError ? 'login-error' : undefined}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="enumerator@ifrap.gov.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  aria-required="true"
                  autoComplete="current-password"
                  aria-invalid={hasError}
                  aria-describedby={hasError ? 'login-error' : undefined}
                  className="w-full px-4 py-2.5 pr-11 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 focus:outline-none focus-visible:text-emerald-400 focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-r-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 text-center">
            {showDemoAccounts ? (
              <>
                <p>Demo Accounts:</p>
                <ul className="mt-2 space-y-1">
                  <li>enumerator@ifrap.gov.pk (pw: demo123)</li>
                  <li>piu@ifrap.gov.pk (pw: demo123)</li>
                  <li>director@ifrap.gov.pk (pw: demo123)</li>
                </ul>
              </>
            ) : (
              <p>
                For access, contact{' '}
                <a
                  href="mailto:support@ifrap.gov.pk"
                  className="text-emerald-400 hover:text-emerald-300 underline focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded"
                >
                  support@ifrap.gov.pk
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
