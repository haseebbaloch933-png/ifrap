'use client';

import { useState, useEffect } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

const showDemoAccounts = process.env.NODE_ENV !== 'production';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Default: assume credentials, no SSO — matches the no-SSO deployment and
  // avoids a UI flash before getProviders() resolves. Updated on mount.
  const [ssoProvider, setSsoProvider] = useState<{ id: string; name: string } | null>(null);
  const [hasCredentials, setHasCredentials] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    getProviders()
      .then((providers) => {
        if (!active || !providers) return;
        const oidc = (providers as any).oidc;
        setSsoProvider(oidc ? { id: oidc.id, name: oidc.name } : null);
        setHasCredentials(Boolean((providers as any).credentials));
      })
      .catch(() => {
        /* keep the credentials-only default if discovery fails */
      });
    return () => {
      active = false;
    };
  }, []);

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

          {ssoProvider && (
            <div className="space-y-4 mb-6">
              <button
                type="button"
                onClick={() => signIn(ssoProvider.id, { callbackUrl: '/telemetry' })}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-white text-slate-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                Sign in with {ssoProvider.name}
              </button>
              {hasCredentials && (
                <div className="flex items-center gap-3" aria-hidden="true">
                  <span className="h-px flex-1 bg-slate-800" />
                  <span className="text-xs text-slate-500 uppercase tracking-wider">or</span>
                  <span className="h-px flex-1 bg-slate-800" />
                </div>
              )}
            </div>
          )}

          {hasCredentials && (
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
          )}

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
